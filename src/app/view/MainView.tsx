import React from "react";
import { Loader, Modal, Tab } from "semantic-ui-react";
import { useBasicDataLoaded } from "../state/Util";
// import { useDarkMode } from "../state/Util";
import QuoteAnalysisView from "./tab/analysis/QuoteAnalysisView";
import StockView from "./tab/stock/StockView";
import ConfigView from "./tab/ConfigView";
import StatementAnalysisView from "./tab/analysis/StatementAnalysisView";
const panes = [
    { menuItem: "证券", render: () => <Tab.Pane><StockView></StockView></Tab.Pane> },
    { menuItem: "行情分析", render: () => <Tab.Pane><QuoteAnalysisView></QuoteAnalysisView></Tab.Pane> },
    { menuItem: "财务报表分析", render: () => <Tab.Pane><StatementAnalysisView></StatementAnalysisView></Tab.Pane> },
    { menuItem: "设置", render: () => <Tab.Pane><ConfigView></ConfigView></Tab.Pane> },

]

const MainView: React.FC<{}> = () => {
    // const [darkMode] = useDarkMode();
    const loaded = useBasicDataLoaded();

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