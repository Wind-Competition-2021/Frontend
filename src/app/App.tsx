import React from "react";
// import axios from "axios";
import { Container } from "semantic-ui-react";
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
    store.dispatch(makeDataStateUpdateAction({ loaded: true }));
    client.connectStockListSocket();
});

const App: React.FC<{}> = () => {
    return <Container>
        <Provider store={store}>
            <MainView></MainView>
        </Provider>
    </Container>;
};

export default App;

export { DEBUG_MODE, BACKEND_BASE_URL };