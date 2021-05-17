import React, { useEffect, useState } from "react";
import { Table } from "semantic-ui-react";
import { convertNumbers, useDocumentTitle } from "../../common/Util";
import { Container, Button, Divider, Input, Grid, Modal, Checkbox, Icon } from "semantic-ui-react";
import { client } from "../../client/WindClient";
import { PriceSummaryList, StockBasicInfo, StockList, StockListItem, StockTrendList } from "../../client/types";
import { Layout } from "./StockViewLayout";
import "./StockView.css"
import _ from "lodash";
const StockView: React.FC<{}> = () => {
    // const [darkMode, setDarkMode] = useDarkMode();
    useDocumentTitle("主页");
    const [loaded, setLoaded] = useState(false);
    const [stockList, setStockList] = useState<StockList | null>(null);
    const [currentStock, setCurrentStock] = useState<string | null>(null);
    const [priceSummaryList, setPriceSummaryList] = useState<PriceSummaryList | null>(null);
    const [stockTrendList, setStockTrendList] = useState<StockTrendList | null>(null);
    const [searchText, setSearchText] = useState("");
    const [showingSearchModal, setShowingSearchModal] = useState(false);
    const [matchedStocks, setMatchedStocks] = useState<(StockBasicInfo)[]>([]);
    const [currentPinned, setCurrentPinned] = useState<string[]>([]);
    const [searchModalButtonLoading, setSearchModalButtonLoading] = useState(false);
    /**
     * 页面加载完成，添加一个总的接受股票列表更新的监听器
     */
    useEffect(() => {
        if (loaded) {
            const token = client.addStockListUpdateListener((val) => {
                setStockList(val);
            });
            return () => client.removeStockListUpdateListener(token);
        }
    }, [loaded]);
    useEffect(() => {
        if (!loaded) {
            setLoaded(true);
        }
    }, [loaded]);
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
    const unwrapNumber = (num: string, multi10000 = false) => {
        return ({ value: multi10000 ? parseFloat(num) / 10000 : parseInt(num), display: convertNumbers(num, multi10000) });
    }
    /**
     * 渲染股票总信息上的一行
     * @param item 
     * @param i 行ID，从0开始
     * @returns 
     */
    const renderStockListLine = (item: StockListItem, i: number) => {
        return (<Table.Row cells={[{ active: item.stockID === currentStock }]} key={i} as={() => (
            <tr onDoubleClick={() => {
                console.log(item.stockID);
                setCurrentStock(item.stockID);
                setSearchText(item.stockID);
            }} style={{ cursor: "pointer" }}>
                {(() => {
                    const items = [
                        <>
                            {item.pinned && <Icon name="thumb tack"></Icon>}{i + 1}
                        </>,
                        item.stockID,
                        item.name,
                        convertNumbers(item.match, true),
                        null,
                        convertNumbers(item.high, true),
                        convertNumbers(item.low, true),
                        convertNumbers(item.volume),
                        convertNumbers(item.turnover)].map((itemx, i) => (<Table.Cell
                            key={i}
                            textAlign="right"
                            active={item.stockID === currentStock}
                        >{itemx}</Table.Cell>));
                    const { value, display } = unwrapNumber(item.range, true);
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
    return <>
        <Container>
            <Grid columns="2">
                <Grid.Column width="8">
                    <Input label="股票搜索" icon="search" input={<input value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="按回车键发起搜索" onKeyDown={e => {
                        if (e.code === "Enter") {
                            setMatchedStocks(_.take(client
                                .getLocalStockBasicInfoList().filter(x => (x.id.includes(searchText) || x.name.includes(searchText))), 100));
                            setCurrentPinned(client.getLocalConfig()!.pinnedStocks);
                            setSearchModalButtonLoading(false);
                            setShowingSearchModal(true);

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
        <Modal open={showingSearchModal}>
            <Modal.Header>
                搜索股票
            </Modal.Header>
            <Modal.Content>
                <div style={{ height: "500px", overflowY: "scroll" }}>
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>
                                    置顶
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    股票ID
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    股票名
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {(() => {
                                const pinned = new Set<string>(currentPinned);
                                return matchedStocks.map((item, i) => (<Table.Row key={i}>
                                    <Table.Cell>
                                        <Checkbox
                                            checked={pinned.has(item.id)}
                                            onClick={e => {
                                                if (pinned.has(item.id)) setCurrentPinned(currentPinned.filter(x => x !== item.id)); else setCurrentPinned([...currentPinned, item.id])
                                            }}
                                        ></Checkbox>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {item.id}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {item.name}
                                    </Table.Cell>
                                </Table.Row>))
                            })()}
                        </Table.Body>
                    </Table>
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button color="green" loading={searchModalButtonLoading} onClick={(e) => {
                    setSearchModalButtonLoading(true);
                    client.updateConfig({ ...client.getLocalConfig()!, pinnedStocks: currentPinned }).then(() => {
                        setSearchModalButtonLoading(false);
                        setShowingSearchModal(false);
                    });
                }}>
                    确认
                </Button>
                <Button color="red" onClick={() => {
                    setShowingSearchModal(false);
                }}>
                    取消
                </Button>

            </Modal.Actions>
        </Modal>
    </>
};

export default StockView;