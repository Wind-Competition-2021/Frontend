import React, { useEffect, useState } from "react";
import { Button, Form, Icon } from "semantic-ui-react";
import { Config } from "../../../client/types";
import { client } from "../../../client/WindClient";
import DayPickerInput from "react-day-picker/DayPickerInput";
import { showErrorPopup, showSuccessPopup } from "../../../dialogs/Util";
interface ReplayConfig {
    start: Date;
    end: Date;
    // speed: number;
}

const ReplayConfigForm: React.FC<{ data: ReplayConfig; replaying: boolean; callback: (d: ReplayConfig) => void; stopCallback: () => void; }> = ({ callback, data, stopCallback, replaying }) => {
    const [config, setConfig] = useState(data);
    // const [replaySpeed, setReplaySpeed] = useState(client.getLocalConfig()!.playbackSpeed);
    // const [speedModified, setSpeedModified] = useState(false);
    // const [loading, setLoading] = useState(false);
    const [paused, setPaused] = useState(false);
    const [minusLoading, setMinusLoading] = useState(false);
    const [addLoading, setaddLoading] = useState(false);

    useEffect(() => {
        if (replaying) {
            setPaused(false);
        }
    }, [replaying]);
    const updateSpeed = async (speed: number, loadingUpdater: (b: boolean) => void) => {
        if (speed < 1 || speed > 1500) {
            showErrorPopup("回放速度必须在1到1500之间");
            return;
        }
        loadingUpdater(true);
        try {
            const config: Config = { ...client.getLocalConfig()!, playbackSpeed: speed };
            await client.updateConfig(config);
            showSuccessPopup(`速度已更改为: ${speed}`);
        } catch (e) {
            showErrorPopup(`更新失败: ${e}`);
            throw e;
        } finally {
            loadingUpdater(false);
        }
    };
    return <Form>
        <Form.Group widths="16">
            {!replaying && <>
                <Form.Field>
                    {/* <label>开始日期</label> */}
                    <DayPickerInput dayPickerProps={{ className: "most-top" }} value={config.start} onDayChange={d => setConfig({ ...config, start: d })}></DayPickerInput>
                </Form.Field>
                <Form.Field >
                    {/* <label>结束日期</label> */}
                    <DayPickerInput dayPickerProps={{ className: "most-top" }} value={config.end} onDayChange={d => setConfig({ ...config, end: d })}></DayPickerInput>
                </Form.Field>
            </>}
            {/* <Form.Field >
                <label>回放速度</label>
                <Input type="number" value={replaySpeed} onChange={e => {
                    setReplaySpeed(parseInt(e.target.value));
                    setSpeedModified(true);
                }}></Input>
            </Form.Field> */}
            <Form.Field>
                {/* <label>操作</label> */}
                {/* <label></label> */}
                {!replaying && <Button icon color="green" size="tiny" onClick={() => {
                    (async () => {
                        // if (speedModified) {
                        //     setLoading(true);
                        //     try {
                        //         const newConfig: Config = { ...client.getLocalConfig()!, playbackSpeed: replaySpeed };
                        //         await client.updateRemoteConfig(newConfig);
                        //         client.setLocalConfig(newConfig);
                        //         setLoading(false);
                        //         callback(config);
                        //     } catch (e) {
                        //         throw e;
                        //     } finally {
                        //         setLoading(false);
                        //     }
                        // } else {
                        callback(config);
                        // }
                    })();
                }}>
                    {/* 开始重放 */}
                    <Icon name="play"></Icon>
                </Button>}
                {replaying && <Button.Group>
                    {paused ? <Button icon color="green" size="tiny" onClick={() => {
                        client.sendReplayControlPacket("resume");
                        setPaused(false);

                    }}><Icon name="play"></Icon></Button> : <Button icon color="red" size="tiny" onClick={() => {
                        client.sendReplayControlPacket("stop");
                        setPaused(true);

                    }}><Icon name="pause"></Icon>
                    </Button>}

                    <Button icon color="red" size="tiny" onClick={stopCallback}>
                        {/* 停止重放 */}
                        <Icon name="stop"></Icon>
                    </Button>
                    <Button icon color="orange" size="tiny" loading={minusLoading} onClick={e => {
                        updateSpeed(Math.floor(client.getLocalConfig()!.playbackSpeed / 2), setMinusLoading);
                    }} >
                        <Icon name="angle double left"></Icon>
                    </Button>
                    <Button icon color="orange" size="tiny" loading={addLoading} onClick={e => {
                        updateSpeed(client.getLocalConfig()!.playbackSpeed * 2, setaddLoading);
                    }} >
                        <Icon name="angle double right"></Icon>
                    </Button>

                </Button.Group>}

            </Form.Field>
        </Form.Group>
    </Form>;
};
export type {
    ReplayConfig
};
export default ReplayConfigForm;