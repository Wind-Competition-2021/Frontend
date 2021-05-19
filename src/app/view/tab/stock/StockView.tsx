import { useDocumentTitle } from "../../../common/Util";
import { Container, Divider, Input, Grid } from "semantic-ui-react";
import { client } from "../../../client/WindClient";
import { RealTimeDataByDay, StockBasicInfo, StockList, StockTrendList } from "../../../client/types";
import { Layout } from "./StockViewLayout";
import "./StockView.css"
import _ from "lodash";
import StockViewSearchModal from "./StockSearchModal";
import StockListChart from "./StockListChart";
import { useEffect, useState } from "react";
import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { makeCurrentStockAction } from "../../../state/Manager";
import StockCandleChart from "./StockCandleChart";
import SingleStockTrendChart from "./SingleStockTrendChart";
const StockView: React.FC<{}> = () => {
    useDocumentTitle("证券");
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
    const dispatch = useDispatch();
    const updateGlobalCurrentStock = useCallback((text: string) => {
        dispatch(makeCurrentStockAction(text));
    }, [dispatch]);
    /**
     * 页面加载完成，添加一个总的接受股票列表更新的监听器
     */
    useEffect(() => {
        const token = client.addStockListUpdateListener((val) => {
            setStockList(val);
        });
        return () => client.removeStockListUpdateListener(token);
    }, []);
    /**
     * 当前股票更新时，更改单只股票用的Socket
     */
    useEffect(() => {
        if (currentStock != null) {
            // client.connectSingleStockSocket(currentStock);
            const token = client.addSingleStockTrendUpdateListener(val => {
                console.log("single update", val);
                setStockTrendList(val);
            });
            client.getStockDayHistory(currentStock).then(resp => setRealTimeDataByDay(resp));
            return () => {
                client.removeSingleStockTrendUpdateListener(token);
                client.disconnectSingleStockSocket();
            };
        }
    }, [currentStock]);

    /**
     * 执行股票搜索(点击按钮或者按下回车)
     */
    const doStockSearch = () => {
        setMatchedStocks(_.take(client
            .getLocalStockBasicInfoList().filter(x => (x.id.includes(searchText) || x.name.includes(searchText))), 100));
        setShowingSearchModal(true);

    };
    return <>
        <Container>
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
                    realTimeDataByDay ? <StockCandleChart
                        data={realTimeDataByDay}
                    ></StockCandleChart> : <div></div>
                }
                singleTrend={
                    stockTrendList ? <SingleStockTrendChart
                        data={stockTrendList}
                    ></SingleStockTrendChart> : <div></div>
                }
                stockList={<StockListChart
                    currentStock={currentStock!}
                    setCurrentStock={(x) => {
                        setCurrentStock(x);
                        setSearchText(x);
                        updateGlobalCurrentStock(x);
                    }}
                    stockList={stockList!}
                ></StockListChart>}
            ></Layout>
        </Container>
        <StockViewSearchModal
            matchedStocks={matchedStocks}
            setShowingSearchModal={setShowingSearchModal}
            showingSearchModal={showingSearchModal}
        ></StockViewSearchModal>
    </>
};

export default StockView;