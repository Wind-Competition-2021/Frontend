import React, { useEffect, useState } from "react";
import { Table } from "semantic-ui-react";
import { convertNumbers, useDocumentTitle } from "../../common/Util";
import { Container, Divider, Input, Grid, Icon } from "semantic-ui-react";
import { client } from "../../client/WindClient";
import { RealTimeDataByDay, StockBasicInfo, StockList, StockListItem, StockTrendList } from "../../client/types";
import { Layout } from "./StockViewLayout";
import "./StockView.css"
import _ from "lodash";
import StockViewSearchModal from "./StockSearchModal";
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
    const [realStockTrendList, setStockTrendList] = useState<StockTrendList | null>(null);
    const [searchText, setSearchText] = useState("");
    const [showingSearchModal, setShowingSearchModal] = useState(false);
    const [matchedStocks, setMatchedStocks] = useState<(StockBasicInfo)[]>([]);
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
            // client.getPriceSummaryList(currentStock, undefined, undefined).then(resp => setPriceSummaryList(resp));
            return () => {
                client.removeSingleStockTrendUpdateListener(token);
                client.disconnectSingleStockSocket();
            };
        }
    }, [currentStock]);
    /**
     * 拆包一个字符串表示的数，返回其浮点值和字符串表示的精确值
     * @param num 数字，用字符串表示
     * @param multi10000 这个数字是否是乘过10000的
     * @returns 
     */
    const unwrapNumber = (num: number, multi10000 = false) => {
        return ({ value: multi10000 ? num / 10000 : num, display: convertNumbers(num, multi10000) });
    }
    /**
     * 渲染股票总信息上的一行
     * @param item 
     * @param i 行ID，从0开始
     * @returns 
     */
    const renderStockListLine = (item: StockListItem, i: number) => {
        return (<Table.Row cells={[{ active: item.id === currentStock }]} key={i} as={() => (
            <tr onDoubleClick={() => {
                console.log(item.id);
                setCurrentStock(item.id);
                setSearchText(item.id);
            }} style={{ cursor: "pointer" }}>
                {(() => {
                    const items = [
                        <>
                            {item.pinned && <Icon name="thumb tack"></Icon>}{i + 1}
                        </>,
                        item.id,
                        client.getStockBasicInfoByID(item.id)!.name,
                        convertNumbers(item.closing, true),
                        null,
                        convertNumbers(item.highest, true),
                        convertNumbers(item.lowest, true),
                        convertNumbers(item.volume),
                        convertNumbers(item.turnover)].map((itemx, i) => (<Table.Cell
                            key={i}
                            textAlign="right"
                            active={item.id === currentStock}
                        >{itemx}</Table.Cell>));
                    const { value, display } = unwrapNumber((item.closing - item.preClosing), true);
                    items[4] = <Table.Cell positive={value < 0} negative={value > 0} textAlign="right" key={4}>
                        {display}
                    </Table.Cell>
                    return items;
                })()}
            </tr>
        )} />

        );
    }
    /**
     * 股票信息总列表
     */
    const stockListChart = <div style={{ overflowY: "scroll", maxHeight: "500px" }
    }>
        <Table>
            <Table.Header>
                <Table.Row>
                    {["#", "股票代码", "股票名", "当前价格", "涨跌幅度", "最高价", "最低价", "成交量", "成交额"].map((item, i) => (<Table.HeaderCell textAlign="right" key={i}>{item}</Table.HeaderCell>))}
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {(stockList || []).map(renderStockListLine)}
            </Table.Body>
        </Table>
    </div>;
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
                    }} input={<input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="按回车键发起搜索" onKeyDown={e => {
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
                candleChart={<div></div>}
                singleTrend={<div></div>}
                stockList={stockListChart}
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