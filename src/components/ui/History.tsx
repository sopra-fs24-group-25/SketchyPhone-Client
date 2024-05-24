import React, { useState, useEffect } from "react";
import { api } from "helpers/api";
import PropTypes from "prop-types";
import "../../styles/ui/MenuButton.scss";
import "../../styles/ui/BackButton.scss";
import "../../styles/ui/History.scss";
import { BackButton } from "components/ui/BackButton";
import User from "models/User";
import { Button } from "./Button";
import SessionHistory from "../../models/SessionHistory";
import TextPrompt from "../../models/TextPrompt";
import DrawingPrompt from "models/DrawingPrompt";
import HistoryPresentation from "components/ui/HistoryPresentation";

const HistoryField = (props) => {
    return (
        <div>
            <label className="history subtitle">{props.label}</label>
            <input
                className={`history input ${props.invalid ? "invalid" : ""}`}
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

HistoryField.propTypes = {
    label: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    type: PropTypes.string,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    invalid: PropTypes.bool,
};

const History = (openHistory, toggleHistory) => {

    const [user, setUser] = useState(new User(JSON.parse(sessionStorage.getItem("user"))));

    const [openHistorySession, setOpenHistorySession] = useState<boolean>(false);
    const [historyElements, setHistoryElements] = useState<[History]>(null);
    const [currentHistorySequence, setCurrentHistorySequence] = useState(null);
    const [historyName, setHistoryName] = useState<string>("");

    useEffect(() => {
        if (openHistory) {
            setUser(new User(JSON.parse(sessionStorage.getItem("user"))));
            console.log("Fetching history");
            fetchHistory(user);
        }

    }, [openHistory])

    // function to fetch history
    async function fetchHistory(user: User) {
        try {
            const requestHeader = { "Authorization": user.token };
            const url = `/users/${user.userId}/history`;
            const response = await api.get(url, { headers: requestHeader })
            console.log(response.data);

            const fetchedHistory = response.data.map(element => {
                return new SessionHistory(element);
            });

            if (fetchedHistory !== null) {
                setHistoryElements(fetchedHistory);
            }

        }
        catch (error) {
            console.log("Error while fetching history elements: " + error);
        }
    }

    // function to fetch a sequence corresponding to history element
    async function fetchSequenceFromHistory(user: User, gameSessionId: number, name: string) {
        console.log("fetching with", user, `gameSessionId ${gameSessionId}`)
        try {
            const requestHeader = { "Authorization": user.token, "X-User-ID": user.userId };
            const url = `/games/${gameSessionId}/sequence`;
            const response = await api.get(url, { headers: requestHeader });
            console.log(response.data);


            const fetchedHistorySequence = response.data.map(element => {
                if (element.drawingId === undefined) {
                    return new TextPrompt(element);
                } else {
                    return new DrawingPrompt(element);
                }
            });
            if (fetchedHistorySequence) {
                setCurrentHistorySequence(fetchedHistorySequence);
            }
            setHistoryName(name);
            setOpenHistorySession(true);
            toggleHistory(false);
        }
        catch (error) {
            console.log("Error while fetching history sequence: " + error);
        }
    }

    function resetHistoryView(withToggleMenu: boolean) {
        toggleHistory(withToggleMenu);
    }

    function toggleHistorySession(withToggleHistory: boolean) {
        if (withToggleHistory) {
            toggleHistory(!withToggleHistory);
        }
    }

    return (
        <div>
            <button className={`history screen-layer ${openHistory ? "open" : "closed"}`}>
                <div className="history container">
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                        <BackButton className="menu-backbutton"
                            onClick={() => resetHistoryView(true)}>
                        </BackButton>
                        <BackButton className="menu-backbutton close"
                            onClick={() => resetHistoryView(false)}>
                        </BackButton>
                    </div>
                    <div className="history title">History</div>
                    {historyElements?.length !== 0 &&
                        <button className="history scroll-container">
                            {historyElements?.map((element) => {
                                return (
                                    <div
                                        className="history button-container"
                                        key={element.historyId}>
                                        <div className="history name">
                                            {element.historyName}
                                        </div>
                                        <Button
                                            width="30%"
                                            onClick={() => { fetchSequenceFromHistory(user, element.gameSessionId, element.historyName) }}
                                        >
                                            Open
                                        </Button>
                                    </div>
                                )
                            })}
                        </button>
                    }
                    {historyElements?.length === 0 &&
                    <div className="history no-history"
                    >
                        No history yet
                    </div>}
                </div>
            </button>
            <button className={`history screen-layer ${openHistorySession ? "open" : "closed"}`}>
                {currentHistorySequence && HistoryPresentation(currentHistorySequence, toggleHistorySession, openHistorySession, setOpenHistorySession, historyName)}
            </button>
        </div>
    );
}

export default History;