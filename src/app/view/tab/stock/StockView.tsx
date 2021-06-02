import { toDateString, useDocumentTitle } from "../../../common/Util";
import { Divider, Input, Grid, Dimmer, Placeholder, Loader,  Form, Button } from "semantic-ui-react";
import { client } from "../../../client/WindClient";
import { StockBasicInfo, StockList, StockListItem, StockTrendList } from "../../../client/types";
import { Layout } from "./StockViewLayout";
import "./StockView.css"
import _ from "lodash";
import StockViewSearchModal from "./StockSearchModal";
import StockListChart from "./StockListChart";
import { useEffect, useState } from "react";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeCurrentStockAction, StateType } from "../../../state/Manager";
import { WrappedStockCandleChart } from "./StockCandleChart";
import SingleStockTrendChart from "./SingleStockTrendChart";
import { DateTime } from "luxon";
import { useDarkMode } from "../../../state/Util";
import DayPickerInput from "react-day-picker/DayPickerInput";
const stockListComparor = (x: StockListItem, y: StockListItem) => {
    if (x.pinned === y.pinned) return (y.closing - y.preClosing) / y.preClosing > (x.closing - x.preClosing) / x.preClosing ? 1 : -1;
    return x.pinned > y.pinned ? -1 : 1;
};

function filterStockTrendList(input: StockTrendList): StockTrendList {
    const result: StockTrendList = [];
    let lastTime: DateTime | null = null;
    for (const item of input) {
        if (result.length === 0) {
            result.push(item);
            lastTime = DateTime.fromISO(_.last(result)!.time).set({ second: 0 });
        } else {
            const currTime = DateTime.fromISO(item.time).set({ second: 0 });
            if (currTime.diff(lastTime!, "minutes").minutes >= 1) {
                result.push(item);
            } else {
                result[result.length - 1] = item;
            }
            lastTime = currTime;
        }
    }
    return result;
}
interface ReplayConfig {
    start: Date;
    end: Date;
    speed: number;
}

const ReplayConfigForm: React.FC<{ data: ReplayConfig; callback: (d: ReplayConfig) => void }> = ({ callback, data }) => {
    const [config, setConfig] = useState(data);
    return <Form>
        <Form.Group>
            <Form.Field>
                <label>开始日期</label>
                <DayPickerInput dayPickerProps={{ className: "most-top" }} value={config.start} onDayChange={d => setConfig({ ...config, start: d })}></DayPickerInput>
            </Form.Field>
            <Form.Field >
                <label>结束日期</label>
                <DayPickerInput dayPickerProps={{ className: "most-top" }} value={config.end} onDayChange={d => setConfig({ ...config, end: d })}></DayPickerInput>
            </Form.Field>
            <Form.Field >
                <label>回放速度</label>
                <Input type="number" value={config.speed} onChange={e => setConfig({ ...config, speed: parseInt(e.target.value) })}></Input>
            </Form.Field>
            <Form.Field >
                <label>操作</label>
                <Form.Button color="green" size="tiny" onClick={() => callback(config)}>
                    开始重放
                </Form.Button>
            </Form.Field>
        </Form.Group>
    </Form>;
};

const StockView: React.FC<{}> = () => {
    useDocumentTitle("实时报价");
    const today = DateTime.now();
    /**
     * 证券列表数据
     */
    const [stockList, setStockList] = useState<StockList | null>(null);
    /**
     * 当前选中的股票ID
     */
    const [currentStock, setCurrentStock] = useState<string | null>(null);
    /**
     * 用以展示实时情况
     */
    const [stockTrendList, setStockTrendList] = useState<StockTrendList | null>(null);
    const [searchText, setSearchText] = useState("");
    const [showingSearchModal, setShowingSearchModal] = useState(false);
    const [matchedStocks, setMatchedStocks] = useState<(StockBasicInfo)[]>([]);
    const [stockListSocketLoaded, setStockListSocketLoaded] = useState(false);
    const [singleListLoading, setSingleListLoading] = useState(false);
    const dispatch = useDispatch();
    const updateGlobalCurrentStock = useCallback((text: string) => {
        dispatch(makeCurrentStockAction(text));
    }, [dispatch]);
    const inTradeTime = useSelector((s: StateType) => s.stockState.tradingTime);
    const [darkMode] = useDarkMode();
    /**
     * 当前是否正在回放
     */
    const [replaying, setReplaying] = useState(false);
    /**
     * 当前是否不该显示不工作dimmer
     */
    const nowShouldWork = inTradeTime || replaying;
    /**
     * 当前是否可以进行回放
     */
    // const nowCouldReplay = !inTradeTime;
    const [nowCouldReplay, setNowCouldReplay] = useState(false);
    /**
     * 回放设置
     */
    const [replayConfig, setReplayConfig] = useState<ReplayConfig>({
        start: today.minus({ day: 1 }).toJSDate(),
        end: today.minus({ day: 1 }).toJSDate(),
        speed: 10
    });
    /**
     * 页面加载完成，添加一个总的接受股票列表更新的监听器
     */
    useEffect(() => {
        if (nowShouldWork) {
            console.log("Connecting stock list socket..");
            setStockListSocketLoaded(false);
            if (replaying)
                client.connectStockListSocket("replay", toDateString(replayConfig.start), toDateString(replayConfig.end), replayConfig.speed);
            else client.connectStockListSocket("realtime");

            const token = client.addStockListUpdateListener((val) => {
                val.sort(stockListComparor);
                setStockList(val);
                setStockListSocketLoaded(true);
            });
            setCurrentStock(null);
            return () => {
                client.removeStockListUpdateListener(token);
                client.disconnectStockListSocket();
            };
        }
    }, [nowShouldWork, replayConfig, replaying]);
    /**
     * 当前股票更新时，更改单只股票用的Socket
     */
    useEffect(() => {
        if (currentStock != null && nowShouldWork) {
            setStockTrendList([]);
            setSingleListLoading(true);
            if (replaying) {
                client.connectSingleStockSocket(currentStock, "replay", toDateString(replayConfig.start), toDateString(replayConfig.end), replayConfig.speed);
            } else { client.connectSingleStockSocket(currentStock, "realtime"); }
            console.log("Connecting single socket:", currentStock);
            const token = client.addSingleStockTrendUpdateListener(val => {
                console.log("single update", val);
                setStockTrendList(s => _.takeRight(filterStockTrendList([...(s || []), ...val]), 90));
                setSingleListLoading(false);
            });

            return () => {
                client.removeSingleStockTrendUpdateListener(token);
                client.disconnectSingleStockSocket();
            };
        }
    }, [currentStock, nowShouldWork, replayConfig, replaying]);

    /**
     * 执行股票搜索(点击按钮或者按下回车)
     */
    const doStockSearch = () => {
        setMatchedStocks(_.take(client
            .getLocalSimpleStockBasicInfoList().filter(x => (x.id.includes(searchText) || x.name.includes(searchText))), 100));
        setShowingSearchModal(true);
    };
    return <>
        <div
            style={darkMode ? {
                backgroundColor: "black"
            } : {}}

        >
            <Dimmer active={!inTradeTime && !nowCouldReplay}>
                <div>当前不在交易时间，本页面已停用。您可以 <Button size="tiny" color="black" onClick={() => setNowCouldReplay(true)}>重放</Button></div>
            </Dimmer>
            <Dimmer active={!stockListSocketLoaded && nowShouldWork}>
                <Loader>建立连接中...</Loader>
            </Dimmer>

            <div >
                <Grid columns="2" >
                    {(!(nowCouldReplay && !replaying)) && <Grid.Column width="6">
                        <Input className={darkMode ? "dark-mode" : ""} action={{
                            labelPosition: "right",
                            icon: "search",
                            content: "股票搜索",
                            onClick: doStockSearch
                        }} input={<input value={searchText} onChange={e => {
                            setSearchText(e.target.value)
                        }} placeholder="按回车键发起搜索" onKeyDown={e => {
                            if (e.code === "Enter") {
                                doStockSearch();
                            }
                        }}>
                        </input>}></Input>
                    </Grid.Column>}
                    <Grid.Column width="10">
                        {nowCouldReplay && <ReplayConfigForm data={replayConfig} callback={cfg => { setReplayConfig(cfg); setReplaying(true); }}></ReplayConfigForm>}
                    </Grid.Column>
                    {/* <Grid.Column >
                        <Checkbox className={darkMode ? "dark-mode" : ""} toggle checked={darkMode} onChange={(_, d) => setDarkMode(d.checked!)} label="暗色模式"></Checkbox>
                    </Grid.Column> */}
                </Grid>
            </div>
            <Divider></Divider>
            <div>
                <Grid columns="1">
                    <Grid.Column>
                        {(!(nowCouldReplay && !replaying)) && <Layout
                            name="default"
                            candleChart={
                                (() => {
                                    if (nowShouldWork) {
                                        return currentStock ? <WrappedStockCandleChart stock={currentStock} key={currentStock}></WrappedStockCandleChart> : <div></div>;
                                    } else {
                                        return <Placeholder>
                                            {_.times(10, (i) => <Placeholder.Line key={i}></Placeholder.Line>)}
                                        </Placeholder>;
                                    }
                                })()
                            }
                            singleTrend={
                                (() => {
                                    if (singleListLoading && nowShouldWork) {
                                        return <div>
                                            <div style={{ height: "300px" }}></div>
                                            <Dimmer active>
                                                <Loader>加载中</Loader>
                                            </Dimmer>
                                        </div>
                                    }
                                    if (nowShouldWork) {
                                        return stockTrendList ? <SingleStockTrendChart
                                            data={stockTrendList}
                                        ></SingleStockTrendChart> : <div></div>;
                                    } else {
                                        return <Placeholder>
                                            {_.times(10, (i) => <Placeholder.Line key={i}></Placeholder.Line>)}
                                        </Placeholder>;
                                    }
                                })()
                            }
                            stockList={
                                (() => {
                                    if (nowShouldWork) {
                                        return <StockListChart
                                            currentStock={currentStock!}
                                            setCurrentStock={(x) => {
                                                setCurrentStock(x);
                                                setSearchText(x);
                                                updateGlobalCurrentStock(x);
                                            }}
                                            stockList={stockList!}
                                            refreshPinnedStocks={() => {
                                                const pinned = new Set(client.getLocalConfig()?.pinnedStocks);
                                                const data = stockList!.map(i => ({ ...i, pinned: pinned.has(i.id) }));
                                                data.sort(stockListComparor);
                                                setStockList(data);
                                            }}
                                        ></StockListChart>;
                                    } else {
                                        return <Placeholder fluid>
                                            {_.times(20, (i) => <Placeholder.Line key={i}></Placeholder.Line>)}
                                        </Placeholder>;
                                    }
                                })()
                            }
                        ></Layout>}
                    </Grid.Column>
                </Grid>
            </div>
        </div>
        <StockViewSearchModal
            matchedStocks={matchedStocks}
            setShowingSearchModal={setShowingSearchModal}
            showingSearchModal={showingSearchModal}
        ></StockViewSearchModal>
    </>
};

export default StockView;