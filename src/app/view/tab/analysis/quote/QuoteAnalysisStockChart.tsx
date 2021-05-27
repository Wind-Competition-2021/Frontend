import { DateTime } from "luxon";
import React from "react";
import { Grid, Header, Table } from "semantic-ui-react";
import { RealTimeDataByDay, RealTimeDataByWeek } from "../../../../client/types";
import { convertNumbers, unwrapPercent } from "../../../../common/Util";
import {StockCandleChart} from "../../stock/StockCandleChart";

const QuoteAnalysisStockChart: React.FC<{
    realTimeDataByDay: RealTimeDataByDay[];
    realTimeDataByWeek: RealTimeDataByWeek[];
}> = ({
    realTimeDataByDay, realTimeDataByWeek
}) => {

        return <Grid columns="1">
            <Grid.Column>
                <Header as="h4">
                    日K线数据
                </Header>
                <StockCandleChart generalData={realTimeDataByDay.map(item => ({
                    ...item, label: DateTime.fromISO(item.date).toFormat("MM/dd")
                }))}></StockCandleChart>
            </Grid.Column>
            <Grid.Column>
                <Header as="h4">
                    周数据
                </Header>
                <div style={{ overflowY: "scroll", height: "300px" }}>
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>日期</Table.HeaderCell>
                                <Table.HeaderCell>开盘价</Table.HeaderCell>
                                <Table.HeaderCell>收盘价</Table.HeaderCell>
                                <Table.HeaderCell>最高价</Table.HeaderCell>
                                <Table.HeaderCell>最低价</Table.HeaderCell>
                                <Table.HeaderCell>成交量</Table.HeaderCell>
                                <Table.HeaderCell>成交额</Table.HeaderCell>
                                <Table.HeaderCell>换手率</Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {realTimeDataByWeek.map((item, i) => (
                                <Table.Row key={i}>
                                    {[
                                        DateTime.fromISO(item.date).toFormat("yyyy-MM-dd"),
                                        convertNumbers(item.opening, true),
                                        convertNumbers(item.closing, true),
                                        convertNumbers(item.highest, true),
                                        convertNumbers(item.lowest, true),
                                        convertNumbers(item.volume, false),
                                        convertNumbers(item.turnover, true),
                                        unwrapPercent(item.turnoverRate).display
                                    ].map((val, j) => <Table.Cell key={j}>{val}</Table.Cell>)}
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table>
                </div>
            </Grid.Column>
        </Grid>;
    };

export default QuoteAnalysisStockChart;
