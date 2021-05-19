import React from "react";
import { Loader, Modal, Tab } from "semantic-ui-react";
import { useBasicDataLoaded } from "../state/Util";
// import { useDarkMode } from "../state/Util";
import QuoteAnalysisView from "./tab/analysis/quote/QuoteAnalysisView";
import StockView from "./tab/stock/StockView";
import ConfigView from "./tab/ConfigView";
import StatementAnalysisView from "./tab/analysis/StatementAnalysisView";
// import StockCandleChart from "./tab/stock/StockCandleChart";
// import { RehabilitationType, StockTrendList } from "../client/types";
// import _ from "lodash";
// import { DateTime } from "luxon";
// import SingleStockTrendChart from "./tab/stock/SingleStockTrendChart";
const panes = [
    { menuItem: "证券", render: () => <Tab.Pane><StockView></StockView></Tab.Pane> },
    { menuItem: "行情分析", render: () => <Tab.Pane><QuoteAnalysisView></QuoteAnalysisView></Tab.Pane> },
    { menuItem: "财务报表分析", render: () => <Tab.Pane><StatementAnalysisView></StatementAnalysisView></Tab.Pane> },
    { menuItem: "设置", render: () => <Tab.Pane><ConfigView></ConfigView></Tab.Pane> },
]

const MainView: React.FC<{}> = () => {
    // const [darkMode] = useDarkMode();
    const loaded = useBasicDataLoaded();
    // const closings = _.times(50, () => Math.floor(Math.random() * 10000 * 100));
    // const data = _.zip(closings, [0, ..._.initial(closings)]).map(([a, b], i) => ({
    //     preClosing: b, closing: a,
    //     time: DateTime.now().plus({ minute: i }).toISO(),
    //     volume: _.random(1, 1000, false)
    // })) as StockTrendList;
    // console.log(data);
    // return <SingleStockTrendChart
    //     data={data}
    // ></SingleStockTrendChart>
    // return <StockCandleChart
    //     data={[
    //         {
    //             closing: 10000 * 10,
    //             date: "2021-01-11",
    //             highest: 10000 * 50,
    //             id: "1111",
    //             lowest: 10000 * 5,
    //             opening: 10000 * 20,
    //             pbr: "000000",
    //             pcfr: "000000",
    //             per: "000000",
    //             preClosing: 10000 * 40,
    //             psr: "000000",
    //             rehabilitation: "none",
    //             specialTreatment: false,
    //             stopped: false,
    //             turnover: 10000 * 20,
    //             volume: 50,
    //             turnoverRate: "000000"
    //         }, ...(_.times(20, (n) => ({
    //             closing: 10000 * 10,
    //             date: "2021-01-11",
    //             highest: 10000 * 50,
    //             id: "1111",
    //             lowest: 10000 * 5,
    //             opening: 10000 * 5,
    //             pbr: "000000",
    //             pcfr: "000000",
    //             per: "000000",
    //             preClosing: 10000 * 40,
    //             psr: "000000",
    //             rehabilitation: "none" as RehabilitationType,
    //             specialTreatment: false,
    //             stopped: false,
    //             turnover: 10000 * 20,
    //             volume: 50,
    //             turnoverRate: "000000"
    //         })))
    //     ]}
    // ></StockCandleChart>
    return loaded ? <Tab
        menu={{
            pointing: true
        }}
        panes={panes}
    >
    </Tab> : <>
        <Modal
            basic
            open={true}
        >
            <Modal.Content>
                <Loader active>
                    加载中...
                </Loader>
            </Modal.Content>
        </Modal>
    </>
}

export default MainView;