import React, { useState } from "react";
import { useEffect } from "react";
import { Grid, Form, Dimmer, Loader, Divider } from "semantic-ui-react";
import { RealTimeDataByDay, RealTimeDataByWeek, RehabilitationType, StockInfo } from "../../../../client/types";
import { client } from "../../../../client/WindClient";
import { toDateString, useDocumentTitle } from "../../../../common/Util";
import AnalysisStockSearch from "../AnalysisStockSearch";
import { DateTime } from "luxon";
import 'react-day-picker/lib/style.css';
import DayPickerInput from "react-day-picker/DayPickerInput"
import QuoteAnalysisStockDetail from "./QuoteAnalysisStockDetail";
import QuoteAnalysisStockChart from "./QuoteAnalysisStockChart";
const QuoteAnalysisView: React.FC<{
}> = () => {
    useDocumentTitle("分析");
    const today = DateTime.now();
    /**
     * 当前要分析的股票
     */
    const [currentStock, setCurrentStock] = useState<string | null>(null);
    /**
     * 复权类型
     */
    const [rehabilitation, setRehabilitation] = useState<RehabilitationType>("none");
    const [loading, setLoading] = useState(false);
    const [stockInfo, setStockInfo] = useState<StockInfo | null>(null);
    const [realTimeDataByDay, setRealTimeDataByDay] = useState<RealTimeDataByDay[] | null>(null);
    const [realTimeDataByWeek, setRealTimeDataByWeek] = useState<RealTimeDataByWeek[] | null>(null);
    const [candleStartDay, setCandleStartDay] = useState<Date>(today.minus({ day: 30 }).toJSDate());
    const [candleEndDay, setCandleEndDay] = useState<Date>(today.toJSDate());
    const [weekDataStartDay, setWeekDataStartDay] = useState<Date>(today.minus({ months: 6 }).toJSDate());
    const [weekDataEndDay, setWeekDataEndDay] = useState<Date>(today.toJSDate());
    const [dummy, setDummy] = useState(false);
    const applyDate = async (withLoading: boolean) => {
        if (withLoading) setLoading(true);
        setRealTimeDataByDay(await client.getStockDayHistory(
            currentStock!,
            toDateString(candleStartDay),
            toDateString(candleEndDay),
            rehabilitation
        ));
        setRealTimeDataByWeek(await client.getStockWeekHistory(
            currentStock!,
            toDateString(weekDataStartDay),
            toDateString(weekDataEndDay),
            "week",
            rehabilitation
        ));
        if (withLoading) setLoading(false);
    };
    /**
     * 股票复权类型更改时，重新拉取数据
     */
    useEffect(() => {
        if (currentStock) {
            (async () => {
                setLoading(true);
                try {
                    setStockInfo(await client.getStockDetailedInfo(currentStock));
                    await applyDate(false);

                } catch (e) {
                    throw e;
                } finally {
                    setLoading(false);

                }
            })();
        }
        // eslint-disable-next-line
    }, [currentStock, rehabilitation, dummy]);

    return <>
        <Dimmer active={loading}>
            <Loader>加载中...</Loader>
        </Dimmer>
        <Grid columns="1">
            <Grid.Column>
                <AnalysisStockSearch
                    setSelectedStock={s => {
                        setCurrentStock(s);
                        setDummy(!dummy);
                    }}
                ></AnalysisStockSearch>
            </Grid.Column>
            <Grid.Column>
                {!currentStock ? <div style={{ height: "500px" }}>
                </div> : stockInfo && realTimeDataByDay && realTimeDataByWeek && <div>
                    <Form>
                        <Form.Group inline>
                            <label>复权类型</label>
                            <Form.Radio
                                label="前复权"
                                checked={rehabilitation === "pre"}
                                onChange={() => setRehabilitation("pre")}
                            ></Form.Radio>
                            <Form.Radio
                                label="后复权"
                                checked={rehabilitation === "post"}
                                onChange={() => setRehabilitation("post")}
                            ></Form.Radio>
                            <Form.Radio
                                label="不复权"
                                checked={rehabilitation === "none"}
                                onChange={() => setRehabilitation("none")}
                            ></Form.Radio>
                        </Form.Group>
                    </Form>
                    <Divider></Divider>
                    <QuoteAnalysisStockDetail stockInfo={stockInfo}></QuoteAnalysisStockDetail>
                    <Divider></Divider>
                    <QuoteAnalysisStockChart
                        realTimeDataByDay={realTimeDataByDay}
                        realTimeDataByWeek={realTimeDataByWeek}
                    ></QuoteAnalysisStockChart>
                    <Divider></Divider>
                    <Form>
                        <Form.Group>
                            <Form.Field>
                                <label>K线日期范围</label>
                                <Grid columns="2">
                                    <Grid.Column textAlign="right" width="8">
                                        <DayPickerInput
                                            style={{ width: "100%" }}
                                            value={candleStartDay}
                                            onDayChange={v => setCandleStartDay(v)}
                                        ></DayPickerInput>
                                    </Grid.Column>
                                    <Grid.Column textAlign="left" width="8">
                                        <DayPickerInput
                                            value={candleEndDay}
                                            onDayChange={v => setCandleEndDay(v)}
                                        ></DayPickerInput>
                                    </Grid.Column>
                                </Grid>
                            </Form.Field>
                            <Form.Field>
                                <label>周数据日期范围</label>
                                <Grid columns="2">
                                    <Grid.Column textAlign="right" width="8">
                                        <DayPickerInput
                                            style={{ width: "100%" }}
                                            value={weekDataStartDay}
                                            onDayChange={v => setWeekDataStartDay(v)}
                                        ></DayPickerInput>
                                    </Grid.Column>
                                    <Grid.Column textAlign="left" width="8">
                                        <DayPickerInput
                                            value={weekDataEndDay}
                                            onDayChange={v => setWeekDataEndDay(v)}
                                        ></DayPickerInput>
                                    </Grid.Column>
                                </Grid>
                            </Form.Field>
                        </Form.Group>
                        <Form.Button color="green" onClick={() => applyDate(true)}>
                            应用日期更改
                        </Form.Button>
                    </Form>
                </div>}
            </Grid.Column>
        </Grid>
    </>
        ;
};

export default QuoteAnalysisView;
