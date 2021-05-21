import React from "react";
import { Divider, Table } from "semantic-ui-react";
import { DateIntervalDataBundle, QuarterDataBundle, StatementType, typeMapping } from "../../../../client/statement-types";

interface FormatMapping<T = string> {
    title: string;
    mapper: (val: T) => string;
};
// const formats={
//     cashFlow:[{title:""}]
// } as Record<StatementType,FormatMapping>
const StatementTableView: React.FC<{
    dateBundle: DateIntervalDataBundle;
    quarterBundle: QuarterDataBundle;
    type: StatementType
}> = ({ dateBundle, quarterBundle, type }) => {
    const detail = typeMapping[type];
    const current = detail.format === "date" ? dateBundle[type as keyof DateIntervalDataBundle] : quarterBundle[type as keyof QuarterDataBundle];

    return <div>
        <Table>
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell>股票代码</Table.HeaderCell>
                    <Table.HeaderCell>发布日期</Table.HeaderCell>
                    <Table.HeaderCell>截止日期</Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                <Table.Row>
                    <Table.Cell>{current.id}</Table.Cell>
                    <Table.Cell>{current.publishDate}</Table.Cell>
                    <Table.Cell>{current.statDeadline}</Table.Cell>
                </Table.Row>
            </Table.Body>
        </Table>
        <Divider>

        </Divider>
    </div>;
};

export default StatementTableView;
