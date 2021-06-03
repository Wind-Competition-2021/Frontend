import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Button, Header, Modal } from "semantic-ui-react";

interface PropType {
    title: string;
    content: string;
};

const StockDetailModal: React.FC<PropType> = ({ content, title }) => {
    const [showing, setShowing] = useState(true);
    return <Modal
        open={showing}
        size="small"
        closeOnDimmerClick
        closeOnDocumentClick
    >
        <Header content={title}></Header>
        <Modal.Content>
            <div style={{ overflowY: "scroll" }}>
                {content}
            </div>
        </Modal.Content>
        <Modal.Actions>
            <Button color="blue" onClick={() => setShowing(false)}>关闭</Button>
        </Modal.Actions>
    </Modal>
};


export function showStockDetailModal(title: string, message: string): void {
    const target = document.createElement("div");
    ReactDOM.render(<StockDetailModal content={message} title={title}></StockDetailModal>, target);
}