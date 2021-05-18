import React, { useEffect, useState } from "react";
import { Config } from "../../client/types";
import { client } from "../../client/WindClient";
import { Button, Form, Divider, Grid, Table, Header } from "semantic-ui-react";
import { showSuccessModal } from "../../dialogs/Dialog";
import { useDocumentTitle } from "../../common/Util";
const ConfigView: React.FC<{}> = () => {
    const [loaded, setLoaded] = useState(false);
    const [config, setConfig] = useState<Config | null>(null);
    const [sending, setSending] = useState(false);
    useDocumentTitle("设置");
    useEffect(() => {
        if (!loaded) {
            setConfig(client.getLocalConfig());
            setLoaded(true);
        }
    }, [loaded]);
    const save = async () => {
        setSending(true);
        await client.updateRemoteConfig(config!);
        client.setLocalConfig(config!);
        setSending(false);
        showSuccessModal("操作完成");
    };
    return <div>
        {loaded && config && <>

            <Grid columns="2">
                <Grid.Column width="4">
                    <Form>
                        <Form.Input label="股票列表刷新间隔(秒)" input={<input
                            type="number"
                            value={config!.refreshInterval.list}
                            onChange={e => setConfig({
                                ...config!,
                                refreshInterval: {
                                    ...config!.refreshInterval, list: parseInt(e.target.value)
                                }
                            })}
                        >
                        </input>} >
                        </Form.Input>
                        <Form.Input label="单支股票刷新间隔(秒)" input={<input
                            type="number"
                            value={config!.refreshInterval.single}
                            onChange={e => setConfig({
                                ...config!,
                                refreshInterval: {
                                    ...config!.refreshInterval,
                                    single: parseInt(e.target.value)
                                }
                            })}
                        >
                        </input>} >
                        </Form.Input>

                    </Form>
                </Grid.Column>
                <Grid.Column width="12">
                    <Header as="h5">
                        置顶股票操作
                    </Header>
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>
                                    股票代码
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    股票名称
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    操作
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {config!.pinnedStocks.map((item, i) => {
                                const stock = client.getStockBasicInfoByID(item);
                                return <Table.Row key={i}>
                                    <Table.Cell>
                                        {item}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {stock ? stock.name : "[股票ID错误]"}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Button color="red" size="tiny" onClick={() => {
                                            setConfig({ ...config!, pinnedStocks: config!.pinnedStocks.filter((_, j) => j !== i) });
                                        }}>删除</Button>
                                    </Table.Cell>
                                </Table.Row>
                            })}
                        </Table.Body>

                    </Table>
                </Grid.Column>
            </Grid>
            <Divider></Divider>
            <Button color="green" loading={sending} onClick={save} >
                更新配置
            </Button></>
        }
    </div>;
};

export default ConfigView;

