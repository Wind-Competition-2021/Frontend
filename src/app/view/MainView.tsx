import React from "react";
import { Tab } from "semantic-ui-react";
import { useDarkMode } from "../state/Util";
import StockView from "./StockView";

const panes = [
    { menuItem: "证券", render: () => <Tab.Pane ><StockView></StockView></Tab.Pane> }
]

const MainView: React.FC<{}> = () => {
    const [darkMode] = useDarkMode();
    return <Tab
        menu={{
            pointing: true
        }}
        panes={panes}

    >
    </Tab>
}

export default MainView;