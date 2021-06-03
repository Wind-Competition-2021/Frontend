import React from "react";
import ReactDOM from "react-dom";
import { Icon, Message, Transition } from "semantic-ui-react";
export function showAutoDisappearPopup(component: React.ReactElement, timeout: number = 3000) {
    let elem = document.createElement("div");
    ReactDOM.render(<Transition
        visible={true}
        animation="fade"
        duration={200}
        unmountOnHide
    >
        <div>
            {component}
        </div>
    </Transition>, elem);
    elem.style.position = "absolute";
    elem.style.top = `${document.documentElement.scrollTop + 100}px`;
    elem.style.zIndex = "99999";
    document.body.appendChild(elem);
    elem.style.left = (document.body.clientWidth / 2 - elem.clientWidth / 2).toString() + "px";
    setTimeout(() => {
        elem.remove();
    }, timeout);
}
export function showSuccessPopup(message: string, timeout: number = 3000) {
    showAutoDisappearPopup(<Message compact floating style={{ width: "100%" }}>
        <p style={{ textAlign: "center" }}><Icon name="checkmark" color="green"></Icon>{message}</p>
    </Message>, timeout)
};
(window as (typeof window & { popup: any })).popup = showSuccessPopup;