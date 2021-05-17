import React from "react";
import { Loader, Modal, Tab } from "semantic-ui-react";
import { useBasicDataLoaded } from "../state/Util";
// import { useDarkMode } from "../state/Util";
import AnalysisView from "./tab/AnalysisView";
import StockView from "./tab/StockView";
import ConfigView from "./tab/ConfigView";
const panes = [
    { menuItem: "证券", render: () => <Tab.Pane><StockView></StockView></Tab.Pane> },
    { menuItem: "分析", render: () => <Tab.Pane><AnalysisView></AnalysisView></Tab.Pane> },
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