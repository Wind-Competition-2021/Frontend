import _ from "lodash";
import { DateTime } from "luxon";
import React, { useState } from "react";
import { Dimmer, Loader } from "semantic-ui-react";
import { StockTrendList } from "../../../client/types";
import { unwrapNumber } from "../../../common/Util";
import ReactECharts from "echarts-for-react";
import { useDarkModeValue } from "../../../state/Util";
const myUnwrapNumber = (val: number, multi10000: boolean = false) => {
    const { value, display } = unwrapNumber(val, multi10000);
    return ({ value: value, name: display });
}
const SingleStockTrendChart: React.FC<{
    data: StockTrendList
}> = React.memo(({ data }) => {
    const darkMode = useDarkModeValue();
    const [loading, setLoading] = useState(true);
    const priceData = data.map(item => myUnwrapNumber(item.closing, true));

    // const maxVolume = _.max(data.map(t => t.volume)) as number;
    const timeList = data.map((item) => DateTime.fromISO(item.time).toFormat("HH:mm"));
    const maxPrice = _.max(priceData.map(i => i.value))!;
    const minPrice = _.min(priceData.map(i => i.value))!;
    const halfLen = (maxPrice - minPrice) / 2;
    const combinedVolumeData = _.zip(_.tail(data), _.initial(data.map(i => ({ closing: i.closing, volume: i.volume })))).map(([item, pre]) => {
        const diff = item!.volume;
        const priceDiff = item!.closing - pre!.closing;
        if (priceDiff === 0) {
            return ({
                value: diff,
                itemStyle: {
                    color: darkMode ? "white" : "black"
                }
            })
        } else if (priceDiff > 0) {
            return ({
                value: diff,
                itemStyle: {
                    color: "red"
                }
            })
        } else {
            return ({
                value: diff,
                itemStyle: {
                    color: "green"
                }
            })
        }
    }
    );
    return <div>
        <Dimmer active={loading}>
            <Loader>加载中</Loader>
        </Dimmer>
        {loading && <div className="my-chart"></div>}
        <ReactECharts
            className="my-charts"
            onEvents={{
                finished: () => setLoading(false)
            }}
            option={{
                darkMode: darkMode,
                backgroundColor: darkMode ? "black" : "white",
                tooltip: {
                    trigger: 'item',
                    axisPointer: {
                        type: 'cross'
                    }
                },
                legend: {
                    data: ["成交价", "成交量"]
                },
                xAxis: {
                    type: "category",
                    data: timeList,
                    scale: true,
                    min: "dataMin",
                    max: "dataMax",
                },
                yAxis: [
                    {
                        name: "价格",
                        min: Math.round(minPrice - halfLen),
                        splitLine: { show: false }
                    },
                    {
                        name: "成交量",
                        splitLine: { show: false }
                        // max: maxVolume!
                    }
                ],
                dataZoom: [
                    {
                        show: true,
                        type: 'slider',
                        top: '90%',
                        start: 0,
                        end: 100
                    }
                ],
                series: [
                    {
                        name: "成交价",
                        yAxisIndex: 0,
                        type: "line",
                        data: priceData,
                        lineStyle: {
                            color: darkMode ? "white" : "black"
                        },
                        showSymbol: false,
                    },
                    {
                        name: "成交量",
                        yAxisIndex: 1,
                        type: "bar",
                        data: combinedVolumeData

                    }
                ]
            }}
        ></ReactECharts>
    </div>;
});

export default SingleStockTrendChart;