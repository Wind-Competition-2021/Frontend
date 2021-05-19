import _ from "lodash";
import { DateTime } from "luxon";
import React from "react";
import Chart from "react-google-charts";
import { StockTrendList } from "../../../client/types";
import { unwrapNumber } from "../../../common/Util";
const myUnwrapNumber = (val: number, multi10000: boolean = false) => {
    const { value, display } = unwrapNumber(val, multi10000);
    return ({ v: value, f: display });
}
const SingleStockTrendChart: React.FC<{
    data: StockTrendList
}> = ({ data }) => {
    const priceData = data.map(item => myUnwrapNumber(item.closing, true));
    const volumeData = data.map(item => [
        item.volume,
        (item.closing >= item.preClosing) ? (
            (item.closing === item.preClosing) ?
                "fill-color:white;stroke-color:black" :
                "fill-color:red;stroke-color:black"
        ) : "fill-color:green;stroke-color:black"

    ])
    const maxVolume = _.max(data.map(t => t.volume));
    const timeList = data.map((item, i) => DateTime.fromISO(item.time).toFormat("HH:mm"));
    const combinedData = _.zip(timeList, priceData, volumeData).map(([a, b, c]) => [a, b, ...c!]);
    console.log("maxvol", maxVolume);
    return <Chart
        chartType="ComboChart"
        data={[
            ["时间", "成交价", "成交量", { role: "style" }],
            ...combinedData
            // ["qwq", 10, "", 20]
        ]}
        options={{
            hAxis: { title: "时间" },
            series: {
                0: {
                    targetAxisIndex: 0,
                    type: "lines",
                    color: "black"
                },
                1: {
                    targetAxisIndex: 1,
                    type: "bars"
                }
            },
            vAxes: {
                0: { title: "价格", gridlines: { color: "transparent" } },
                1: { title: "成交量", gridlines: { color: "transparent" }, viewWindow: { max: maxVolume! * 5 } }
            }
        }}
    ></Chart>;
}

export default SingleStockTrendChart;