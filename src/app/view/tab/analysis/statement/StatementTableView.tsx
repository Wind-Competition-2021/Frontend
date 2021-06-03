import _ from "lodash";
import { DateTime } from "luxon";
import React, { ReactNode } from "react";
import { Grid, Table } from "semantic-ui-react";
import { DateFormat, DateIntervalDataBundle, QuarterDataBundle, StatementType, typeMapping, typeSequence } from "../../../../client/statement-types";
import { toDateString } from "../../../../common/Util";
import { formats } from "./StatementTableUtility";


const SingleStatementTable: React.FC<{
    dateBundle: DateIntervalDataBundle;
    quarterBundle: QuarterDataBundle;
    type: StatementType;
    title: string;
    attach: "bottom" | "top" | boolean | undefined;
}> = ({ dateBundle, quarterBundle, type, title, attach }) => {
    const detail = typeMapping[type];
    // console.log(dateBundle, quarterBundle);
    const current = detail.format === "date" ? dateBundle[type as keyof DateIntervalDataBundle] : quarterBundle[type as keyof QuarterDataBundle];
    const currentFormat = formats[type];
    // console.log("current", current);
    // console.log("type", type);
    // console.log("detail", detail);
    return (current === undefined) ? (<div style={{ height: "200px" }}>
        <Grid columns="3" centered>
            <Grid.Column>数据不存在</Grid.Column>
        </Grid>
    </div>) : (<Table attached={attach}>
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
    </Table>)
};

const StatementTableView: React.FC<{
    dateBundle: DateIntervalDataBundle;
    quarterBundle: QuarterDataBundle;
    dateFormat: DateFormat;
}> = ({ dateBundle, dateFormat, quarterBundle }) => {
    const generalData: { id?: string; publishDate?: string; statDeadline?: string; } = {};
    _.merge(generalData, ..._.values(dateBundle), ..._.values(quarterBundle));

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
                    <Table.Cell>{generalData.id || "数据不存在"}</Table.Cell>
                    <Table.Cell>{generalData.publishDate ? toDateString(DateTime.fromISO(generalData.publishDate).toJSDate()) : "数据不存在"}</Table.Cell>
                    <Table.Cell>{generalData.statDeadline ? toDateString(DateTime.fromISO(generalData.statDeadline).toJSDate()) : "数据不存在"}</Table.Cell>
                </Table.Row>
            </Table.Body>
        </Table>
        {(() => {
            const items = typeSequence.filter(x => typeMapping[x].format === dateFormat);
            const result: ReactNode[] = [];
            for (let i = 0; i < items.length; i++) {
                const type = items[i];
                let currAttach: boolean | "top" | "bottom" = true;
                if (i === 0) currAttach = "top";
                else if (i === items.length - 1) currAttach = "bottom";
                result.push(<div key={type}>
                    {/* <Header as="h5">
                        {typeMapping[type].title}
                    </Header> */}
                    <SingleStatementTable
                        dateBundle={dateBundle}
                        quarterBundle={quarterBundle}
                        title={typeMapping[type].title}
                        type={type}
                        attach={currAttach}
                    ></SingleStatementTable>
                </div>);
            }
            return result;
        })()}
    </div>;
};

export default StatementTableView;
