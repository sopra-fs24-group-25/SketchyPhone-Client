import React, { useState } from "react";
import PropTypes from "prop-types";
import "../../styles/ui/MenuButton.scss";
import "../../styles/ui/BackButton.scss";
import "../../styles/ui/HistoryPopUp.scss";
import { BackButton } from "components/ui/BackButton";
import { Button } from "./Button";

const HistoryPopUpField = (props) => {
    return (
        <div>
            <label className="history-popUp subtitle">{props.label}</label>
            <input
                className={`history-popUp input ${props.invalid ? "invalid" : ""}`}
                placeholder={props.placeholder}
                style={{ userSelect: "none" }}
                value={props.value}
                type={props.type}
                onChange={(e) => props.onChange(e.target.value)}
                disabled={props.disabled}
            />
        </div>
    );
};

HistoryPopUpField.propTypes = {
    label: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    type: PropTypes.string,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    invalid: PropTypes.bool,
};

const HistoryPopUp = (openHistory, toggleHistory, passHistoryName) => {

    const [historyName, setHistoryName] = useState<string>("");
    const [disableField, setDisableField] = useState<boolean>(false);
    const [nameTooLong, setNameTooLong] = useState<boolean>(false);

    const maxChars = 20;

    async function acceptHistoryName() {
        console.log("click accept");
        if (!historyName) {
            setHistoryName("Saved with default");
            setDisableField(true);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setDisableField(false);
            setHistoryName("");
        }
        passHistoryName(historyName);
        toggleHistory();
    }

    function cancelHistoryName() {
        console.log("click cancel");
        setHistoryName("");
        toggleHistory();
    }

    const handleChange = async (t) => {
        if (t.length > maxChars) {
            setNameTooLong(true);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setNameTooLong(false);
        } else {
            setNameTooLong(false);
            setHistoryName(t);
        }
    }

    return (
        <button className={`history-popUp screen-layer ${openHistory ? "open" : "closed"}`}>
            <div className="history-popUp container">
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                    <BackButton className="menu-backbutton"
                        disabled={true}>
                    </BackButton>
                    <BackButton className="menu-backbutton close"
                        onClick={() => cancelHistoryName()}>
                    </BackButton>
                </div>
                <div className="history-popUp title">History</div>
                <HistoryPopUpField
                    label="Name the history"
                    placeholder={`Max ${maxChars} characters`}
                    value={historyName}
                    disabled={disableField}
                    invalid={nameTooLong}
                    onChange={(t) => handleChange(t)}
                ></HistoryPopUpField>
                <div className="history-popUp button-container">
                    <Button
                        className="history-popUp button"
                        onClick={() => acceptHistoryName()}
                    >
                        Save
                    </Button>
                </div>
            </div>
        </button>
    );
}

export default HistoryPopUp;