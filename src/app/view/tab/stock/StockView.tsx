import { useDocumentTitle } from "../../../common/Util";
import { Divider, Input, Grid, Dimmer, Placeholder, Loader } from "semantic-ui-react";
import { client } from "../../../client/WindClient";
import { RealTimeDataByDay, StockBasicInfo, StockList, StockListItem, StockTrendList } from "../../../client/types";
import { Layout } from "./StockViewLayout";
import "./StockView.css"
import _ from "lodash";
import StockViewSearchModal from "./StockSearchModal";
import StockListChart from "./StockListChart";
import { useEffect, useState } from "react";
import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { makeCurrentStockAction, StateType } from "../../../state/Manager";
import StockCandleChart from "./StockCandleChart";
import SingleStockTrendChart from "./SingleStockTrendChart";
import { DateTime } from "luxon";
const stockListComparor = (x: StockListItem, y: StockListItem) => {
    if (x.pinned === y.pinned) return y.closing - y.preClosing > x.closing - x.preClosing ? 1 : -1;
    return x.pinned > y.pinned ? -1 : 1;
};
const StockView: React.FC<{}> = () => {
    useDocumentTitle("实时报价");
    /**
     * 证券列表数据
     */
    const [stockList, setStockList] = useState<StockList | null>(null);
    /**
     * 当前选中的股票ID
     */
    const [currentStock, setCurrentStock] = useState<string | null>(null);
    /**
     * 用以绘制日K线
     */
    const [realTimeDataByDay, setRealTimeDataByDay] = useState<RealTimeDataByDay[] | null>(null);
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

    /**
     * 页面加载完成，添加一个总的接受股票列表更新的监听器
     */
    useEffect(() => {
        if (inTradeTime) {
            console.log("Connecting stock list socket..")
            const token = client.addStockListUpdateListener((val) => {
                val.sort(stockListComparor);
                setStockList(val);
                setStockListSocketLoaded(true);
            });
            return () => {
                client.removeStockListUpdateListener(token);
            };
        }
    }, [inTradeTime]);
    /**
     * 当前股票更新时，更改单只股票用的Socket
     */
    useEffect(() => {
        if (currentStock != null && inTradeTime) {
            setStockTrendList([]);
            setSingleListLoading(true);
            client.connectSingleStockSocket(currentStock);
            console.log("Connecting single socket:", currentStock);
            const token = client.addSingleStockTrendUpdateListener(val => {
                console.log("single update", val);
                setStockTrendList(s => [...(s || []), ...val]);
                setSingleListLoading(false);
            });
            client.getStockDayHistory(currentStock).then(resp => setRealTimeDataByDay(resp));

            return () => {
                client.removeSingleStockTrendUpdateListener(token);
                client.disconnectSingleStockSocket();
            };
        }
        // eslint-disable-next-line
    }, [currentStock, inTradeTime]);

    /**
     * 执行股票搜索(点击按钮或者按下回车)
     */
    const doStockSearch = () => {
        setMatchedStocks(_.take(client
            .getLocalSimpleStockBasicInfoList().filter(x => (x.id.includes(searchText) || x.name.includes(searchText))), 100));
        setShowingSearchModal(true);

    };
    return <>
        <div>
            <Dimmer active={!inTradeTime}>
                <div>当前不在交易时间，本页面已停用。请前往行情分析页面。</div>
            </Dimmer>
            <Dimmer active={!stockListSocketLoaded && inTradeTime}>
                <Loader>建立连接中...</Loader>
            </Dimmer>

            <Grid columns="2">
                <Grid.Column width="8">
                    <Input action={{
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
                </Grid.Column>
                <Grid.Column />
            </Grid>
            <Divider></Divider>
            <Layout
                name="default"
                candleChart={
                    (() => {
                        if (singleListLoading && inTradeTime) {
                            return <Dimmer active>
                                <Loader>加载中</Loader>
                            </Dimmer>
                        }
                        if (inTradeTime) {
                            return realTimeDataByDay ? <StockCandleChart generalData={realTimeDataByDay.map(item => ({
                                ...item, label: DateTime.fromISO(item.date).toFormat("MM/dd")
                            }))}></StockCandleChart> : <div></div>;
                        } else {
                            return <Placeholder>
                                {_.times(10, (i) => <Placeholder.Line key={i}></Placeholder.Line>)}
                            </Placeholder>;
                        }
                    })()
                }
                singleTrend={
                    (() => {
                        if (singleListLoading && inTradeTime) {
                            return <div>
                                <div style={{ height: "300px" }}></div>
                                <Dimmer active>
                                    <Loader>加载中</Loader>
                                </Dimmer>
                            </div>
                        }
                        if (inTradeTime) {
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
                        if (inTradeTime) {
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
            ></Layout>
        </div>
        <StockViewSearchModal
            matchedStocks={matchedStocks}
            setShowingSearchModal={setShowingSearchModal}
            showingSearchModal={showingSearchModal}
        ></StockViewSearchModal>
    </>
};

export default StockView;