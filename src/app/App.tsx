import React from "react";
// import axios from "axios";
import { Grid } from "semantic-ui-react";
import { Provider } from "react-redux";
import { makeDataStateUpdateAction, store } from "./state/Manager";
import MainView from "./view/MainView";
import 'semantic-ui-css/semantic.min.css';
import { client } from "./client/WindClient";
// import 'antd/dist/antd.css';
// import {Page} from "antd";
const BACKEND_BASE_URL = process.env.REACT_APP_BASE_URL;

const DEBUG_MODE = process.env.NODE_ENV === "development";

client.loadData().then(() => {
    store.dispatch(makeDataStateUpdateAction({ loaded: true, currentStock: "" }));
    // if (store.getState().stockState.tradingTime) client.connectStockListSocket();
});
store.subscribe(() => {
    const state = store.getState();
    if (state.viewState.darkModeEnabled) {
        document.body.style.backgroundColor = "black";
    } else {
        document.body.style.backgroundColor = "white";
    }
});
const App: React.FC<{}> = () => {
    return <Grid colums="1" centered>
        <Grid.Column width="15">
            <Provider store={store}>
                {/* <div style={{width:"80%"}}> */}
                <MainView></MainView>
                {/* </div> */}
            </Provider>
        </Grid.Column>
    </Grid>;
};

export default App;

export { DEBUG_MODE, BACKEND_BASE_URL };