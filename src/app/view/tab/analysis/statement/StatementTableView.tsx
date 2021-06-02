import React from "react";
import { Dimmer, Divider, Table } from "semantic-ui-react";
import { DateIntervalDataBundle, QuarterDataBundle, StatementType, typeMapping } from "../../../../client/statement-types";
import { formats } from "./StatementTableUtility";


const StatementTableView: React.FC<{
    dateBundle: DateIntervalDataBundle;
    quarterBundle: QuarterDataBundle;
    type: StatementType;
}> = ({ dateBundle, quarterBundle, type }) => {
    const detail = typeMapping[type];
    console.log(dateBundle, quarterBundle);
    const current = detail.format === "date" ? dateBundle[type as keyof DateIntervalDataBundle] : quarterBundle[type as keyof QuarterDataBundle];
    const currentFormat = formats[type];
    console.log("current", current);
    console.log("type", type);
    console.log("detail", detail);
    return <div>
        {current === undefined && <Dimmer active>
            数据不存在
        </Dimmer>}
        <>
            <Table>
                <Table.Header>
                    <Table.Row>
                        <Table.HeaderCell>股票代码</Table.HeaderCell>
                        <Table.HeaderCell>发布日期</Table.HeaderCell>
                        <Table.HeaderCell>截止日期</Table.HeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {current && <Table.Row>
                        <Table.Cell>{current.id}</Table.Cell>
                        <Table.Cell>{current.publishDate}</Table.Cell>
                        <Table.Cell>{current.statDeadline}</Table.Cell>
                    </Table.Row>}
                </Table.Body>
            </Table>
            <Divider>
            </Divider>
            <Table>
                <Table.Header>
                    <Table.Row>
                        {currentFormat.map((x: { key: string; title: string }) => <Table.HeaderCell key={x.key}>
                            {x.title}
                        </Table.HeaderCell>)}
                    </Table.Row>
                </Table.Header>
                <Table.Body>{current && <Table.Row>
                    {currentFormat.map((x: { key: string; mapper: (s: any) => string | number | null; }) => <Table.Cell key={x.key}>
                        {(() => {
                            let val = x.mapper(current);
                            if (val === null || val === undefined) {
                                return "数据不存在";
                            } else
                                if (typeof val == "number") {
                                    return `${(val as number).toFixed(2)}%`;
                                } else return val as string;
                        })()}
                    </Table.Cell>)}
                </Table.Row>}</Table.Body>
            </Table>
        </>

    </div>;
};

export default StatementTableView;
