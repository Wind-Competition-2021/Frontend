import React, { useState } from "react";
import { Modal, Table, Button, Checkbox } from "semantic-ui-react";
import { StockBasicInfo } from "../../../client/types";
import { client } from "../../../client/WindClient";
const StockViewSearchModal: React.FC<{
    showingSearchModal: boolean;
    matchedStocks: StockBasicInfo[];
    setShowingSearchModal: (x: boolean) => void;
}> = ({
    matchedStocks,
    showingSearchModal,
    setShowingSearchModal
}) => {
        const [currentPinned, setCurrentPinned] = useState<string[]>(client.getLocalConfig()!.pinnedStocks);
        const [searchModalButtonLoading, setSearchModalButtonLoading] = useState(false);
        return <Modal open={showingSearchModal}>
            <Modal.Header>
                搜索股票
            </Modal.Header>
            <Modal.Content>
                <div style={{ height: "500px", overflowY: "scroll" }}>
                    <Table>
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>
                                    置顶
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    股票ID
                                </Table.HeaderCell>
                                <Table.HeaderCell>
                                    股票名
                                </Table.HeaderCell>
                                {/* <Table.HeaderCell>
                            行业
                        </Table.HeaderCell> */}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {(() => {
                                const pinned = new Set<string>(currentPinned);
                                return matchedStocks.map((item, i) => (<Table.Row key={i}>
                                    <Table.Cell>
                                        <Checkbox
                                            checked={pinned.has(item.id)}
                                            onClick={e => {
                                                if (pinned.has(item.id)) setCurrentPinned(currentPinned.filter(x => x !== item.id)); else setCurrentPinned([...currentPinned, item.id])
                                            }}
                                        ></Checkbox>
                                    </Table.Cell>
                                    <Table.Cell>
                                        {item.id}
                                    </Table.Cell>
                                    <Table.Cell>
                                        {item.name}
                                    </Table.Cell>
                                    {/* <Table.Cell>
                                {item.industry}
                            </Table.Cell> */}
                                </Table.Row>))
                            })()}
                        </Table.Body>
                    </Table>
                </div>
            </Modal.Content>
            <Modal.Actions>
                <Button color="green" loading={searchModalButtonLoading} onClick={(e) => {
                    setSearchModalButtonLoading(true);
                    client.updateConfig({ ...client.getLocalConfig()!, pinnedStocks: currentPinned }).then(() => {
                        setSearchModalButtonLoading(false);
                        setShowingSearchModal(false);
                    });
                }}>
                    确认
                </Button>
                <Button color="red" onClick={() => {
                    setShowingSearchModal(false);
                }}>
                    取消
                </Button>

            </Modal.Actions>
        </Modal>
    };
export default StockViewSearchModal;
