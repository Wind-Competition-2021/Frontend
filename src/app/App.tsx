import React from "react";
import axios from "axios";
import { Container } from "semantic-ui-react";
import { Provider } from "react-redux";
import { store } from "./state/Manager";
import MainView from "./view/MainView";
import 'semantic-ui-css/semantic.min.css';
const BACKEND_BASE_URL = process.env.REACT_APP_BASE_URL;
const DEBUG_MODE = process.env.NODE_ENV === "development";
const axiosObj = axios.create({
    baseURL: BACKEND_BASE_URL,
});
const App: React.FC<{}> = () => {
    return <Container>
        <Provider store={store}>
            <MainView></MainView>
        </Provider>
    </Container>;
};

export default App;

export { axiosObj as axios, DEBUG_MODE };