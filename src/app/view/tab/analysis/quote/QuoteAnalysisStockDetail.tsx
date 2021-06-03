import _ from "lodash";
import { DateTime } from "luxon";
import React, { useState } from "react";
import { Accordion, Icon, List, Table } from "semantic-ui-react";
import { StockInfo } from "../../../../client/types";
// import { showStockDetailModal } from "./StockDetailModal";

function wrapWebsite(src: string): string {
    if (!src.startsWith("http")) {
        return "http://" + src;
    } else return src;
}

function makeAbstract(src: string): string {
    return _.take(_.toArray(src), 20).join("");
}

const QuoteAnalysisStockDetail: React.FC<{ stockInfo: StockInfo }> = ({ stockInfo }) => {
    const [accordionStatus, setAccordionStatue] = useState<[boolean, boolean, boolean]>([false, false, false]);
    return <div>
        <Table attached="top">
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
                    <Table.Cell>{{ index: "指数", stock: "股票", other: "其他" }[stockInfo.type]}</Table.Cell>
                    <Table.Cell>{stockInfo.industry}</Table.Cell>
                    <Table.Cell>{stockInfo.classification}</Table.Cell>
                    <Table.Cell>{DateTime.fromISO(stockInfo.listedDate).toFormat("yyyy-MM-dd")}</Table.Cell>
                    <Table.Cell>{stockInfo.delistedDate && DateTime.fromISO(stockInfo.delistedDate).toFormat("yyyy-MM-dd")}</Table.Cell>
                </Table.Row>
            </Table.Body>
        </Table>
        <Table attached>
            <Table.Header><Table.Row>
                <Table.HeaderCell>注册资本</Table.HeaderCell>
                <Table.HeaderCell>法人</Table.HeaderCell>
                <Table.HeaderCell>总经理</Table.HeaderCell>
                <Table.HeaderCell>秘书</Table.HeaderCell>
                <Table.HeaderCell>注册省市</Table.HeaderCell>
                <Table.HeaderCell>办公地址</Table.HeaderCell>
                <Table.HeaderCell>邮箱</Table.HeaderCell>
                <Table.HeaderCell>网站</Table.HeaderCell>
            </Table.Row></Table.Header>
            <Table.Body>
                <Table.Row>
                    <Table.Cell>{stockInfo.registeredCapital}</Table.Cell>
                    <Table.Cell>{stockInfo.legalRepresentative}</Table.Cell>
                    <Table.Cell>{stockInfo.generalManager}</Table.Cell>
                    <Table.Cell>{stockInfo.secretary}</Table.Cell>
                    <Table.Cell>{stockInfo.province} {stockInfo.city}</Table.Cell>
                    <Table.Cell>{stockInfo.office}</Table.Cell>
                    <Table.Cell><List>
                        {stockInfo.email?.split(";").map((x, i) => <List.Item key={i}>
                            <a rel="noreferrer" href={`mailto:${x}`} target="_blank">{x}</a>
                        </List.Item>)}</List></Table.Cell>
                    <Table.Cell><a rel="noreferrer" target="_blank" href={wrapWebsite(stockInfo.website)}>{stockInfo.website}</a></Table.Cell>
                </Table.Row>
            </Table.Body>
        </Table>
        <Table attached>
            <Table.Header><Table.Row>
                <Table.HeaderCell>经营范围</Table.HeaderCell>
                <Table.HeaderCell>主营业务</Table.HeaderCell>
                <Table.HeaderCell>简介</Table.HeaderCell>
            </Table.Row></Table.Header>
            <Table.Body>
                <Table.Row>
                    {[{ title: "经营范围", content: stockInfo.businessScope },
                    { title: "主营业务", content: stockInfo.mainBusiness },
                    { title: "简介", content: stockInfo.introduction }].map(({ title, content }, i) => <Table.Cell key={title}>
                        <Accordion>
                            <Accordion.Title onClick={() => {
                                const newArr = [...accordionStatus];
                                newArr[i] = !newArr[i];
                                setAccordionStatue(newArr as [boolean, boolean, boolean]);
                            }}><Icon name="dropdown"></Icon>{makeAbstract(content)}...</Accordion.Title>
                            <Accordion.Content active={accordionStatus[i]}>{content}</Accordion.Content>
                        </Accordion>
                        {/* <button className="link-button" onClick={() => showStockDetailModal(title, content)}>
                            {makeAbstract(content)}...
                        </button> */}
                    </Table.Cell>)}
                </Table.Row>
            </Table.Body>
        </Table>
    </div>;
};

export default QuoteAnalysisStockDetail;