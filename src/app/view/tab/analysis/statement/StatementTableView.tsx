import _ from "lodash";
import { DateTime } from "luxon";
import React from "react";
import { Table } from "semantic-ui-react";
import { QuarterDataBundle, StatementBase, } from "../../../../client/statement-types";
import { toDateString } from "../../../../common/Util";
import AnalysisInformationItem from "../AnalysisInformationItem";
import { formats } from "./StatementTableUtility";

const ItemWrapper: React.FC<{ data: any, colSpan?: number, statement: StatementBase, newTitle?: React.ReactNode, centered?: boolean }> = ({
    newTitle, data, colSpan, statement, centered
}) => {
    return <AnalysisInformationItem
        title={newTitle === undefined ? data.title : newTitle}
        colSpan={colSpan}
        centered={centered}
    >
        {(() => {
            let val = data.mapper(statement);
            if (val === null) {
                return "数据不存在";
            } else
                if (typeof val == "number") {
                    return `${(val as number).toFixed(2)}%`;
                } else return val || "数据不存在" as string;
        })()}
    </AnalysisInformationItem>
};
const PoZhenRational: React.FC<{ num: string; dom: string }> = ({ dom, num }) => {
    return <>
        <div>{num}</div><div style={{ borderTop: "1px solid black" }}>{dom}</div>
    </>;
}
const StatementTableView: React.FC<{
    // dateBundle: DateIntervalDataBundle;
    quarterBundle: QuarterDataBundle;
    // dateFormat: DateFormat;
}> = ({ quarterBundle }) => {
    const generalData: { id?: string; publishDate?: string; statDeadline?: string; } = {};
    _.merge(generalData, ..._.values(quarterBundle));
    return <div>
        {/*每行9个block*/}
        <Table celled>
            <Table.Row>
                <AnalysisInformationItem title="报表信息" children={undefined} />
                <AnalysisInformationItem title="股票代码" >
                    {generalData.id}
                </AnalysisInformationItem>
                <AnalysisInformationItem title="发布日期" colSpan={2}>
                    {generalData.publishDate ? toDateString(DateTime.fromISO(generalData.publishDate).toJSDate()) : "数据不存在"}
                </AnalysisInformationItem>
                <AnalysisInformationItem title="截止日期" colSpan={2}>
                    {generalData.statDeadline ? toDateString(DateTime.fromISO(generalData.statDeadline).toJSDate()) : "数据不存在"}
                </AnalysisInformationItem>
            </Table.Row>
            <Table.Row>
                <AnalysisInformationItem title="盈利能力" rowSpan={2} children={undefined} />
                <ItemWrapper colSpan={1} data={formats.profitability.roe} statement={quarterBundle.profitability} ></ItemWrapper>
                <ItemWrapper colSpan={1} data={formats.profitability.npm} statement={quarterBundle.profitability} ></ItemWrapper>
                <ItemWrapper colSpan={1} data={formats.profitability.gpm} statement={quarterBundle.profitability} ></ItemWrapper>
                <ItemWrapper colSpan={1} data={formats.profitability.np} statement={quarterBundle.profitability} ></ItemWrapper>
            </Table.Row>
            <Table.Row>
                <ItemWrapper colSpan={1} data={formats.profitability.eps} statement={quarterBundle.profitability} ></ItemWrapper>
                <ItemWrapper colSpan={1} data={formats.profitability.mbr} statement={quarterBundle.profitability} ></ItemWrapper>
                <ItemWrapper colSpan={1} data={formats.profitability.ts} statement={quarterBundle.profitability} ></ItemWrapper>
                <ItemWrapper colSpan={1} data={formats.profitability.cs} statement={quarterBundle.profitability} ></ItemWrapper>
            </Table.Row>
            <Table.Row>
                <AnalysisInformationItem title="运营能力" rowSpan={2} children={undefined} />
                <ItemWrapper colSpan={1} data={formats.operationalCapability.rtr} statement={quarterBundle.operationalCapability} ></ItemWrapper>
                <ItemWrapper colSpan={1} data={formats.operationalCapability.rtd} statement={quarterBundle.operationalCapability} ></ItemWrapper>
                <ItemWrapper colSpan={1} data={formats.operationalCapability.itr} statement={quarterBundle.operationalCapability} ></ItemWrapper>
                <ItemWrapper colSpan={1} data={formats.operationalCapability.itd} statement={quarterBundle.operationalCapability} ></ItemWrapper>
            </Table.Row>
            <Table.Row>
                <ItemWrapper colSpan={3} data={formats.operationalCapability.catr} statement={quarterBundle.operationalCapability} ></ItemWrapper>

                <ItemWrapper colSpan={3} data={formats.operationalCapability.tatr} statement={quarterBundle.operationalCapability} ></ItemWrapper>

            </Table.Row>
            <Table.Row>
                <AnalysisInformationItem title="成长能力" rowSpan={2} children={undefined} />
                <ItemWrapper colSpan={2} data={formats.growthAbility.nagr} statement={quarterBundle.growthAbility}></ItemWrapper>
                <ItemWrapper colSpan={2} data={formats.growthAbility.tagr} statement={quarterBundle.growthAbility}></ItemWrapper>
                <ItemWrapper colSpan={1} data={formats.growthAbility.npgr} statement={quarterBundle.growthAbility}></ItemWrapper>
            </Table.Row>
            <Table.Row>
                <ItemWrapper colSpan={3} data={formats.growthAbility.bepsgr} statement={quarterBundle.growthAbility}></ItemWrapper>
                <ItemWrapper colSpan={3} data={formats.growthAbility.npasgr} statement={quarterBundle.growthAbility}></ItemWrapper>
            </Table.Row>
            <Table.Row>
                <AnalysisInformationItem title="偿债能力" rowSpan={2} children={undefined} />
                <ItemWrapper colSpan={2} data={formats.solvency.cr} statement={quarterBundle.solvency}></ItemWrapper>
                <ItemWrapper colSpan={2} data={formats.solvency.qr} statement={quarterBundle.solvency}></ItemWrapper>
                <ItemWrapper colSpan={1} data={formats.solvency.car} statement={quarterBundle.solvency}></ItemWrapper>

            </Table.Row>
            <Table.Row>
                <ItemWrapper colSpan={2} data={formats.solvency.tlgr} statement={quarterBundle.solvency}></ItemWrapper>
                <ItemWrapper colSpan={2} data={formats.solvency.dar} statement={quarterBundle.solvency}></ItemWrapper>
                <ItemWrapper colSpan={1} data={formats.solvency.em} statement={quarterBundle.solvency}></ItemWrapper>
            </Table.Row>
            <Table.Row>
                <AnalysisInformationItem title="现金流量" rowSpan={2} children={undefined} />
                <ItemWrapper centered colSpan={1} newTitle={<PoZhenRational num="流动资产" dom="总资产"></PoZhenRational>} data={formats.cashFlow.catar} statement={quarterBundle.cashFlow}></ItemWrapper>
                <ItemWrapper centered colSpan={1} newTitle={<PoZhenRational num="固定资产" dom="总资产"></PoZhenRational>} data={formats.cashFlow.fatar} statement={quarterBundle.cashFlow}></ItemWrapper>
                <ItemWrapper centered colSpan={1} newTitle={<PoZhenRational num="有形资产" dom="总资产"></PoZhenRational>} data={formats.cashFlow.tatar} statement={quarterBundle.cashFlow}></ItemWrapper>
                <ItemWrapper centered colSpan={1} newTitle={<PoZhenRational num="息税前利息" dom="利息费用"></PoZhenRational>} data={formats.cashFlow.ipm} statement={quarterBundle.cashFlow}></ItemWrapper>
            </Table.Row>
            <Table.Row>
                <ItemWrapper centered colSpan={1} newTitle={<PoZhenRational num="营业净现金流" dom="营业收入"></PoZhenRational>} data={formats.cashFlow.oncforr} statement={quarterBundle.cashFlow}></ItemWrapper>
                <ItemWrapper centered colSpan={1} newTitle={<PoZhenRational num="营业净现金流" dom="净利润比率"></PoZhenRational>} data={formats.cashFlow.oncfnpr} statement={quarterBundle.cashFlow}></ItemWrapper>
                <ItemWrapper centered colSpan={3} newTitle={<PoZhenRational num="营业净现金流" dom="总收入"></PoZhenRational>} data={formats.cashFlow.oncfgrr} statement={quarterBundle.cashFlow}></ItemWrapper>
            </Table.Row>

        </Table>
    </div>;
};

export default StatementTableView;
