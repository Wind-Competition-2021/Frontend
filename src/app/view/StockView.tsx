import React from "react";
import { Button, Radio } from "semantic-ui-react";
import { useDarkMode } from "../state/Util";
import {useDocumentTitle} from "../common/Util";

const StockView: React.FC<{}> = () => {
    const [darkMode, setDarkMode] = useDarkMode();
    console.log(darkMode);
    useDocumentTitle("主页");
    return <div>
        <Radio toggle onChange={(_, d) => { setDarkMode(d.checked!) }} checked={darkMode}></Radio>
        暗色模式: {JSON.stringify(darkMode)}
        <Button inverted dimm>qwqsss</Button>
        <Button inverted={false}>qwqsss</Button>
    
    </div>
};

export default StockView;