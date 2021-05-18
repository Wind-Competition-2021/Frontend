import React from "react";
import { Table } from "semantic-ui-react";
import { StockInfo } from "../../../../client/types";

const QuoteAnalysisStockDetail: React.FC<{ stockInfo: StockInfo }> = ({ stockInfo }) => {
    return <Table>
        <Table.Header>
            <Table.Row>
                <Table.HeaderCell>
                    股票代码
                </Table.HeaderCell>
                <Table.HeaderCell>
                    股票名
                </Table.HeaderCell>
                <Table.HeaderCell>
                    股票类型
                </Table.HeaderCell>
                <Table.HeaderCell>
                    行业
                </Table.HeaderCell>
                <Table.HeaderCell>
                    分类
                </Table.HeaderCell>
                <Table.HeaderCell>
                    上市日期
                </Table.HeaderCell>
                <Table.HeaderCell>
                    退市日期
                </Table.HeaderCell>
            </Table.Row>
        </Table.Header>
        <Table.Body>
            <Table.Row>
                <Table.Cell>{stockInfo.id}</Table.Cell>
                <Table.Cell>{stockInfo.name}</Table.Cell>
                <Table.Cell>{{ index: "指数", stock: "股票" }[stockInfo.type]}</Table.Cell>
                <Table.Cell>{stockInfo.industry}</Table.Cell>
                <Table.Cell>{stockInfo.classification}</Table.Cell>
                <Table.Cell>{stockInfo.listedDate}</Table.Cell>
                <Table.Cell>{stockInfo.delistedDate}</Table.Cell>
            </Table.Row>
        </Table.Body>
    </Table>;
};

export default QuoteAnalysisStockDetail;