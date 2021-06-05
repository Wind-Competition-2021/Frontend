import React from "react";
import { Loader, Modal, Tab } from "semantic-ui-react";
import { useBasicDataLoaded, useDarkModeValue } from "../state/Util";
import QuoteAnalysisView from "./tab/analysis/quote/QuoteAnalysisView";
import StockView from "./tab/stock/StockView";
import ConfigView from "./tab/ConfigView";
import StatementAnalysisView from "./tab/analysis/statement/StatementAnalysisView";
import "./LinkButton.css";
import "core-js/stable";
import StockDetailView from "./tab/analysis/StockDetailView";
// import StatementAnalysisView from "./tab/analysis/statement/StatementAnalysisView";


const MainView: React.FC<{}> = () => {
    const loaded = useBasicDataLoaded();
    const darkMode = useDarkModeValue();
    const panes = [
        { menuItem: "实时报价", render: () => <Tab.Pane style={{ backgroundColor: darkMode ? "black" : "white" }}><StockView></StockView></Tab.Pane> },
        { menuItem: "股票详情", render: () => <Tab.Pane style={{ backgroundColor: darkMode ? "black" : "white" }}><StockDetailView></StockDetailView></Tab.Pane> },
        { menuItem: "行情分析", render: () => <Tab.Pane style={{ backgroundColor: darkMode ? "black" : "white" }}><QuoteAnalysisView></QuoteAnalysisView></Tab.Pane> },
        { menuItem: "财务报表", render: () => <Tab.Pane style={{ backgroundColor: darkMode ? "black" : "white" }}><StatementAnalysisView></StatementAnalysisView></Tab.Pane> },
        { menuItem: "设置", render: () => <Tab.Pane style={{ backgroundColor: darkMode ? "black" : "white" }}><ConfigView></ConfigView></Tab.Pane> },
    ]
    return loaded ? <div style={{ marginTop: "50px" }}>
        <Tab
            menu={{
                pointing: true,
                widths: panes.length,
                className: darkMode ? "dark-mode" : ""
            }}
            panes={panes}
            renderActiveOnly={true}
        >
        </Tab>

    </div> : <>
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