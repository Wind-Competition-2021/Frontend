import { toDateString, useDocumentTitle } from "../../../common/Util";
import { Divider, Input, Grid, Dimmer, Placeholder, Loader, Button, Statistic, Modal, Form } from "semantic-ui-react";
import { client, ReplayWrapper } from "../../../client/WindClient";
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
import ReplayConfigForm, { ReplayConfig } from "./ReplayConfigForm";

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

const StockView: React.FC<{}> = () => {
    useDocumentTitle("????????????");
    const today = DateTime.now();
    // const [currentShowType, setCurrentShowType] = useState<"replay" | "realtime">("realtime");
    /**
     * ??????????????????
     */
    const [stockList, setStockList] = useState<StockList | null>(null);
    /**
     * ?????????????????????ID
     */
    const [currentStock, setCurrentStock] = useState<string | null>(null);
    /**
     * ????????????????????????
     */
    const [stockTrendList, setStockTrendList] = useState<StockTrendList | null>(null);
    const [searchText, setSearchText] = useState("");
    const [showingSearchModal, setShowingSearchModal] = useState(false);
    const [matchedStocks, setMatchedStocks] = useState<(StockBasicInfo)[]>([]);
    const [stockListSocketLoaded, setStockListSocketLoaded] = useState(false);
    const [singleListLoading, setSingleListLoading] = useState(false);
    const [replayRunning, setReplayRunning] = useState(false);
    const dispatch = useDispatch();
    const updateGlobalCurrentStock = useCallback((text: string) => {
        dispatch(makeCurrentStockAction(text));
    }, [dispatch]);
    const inTradeTime = useSelector((s: StateType) => s.stockState.tradingTime);
    const [darkMode] = useDarkMode();
    /**
     * ????????????????????????
     */
    const [replaying, setReplaying] = useState(false);
    /**
     * ?????????????????????????????????dimmer
     */
    const nowShouldWork = inTradeTime || replaying;
    /**
     * ??????????????????????????????
     */
    // const nowCouldReplay = !inTradeTime;
    const [nowCouldReplay, setNowCouldReplay] = useState(false);
    // const [stockListReplayingTime, setReplayingTime] = useState<DateTime | null>(null);
    const [replayingTime, setReplayingTime] = useState<{ stockList?: DateTime; trendList?: DateTime } | null>({});
    /**
     * ????????????
     */
    const [replayConfig, setReplayConfig] = useState<ReplayConfig>({
        start: today.minus({ day: 1 }).toJSDate(),
        end: today.minus({ day: 1 }).toJSDate()
    });
    const [showInitReplayModal, setShowInitReplayModal] = useState(false);
    /**
     * ???????????????????????????????????????????????????????????????????????????
     */
    useEffect(() => {
        if (inTradeTime || replayRunning) {
            console.log("Connecting stock list socket..");
            setStockListSocketLoaded(false);
            let replayID: string | null = null;
            if (replaying) {
                client.connectStockListSocket("replay", toDateString(replayConfig.start), toDateString(replayConfig.end));
                replayID = client.addReplayFinishCallback(() => setReplayRunning(false));
            }
            else client.connectStockListSocket("realtime");

            const token = client.addStockListUpdateListener((val) => {
                const updateStockList = (list: StockList) => {
                    setStockList(l => {
                        if (l === null) return list;
                        const map = new Map<string, StockList[0]>();
                        l.forEach(x => map.set(x.id, x));
                        list.forEach(x => {
                            x.lowest = Math.min(x.lowest, map.get(x.id)?.lowest || Number.MAX_SAFE_INTEGER);
                            x.highest = Math.max(x.highest, map.get(x.id)?.highest || Number.MIN_SAFE_INTEGER);
                        })
                        return list;
                    });
                };
                if (replaying) {
                    const replayVal = (val as ReplayWrapper<StockList>).quotes;
                    setReplayingTime(c => ({
                        ...c,
                        stockList: DateTime.fromISO((val as ReplayWrapper<StockList>).time)
                    }));
                    replayVal.sort(stockListComparor);
                    // setStockList(replayVal);
                    updateStockList(replayVal);
                } else {
                    const realtimeVal = val as StockList;
                    realtimeVal.sort(stockListComparor);
                    // setStockList(realtimeVal);
                    updateStockList(realtimeVal);
                }

                setStockListSocketLoaded(true);
            });
            // setCurrentStock(null);
            return () => {
                client.removeStockListUpdateListener(token);
                client.disconnectStockListSocket();
                if (replayID) {
                    client.removeReplayFinishedCallback(replayID);
                }
            };
        }
    }, [nowShouldWork, replayConfig, replayRunning, inTradeTime, replaying]);
    /**
     * ????????????????????????????????????????????????Socket
     */
    useEffect(() => {
        if (currentStock != null && ((inTradeTime) || (replaying && replayRunning))) {
            setStockTrendList([]);
            setSingleListLoading(true);
            if (replaying) {
                client.connectSingleStockSocket(currentStock, "replay", toDateString(replayConfig.start), toDateString(replayConfig.end));
            } else {
                client.connectSingleStockSocket(currentStock, "realtime");
            }
            console.log("Connecting single socket:", currentStock);
            const token = client.addSingleStockTrendUpdateListener(val => {
                console.log("single update", val);
                if (replaying) {
                    const replayVal = (val as ReplayWrapper<StockTrendList>);
                    setReplayingTime(c => ({
                        ...c,
                        trendList: DateTime.fromISO((val as ReplayWrapper<StockTrendList>).time)
                    }));
                    if (replayVal.quotes.length > 0)
                        setStockTrendList(s => _.takeRight(filterStockTrendList([...(s || []), ...replayVal.quotes]), 90));
                } else {
                    const realtimeVal = val as StockTrendList;
                    if (realtimeVal.length > 0)
                        setStockTrendList(s => _.takeRight(filterStockTrendList([...(s || []), ...realtimeVal]), 90));
                }

                setSingleListLoading(false);
            });

            return () => {
                client.removeSingleStockTrendUpdateListener(token);
                client.disconnectSingleStockSocket();
            };
        }
    }, [currentStock, nowShouldWork, replayConfig, replaying, replayRunning, inTradeTime]);

    /**
     * ??????????????????(??????????????????????????????)
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
                <div>???????????????????????????????????????????????????????????? <Button size="tiny" color="black" onClick={() => setShowInitReplayModal(true)}>??????</Button></div>
            </Dimmer>
            <Dimmer active={!stockListSocketLoaded && nowShouldWork}>
                <Loader>???????????????...</Loader>
            </Dimmer>

            <div >
                <Grid doubling stackable columns="3">
                    {(!(nowCouldReplay && !replaying)) && <Grid.Column width="4">
                        <Input className={darkMode ? "dark-mode" : ""} action={{
                            labelPosition: "right",
                            icon: "search",
                            content: "????????????",
                            onClick: doStockSearch
                        }} input={<input value={searchText} onChange={e => {
                            setSearchText(e.target.value)
                        }} placeholder="????????????????????????" onKeyDown={e => {
                            if (e.code === "Enter") {
                                doStockSearch();
                            }
                        }}>
                        </input>}></Input>
                    </Grid.Column>}
                    <Grid.Column width="8" >
                        <Grid columns="2" centered>
                            <Grid.Column>{replayRunning && <Statistic size="tiny" horizontal>
                                <Statistic.Value>{replayingTime!.stockList?.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS)}</Statistic.Value>
                                {/* <Statistic.Label>????????????</Statistic.Label> */}
                            </Statistic>}</Grid.Column>
                        </Grid>
                    </Grid.Column>
                    <Grid.Column width="4">
                        <Grid columns="2" >
                            <Grid.Column width="16"> {nowCouldReplay && <ReplayConfigForm replaying={replayRunning} data={replayConfig} callback={cfg => {
                                setReplayConfig(cfg);
                                setReplaying(true);
                                setReplayRunning(true);
                                setStockListSocketLoaded(false);
                                // setSingleListLoading()
                            }} stopCallback={() => {
                                client.disconnectSingleStockSocket();
                                client.disconnectStockListSocket();
                                setReplayRunning(false);
                            }}></ReplayConfigForm>}</Grid.Column>
                        </Grid>
                    </Grid.Column>
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
                                        return currentStock ? <WrappedStockCandleChart stock={currentStock} key={currentStock} beginDate={replaying ? replayConfig.start : undefined} endDate={replaying ? replayConfig.end : undefined} ></WrappedStockCandleChart> : <div></div>;
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
                                                <Loader>?????????</Loader>
                                            </Dimmer>
                                        </div>
                                    }
                                    if (nowShouldWork) {
                                        return stockTrendList ? <div><SingleStockTrendChart
                                            data={stockTrendList}
                                        ></SingleStockTrendChart>
                                        </div> : <div></div>;
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
                                                if (!inTradeTime && !replayRunning) return;
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
        <Modal size="mini" open={showInitReplayModal}>
            <Modal.Header>????????????</Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Field>
                        <label>????????????</label>
                        <DayPickerInput dayPickerProps={{ className: "most-top" }} value={replayConfig.start} onDayChange={d => setReplayConfig(c => ({ ...c, start: d }))}></DayPickerInput>
                    </Form.Field>
                    <Form.Field>
                        <label>????????????</label>
                        <DayPickerInput dayPickerProps={{ className: "most-top" }} value={replayConfig.end} onDayChange={d => setReplayConfig(c => ({ ...c, end: d }))}></DayPickerInput>
                    </Form.Field>
                </Form>
            </Modal.Content>
            <Modal.Actions>
                <Button color="red" onClick={() => setShowInitReplayModal(false)}>
                    ??????
                </Button>
                <Button color="blue" onClick={() => {
                    setShowInitReplayModal(false);
                    setReplaying(true);
                    setReplayRunning(true);
                    setNowCouldReplay(true);
                    setStockListSocketLoaded(false);
                }}>
                    ??????
                </Button>
            </Modal.Actions>
        </Modal>
    </>
};

export default StockView;