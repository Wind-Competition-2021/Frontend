import _ from "lodash";
import { DateTime } from "luxon";
import React, { useState } from "react";
import { Accordion, Icon, Table } from "semantic-ui-react";
import { StockInfo } from "../../../client/types";
import AnalysisInformationItem from "./AnalysisInformationItem";
// import { showStockDetailModal } from "./StockDetailModal";

function wrapWebsite(src: string | null): string | null {
    if (src === null) return src;
    if (!src.startsWith("http")) {
        return "http://" + src;
    } else return src;
}

function makeAbstract(src: string): string {
    return _.take(_.toArray(src), 50).join("");
}

const StockDetailTable: React.FC<{ stockInfo: StockInfo }> = ({ stockInfo }) => {
    const [accordionStatus, setAccordionStatue] = useState<[boolean, boolean, boolean]>([false, false, false]);
    return <div>
        <Table celled>
            <Table.Row>
                <AnalysisInformationItem width="2" title="代码" colSpan={1}>{stockInfo.id}</AnalysisInformationItem>
                <AnalysisInformationItem title="名称" colSpan={3}>{stockInfo.name}</AnalysisInformationItem>
                <AnalysisInformationItem title="行业" colSpan={1}>{stockInfo.industry}</AnalysisInformationItem>
                <AnalysisInformationItem title="分类" colSpan={1}>{stockInfo.classification}</AnalysisInformationItem>
            </Table.Row>
            <Table.Row>
                <AnalysisInformationItem title="注册资本" colSpan={1}>{stockInfo.registeredCapital}</AnalysisInformationItem>
                <AnalysisInformationItem title="上市" colSpan={1}>{DateTime.fromISO(stockInfo.listedDate).toFormat("yyyy-MM-dd")}</AnalysisInformationItem>
                <AnalysisInformationItem title="退市" colSpan={1}>{stockInfo.delistedDate ? DateTime.fromISO(stockInfo.delistedDate).toFormat("yyyy-MM-dd") : "数据不存在"}</AnalysisInformationItem>

                <AnalysisInformationItem title="省" colSpan={1}>{stockInfo.province}</AnalysisInformationItem>
                <AnalysisInformationItem title="市" colSpan={1}>{stockInfo.city}</AnalysisInformationItem>
            </Table.Row>
            <Table.Row>
                <AnalysisInformationItem title="法人" colSpan={1}>{stockInfo.legalRepresentative}</AnalysisInformationItem>
                <AnalysisInformationItem title="总经理" colSpan={1}>{stockInfo.generalManager}</AnalysisInformationItem>
                <AnalysisInformationItem title="秘书" colSpan={1}>{stockInfo.secretary}</AnalysisInformationItem>
                <AnalysisInformationItem title="地区" colSpan={3}>{stockInfo.office}</AnalysisInformationItem>
            </Table.Row>
            <Table.Row>
                <AnalysisInformationItem title="邮箱" colSpan={9}>
                    {stockInfo.email?.split(";").map((x, i) => <a key={i} rel="noreferrer" href={`mailto:${x}`} target="_blank">{x}</a>)}
                </AnalysisInformationItem>
            </Table.Row>
            <Table.Row>
                <AnalysisInformationItem title="网站" colSpan={9}>
                    <a rel="noreferrer" target="_blank" href={wrapWebsite(stockInfo.website) || undefined}>{stockInfo.website}</a>
                </AnalysisInformationItem>
            </Table.Row>
            {[{ title: "经营范围", content: stockInfo.businessScope },
            { title: "主营业务", content: stockInfo.mainBusiness },
            { title: "简介", content: stockInfo.introduction }].map(({ title, content }, i) => <Table.Row>
                <AnalysisInformationItem colSpan={9} key={i} title={title}>
                    <Accordion>
                        <Accordion.Title onClick={() => {
                            const newArr = [...accordionStatus];
                            newArr[i] = !newArr[i];
                            setAccordionStatue(newArr as [boolean, boolean, boolean]);
                        }}><Icon name="dropdown"></Icon>{makeAbstract(content)}...</Accordion.Title>
                        <Accordion.Content active={accordionStatus[i]}>{content}</Accordion.Content>
                    </Accordion>

                </AnalysisInformationItem>
            </Table.Row>)}
        </Table>
    </div>;
};

export default StockDetailTable;