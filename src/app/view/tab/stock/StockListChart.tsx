import React from "react";
import {
    Table, Icon, Button
} from "semantic-ui-react";
import { StockList, StockListItem } from "../../../client/types";
import { client } from "../../../client/WindClient";
import { convertNumbers, unwrapNumber } from "../../../common/Util";

/**
 * 渲染股票总信息上的一行
 * @param item 
 * @param i 行ID，从0开始
 * @returns 
 */
/**
 * 股票信息总列表
 */
const StockListChart: React.FC<{
    currentStock: string;
    setCurrentStock: (s: string) => void;
    stockList: StockList;
    refreshPinnedStocks: () => void;
}> = ({
    currentStock, setCurrentStock, stockList, refreshPinnedStocks
}) => {
        const renderStockListLine = (item: StockListItem, i: number) => {
            return (<Table.Row key={item.id} cells={[{ active: item.id === currentStock }]} as={() => (
                <tr onDoubleClick={() => {
                    console.log(item.id);
                    setCurrentStock(item.id);
                }} style={{ cursor: "pointer" }} key={item.id}>
                    {[
                        <>
                            {item.pinned && <Icon name="thumb tack"></Icon>}{i + 1}
                        </>,
                        item.id,
                        client.getStockBasicInfoByID(item.id)!.name,
                        convertNumbers(item.closing, true),
                        "",
                        convertNumbers(item.highest, true),
                        convertNumbers(item.lowest, true),
                        convertNumbers(item.volume),
                        convertNumbers(item.turnover, true),
                        <div>
                            {item.pinned ? <Button size="tiny" color="red" onClick={async () => {
                                const config = client.getLocalConfig()!;
                                config.pinnedStocks = config.pinnedStocks.filter(t => t !== item.id);

                                await client.updateConfig(config);
                                refreshPinnedStocks();
                            }}>
                                取消置顶</Button> : <Button size="tiny" color="green" onClick={async () => {
                                    const config = client.getLocalConfig()!;
                                    config.pinnedStocks.push(item.id);

                                    await client.updateConfig(config);
                                    refreshPinnedStocks();
                                }}>
                                添加置顶</Button>}
                        </div>].map((itemx, j) => {
                            if (j !== 4) {
                                return <Table.Cell
                                    key={j}
                                    textAlign="right"
                                    active={item.id === currentStock}
                                >{itemx}</Table.Cell>;
                            } else {
                                const { value, display } = unwrapNumber((item.closing - item.preClosing), true);
                                return <Table.Cell positive={value < 0} negative={value > 0} textAlign="right" key={j}>
                                    {display}
                                </Table.Cell>
                            }
                        })}
                </tr>
            )} />
            );
        }
        return <div style={{ overflowY: "scroll", maxHeight: "400px" }
        }>
            <Table>
                <Table.Header>
                    <Table.Row>
                        {["#", "股票代码", "股票名", "当前价格", "涨跌幅度", "最高价", "最低价", "成交量", "成交额", "置顶操作"].map((item, i) => (<Table.HeaderCell textAlign="right" key={i}>{item}</Table.HeaderCell>))}
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {(stockList || []).map(renderStockListLine)}
                </Table.Body>
            </Table>
        </div>;
    };

export default StockListChart;
