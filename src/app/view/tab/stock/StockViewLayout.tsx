import React from "react";
import { Grid, Divider } from "semantic-ui-react";

type RenderType = React.ReactElement;

interface LayoutArgs {
    stockList: RenderType;
    candleChart: RenderType;
    singleTrend: RenderType;
};

type LayoutProps = { name: string } & LayoutArgs;
const makeDefaultLayout: (args: LayoutArgs) => React.ReactElement = ({ candleChart, singleTrend, stockList }) => {
    return (<Grid columns="1">
        <Grid.Column children={<>
            {stockList}
            <Divider></Divider>
        </>} />
        <Grid.Column>
            <Grid columns="2">
                <Grid.Column children={singleTrend} />
                <Grid.Column children={candleChart} />
            </Grid>
        </Grid.Column>
    </Grid>)
};

const Layout: React.FC<LayoutProps> = ({ candleChart, name, singleTrend, stockList }) => {
    if (name === "default") {
        return makeDefaultLayout({ candleChart: candleChart, singleTrend: singleTrend, stockList: stockList });
    }
    return <div>Invalid layout: {name}</div>;
};

export {
    Layout
};
export type {
    LayoutArgs, LayoutProps, RenderType
};