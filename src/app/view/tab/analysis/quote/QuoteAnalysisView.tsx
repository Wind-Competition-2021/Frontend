import React, { useState } from "react";
import { useEffect } from "react";
import { Grid, Form, Dimmer, Loader,  Menu, Segment } from "semantic-ui-react";
import { RealTimeDataByDay, RealTimeDataByWeek, RehabilitationType, StockInfo } from "../../../../client/types";
import { client } from "../../../../client/WindClient";
import { toDateString, useDocumentTitle } from "../../../../common/Util";
import AnalysisStockSearch from "../AnalysisStockSearch";
import { DateTime } from "luxon";
import 'react-day-picker/lib/style.css';
import DayPickerInput from "react-day-picker/DayPickerInput"
import QuoteAnalysisStockDetail from "./QuoteAnalysisStockDetail";
// import QuoteAnalysisStockChart from "./QuoteAnalysisStockChart";
import { showErrorModal } from "../../../../dialogs/Dialog";
import StockCandleChart from "../../stock/StockCandleChart";
/**
 * Return if d1<=d2
 * @param d1 
 * @param d2 
 */
const checkValidDateRange = (d1: Date, d2: Date) => {
    const l1 = DateTime.fromJSDate(d1);
    const l2 = DateTime.fromJSDate(d2);
    const diff = l1.diff(l2);
    if (diff.toMillis() < 0) {
        return true;
    } else {
        return false;
    }
};
const isFutureDate = (d: Date) => {
    const now = DateTime.now();
    if (checkValidDateRange(now.toJSDate(), d)) return true;
    return false;
};
type CandleChartType = "day" | "week" | "month";
type TimeIntervalType = { begin: Date; end: Date };
interface CandleTypeWrapper<Day, Week, Month> {
    day: Day;
    week: Week;
    month: Month;
}
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
    const [realTimeData, setRealTimeData] = useState<Partial<CandleTypeWrapper<RealTimeDataByDay[], RealTimeDataByWeek[], RealTimeDataByWeek[]>>>({});
    const [timeInterval, setTimeInterval] = useState<CandleTypeWrapper<TimeIntervalType, TimeIntervalType, TimeIntervalType>>({
        day: { begin: today.minus({ days: 30 }).toJSDate(), end: today.toJSDate() },
        week: { begin: today.minus({ month: 3 }).toJSDate(), end: today.toJSDate() },
        month: { begin: today.minus({ month: 6 }).toJSDate(), end: today.toJSDate() },
    });
    const [dummy, setDummy] = useState(false);
    const [candleType, setCandleType] = useState<CandleChartType>("day");
    const [loaded, setLoaded] = useState(false);
    const [stockLoading, setStockLoading] = useState(false);
    const applyDate = async (withLoading: boolean, candleType: CandleChartType) => {
        const range = timeInterval[candleType];
        if (!checkValidDateRange(range.begin, range.end)) {
            showErrorModal("开始时间不得晚于结束时间");
            return;
        }
        if (withLoading) setLoading(true);
        switch (candleType) {
            case "day":
                setRealTimeData({
                    ...realTimeData,
                    day: await client.getStockDayHistory(
                        currentStock!,
                        toDateString(range.begin),
                        toDateString(range.end),
                        rehabilitation
                    )
                });
                break;
            case "week":
                setRealTimeData({
                    ...realTimeData,
                    week: await client.getStockWeekHistory(
                        currentStock!,
                        toDateString(range.begin),
                        toDateString(range.end),
                        "week",
                        rehabilitation
                    )
                });
                break;
            case "month":
                setRealTimeData({
                    ...realTimeData,
                    month: await client.getStockWeekHistory(
                        currentStock!,
                        toDateString(range.begin),
                        toDateString(range.end),
                        "month",
                        rehabilitation
                    )
                });
                break;

        }
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
                    await applyDate(false, candleType);
                    setLoaded(true);
                } catch (e) {
                    throw e;
                } finally {
                    setLoading(false);

                }
            })();
        }
        // eslint-disable-next-line
    }, [currentStock, rehabilitation, dummy]);
    /**
     * 更改显示的K线图的类型时，重新拉取数据
     */

    const switchCandleType = async (newType: CandleChartType) => {
        try {
            setStockLoading(true);
            setCandleType(newType);
            await applyDate(false, newType);
        } catch (e) {
            throw e;
        } finally {
            setStockLoading(false);

        }
    };
    // console.log(realTimeData);
    return <>
        <Dimmer active={loading}>
            <Loader>加载中...</Loader>
        </Dimmer>
        <Grid columns="1">
            <Grid.Column>
                <Grid columns="2">
                    <Grid.Column>
                        <AnalysisStockSearch
                            setSelectedStock={s => {
                                setCurrentStock(s);
                                setDummy(!dummy);
                            }}
                        ></AnalysisStockSearch>
                    </Grid.Column>
                    <Grid.Column>
                        {currentStock && <Form>
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
                        </Form>}
                    </Grid.Column>
                </Grid>
            </Grid.Column>
            <Grid.Column>
                {!currentStock ? <div style={{ height: "500px" }}>
                </div> : loaded && <div>

                    <QuoteAnalysisStockDetail stockInfo={stockInfo!}></QuoteAnalysisStockDetail>
                    <Segment>
                        <Dimmer active={stockLoading}>
                            <Loader>加载中...</Loader>
                        </Dimmer>
                        <Grid columns="2">
                            <Grid.Column width="4">
                                <Menu fluid vertical tabular>
                                    <Menu.Item
                                        name="日K线数据"
                                        active={candleType === "day"}
                                        onClick={() => switchCandleType("day")}
                                    ></Menu.Item>
                                    <Menu.Item
                                        name="周K线数据"
                                        active={candleType === "week"}
                                        onClick={() => switchCandleType("week")}
                                    ></Menu.Item>
                                    <Menu.Item
                                        name="月K线数据"
                                        active={candleType === "month"}
                                        onClick={() => switchCandleType("month")}
                                    ></Menu.Item>
                                </Menu>
                            </Grid.Column>
                            <Grid.Column stretched width="12">
                                <Segment>
                                    <Grid columns="1">
                                        <Grid.Column>
                                            {realTimeData[candleType] && <StockCandleChart
                                                generalData={realTimeData[candleType]!.map((item: RealTimeDataByDay | RealTimeDataByWeek) => ({ ...item, label: DateTime.fromISO(item.date).toFormat("MM/dd") }))}
                                                extraData={(candleType === "day") ? realTimeData[candleType]! : undefined}
                                            ></StockCandleChart>}
                                        </Grid.Column>
                                        <Grid.Column>
                                            <Form>
                                                <Form.Group>
                                                    <Form.Field>
                                                        <label>开始日期</label>
                                                        <DayPickerInput
                                                            value={timeInterval[candleType].begin}
                                                            onDayChange={d => {
                                                                if (isFutureDate(d)) {
                                                                    showErrorModal("你不能选择未来的日期");
                                                                    return;
                                                                };
                                                                setTimeInterval({
                                                                    ...timeInterval, [candleType]: {
                                                                        begin: d, end: timeInterval[candleType].end
                                                                    }
                                                                })
                                                            }}
                                                        ></DayPickerInput>
                                                    </Form.Field>
                                                    <Form.Field>
                                                        <label>截止日期</label>
                                                        <DayPickerInput
                                                            value={timeInterval[candleType].end}
                                                            onDayChange={d => {
                                                                if (isFutureDate(d)) {
                                                                    showErrorModal("你不能选择未来的日期");
                                                                    return;
                                                                }
                                                                setTimeInterval({
                                                                    ...timeInterval, [candleType]: {
                                                                        end: d, begin: timeInterval[candleType].begin
                                                                    }
                                                                });
                                                            }}
                                                        ></DayPickerInput>
                                                    </Form.Field>
                                                    <Form.Field>
                                                        <label>操作</label>
                                                        <Form.Button color="green" onClick={() => applyDate(true, candleType)}>
                                                            应用
                                                        </Form.Button>
                                                    </Form.Field>
                                                </Form.Group>
                                            </Form>
                                        </Grid.Column>
                                    </Grid>
                                </Segment>
                            </Grid.Column>
                        </Grid>
                    </Segment>
                </div>}
            </Grid.Column>
        </Grid>
    </>
        ;
};
(window as (typeof window) & { d: typeof DateTime }).d = DateTime;
export default QuoteAnalysisView;
