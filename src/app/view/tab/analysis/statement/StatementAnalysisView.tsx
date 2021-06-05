// import { DateTime } from "luxon";
import axios from "axios";
import { DateTime } from "luxon";
import React, { useState } from "react";
import { useEffect } from "react";
// import DayPickerInput from "react-day-picker/DayPickerInput";
import { Button, Dimmer, Form, Grid, Input, Loader } from "semantic-ui-react";
import { Quarter, QuarterDataBundle } from "../../../../client/statement-types";
import { client } from "../../../../client/WindClient";
import { useDocumentTitle } from "../../../../common/Util";
import { showErrorModal } from "../../../../dialogs/Dialog";
import AnalysisStockSearch from "../AnalysisStockSearch";
import SingleStatementTable from "./StatementTableView";


const StatementAnalysisView: React.FC<{
}> = () => {
    useDocumentTitle("财务报表分析");
    const today = DateTime.now();
    const prevQuarter = today.minus({ months: 3 });
    // const [initSearched, setInitSearched] = useState(false);
    /**
     * 当前要分析的股票
     */
    const [currentStock, setCurrentStock] = useState<string | null>(null);

    /**
     * 日期区间起始
     */
    // const [beginDate, setBeginDate] = useState<Date>(today.minus({ days: 30 }).toJSDate());
    /**
     * 日期区间结束
     */
    // const [endDate, setEndDate] = useState<Date>(today.toJSDate());
    /**
     * 年份
     */
    const [year, setYear] = useState<number>(prevQuarter.year);
    /**
     * 季度
     */
    const [quarter, setQuarter] = useState<Quarter>(prevQuarter.quarter as Quarter);
    const [fetching, setFetching] = useState(false);
    // const [currentTab, setCurrentTab] = useState<DateFormat>("quarter");
    // const [dateBundle, setDateBundle] = useState<DateIntervalDataBundle | null>(null);
    const [quarterBundle, setQuarterBundle] = useState<QuarterDataBundle | null>(null);
    const [dataLoaded, setDataLoaded] = useState(false);
    const fetchData = async () => {
        // if (!checkValidDateRange(beginDate, endDate)) {
        //     showErrorModal("开始日期不得晚于结束日期");
        //     return;
        // }
        if ((today.year === year && today.quarter <= quarter) || today.year < year) {
            showErrorModal("你不能选择当前季度或者未来的季度");
            return;
        }
        setFetching(true);
        try {
            const [quarterBundle] = (await axios.all([
                // client.getDateIntervalStockStatement(currentStock!, toDateString(beginDate), toDateString(endDate)) as Promise<any>,
                client.getQuarterStockStatement(currentStock!, year, quarter) as Promise<any>
            ])) as [QuarterDataBundle];
            // setDateBundle(dateBundle);
            setQuarterBundle(quarterBundle);
            setDataLoaded(true);
        } catch (e) {
            throw e;
        } finally {
            setFetching(false);
        }
    };
    useEffect(() => {
        if (currentStock !== null)
            fetchData();
        // eslint-disable-next-line
    }, [currentStock]);
    return <div>
        {/* <div style={{ height: "500px" }}>
            {!initSearched && <Dimmer active>
                <Grid columns="1">
                    <Grid.Column textAlign="center">
                        <Header inverted as="h2">
                            请搜索股票
                        </Header>
                    </Grid.Column>
                    <Grid.Column>
                        <AnalysisStockSearch
                            setSelectedStock={d => {
                                setCurrentStock(d);
                                setInitSearched(true);
                            }}
                        ></AnalysisStockSearch>
                    </Grid.Column>
                </Grid>
            </Dimmer>}
        </div> */}
        <Grid columns="1">
            <Grid.Column >

                <Grid columns="2">
                    <Grid.Column>
                        <AnalysisStockSearch
                            setSelectedStock={setCurrentStock}
                        ></AnalysisStockSearch>
                    </Grid.Column>
                    <Grid.Column>
                        {!currentStock && <div style={{ height: "500px" }}></div>}
                        {currentStock && <Form>
                            <Form.Group>
                                <><Form.Field inline>
                                    <label>年份</label>
                                    <Input type="number"
                                        value={year}
                                        onChange={(_, d) => setYear(parseInt(d.value))}
                                    ></Input>
                                </Form.Field>
                                    <Form.Field inline>
                                        <label>季度</label>
                                        <Button.Group>
                                            {([1, 2, 3, 4,] as Quarter[]).map(q => <Button
                                                key={q}
                                                onClick={() => {
                                                    if ((today.year === year && today.quarter <= q) || today.year < year) {
                                                        showErrorModal("你不能选择当前季度或者未来的季度");
                                                        return;
                                                    }
                                                    setQuarter(q);
                                                }}
                                                active={quarter === q}
                                            >{q}</Button>)}
                                        </Button.Group>
                                    </Form.Field></>

                                <Form.Field inline>
                                    {/* <label>操作</label> */}
                                    <Form.Button color="green" onClick={fetchData}>
                                        查询
                                    </Form.Button>
                                </Form.Field>
                            </Form.Group>
                        </Form>}
                    </Grid.Column>
                </Grid>
            </Grid.Column>

            {!currentStock ? <div></div> : <Grid.Column > <div>
                {fetching && <div style={{ height: "400px" }}>
                    <Dimmer active>
                        <Loader>加载中...</Loader>
                    </Dimmer>
                </div>}
                {dataLoaded && !fetching && <SingleStatementTable
                    // dateBundle={dateBundle!}
                    quarterBundle={quarterBundle!}
                // type={currentTab}
                // dateFormat={currentTab}
                ></SingleStatementTable>
                }
            </div> </Grid.Column>
            }

            {/* {!currentStock ? <div></div> : <div>
                    <Dimmer active={fetching}>
                        <Loader>加载中...</Loader>
                    </Dimmer>
                    <Grid columns="2">
                        <Grid.Column width="4">
                            <Menu fluid vertical tabular>
                                {dateFormatSequence.map((item, i) => <Menu.Item
                                    key={i}

                                    active={item === currentTab}
                                    onClick={() => setCurrentTab(item)}
                                >{dateFormatMapping[item]}</Menu.Item>)}
                            </Menu>
                        </Grid.Column>
                        <Grid.Column stretched width="12">
                            <Grid columns="1">
                                <Grid.Column>

                                    <Divider></Divider>
                                </Grid.Column>
                                <Grid.Column>
                                    {dataLoaded && <SingleStatementTable
                                        // dateBundle={dateBundle!}
                                        quarterBundle={quarterBundle!}
                                    // type={currentTab}
                                    // dateFormat={currentTab}
                                    ></SingleStatementTable>}
                                </Grid.Column>
                            </Grid>
                        </Grid.Column>
                    </Grid>
                </div>} */}

        </Grid>
    </div>;
};

export default StatementAnalysisView;

