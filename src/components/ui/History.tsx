import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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

const History = (openHistory, toggleHistory, isInGameRoom) => {

    const navigate = useNavigate();

    const defaultPassword = "password";

    const [user, setUser] = useState(new User(JSON.parse(sessionStorage.getItem("user"))));
    const [avatarId, setAvatarId] = useState<string>(user.avatarId || "");
    const [nickname, setNickname] = useState<string>(user.nickname || "");
    const [username, setUsername] = useState<string>(user.username || "");
    const [password, setPassword] = useState<string>(defaultPassword);
    const [confirmPassword, setConfirmPassword] = useState<string>(defaultPassword);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const [historyElements, setHistoryElements] = useState<[History]>(null);
    const [currentHistorySequence, setCurrentHistorySequence] = useState(null);

    useEffect(() => {
        if (openHistory) {
            console.log("Fetching history");
            fetchHistory(user);
        }

    }, [openHistory])

    const testHistory = [
        {
            "historyId": 1,
            "userId": user.userId,
            "gameSessionId": 1,
            "historyName": "history123"
        },
        {
            "historyId": 2,
            "userId": user.userId,
            "gameSessionId": 4,
            "historyName": "historyNew"
        },
        {
            "historyId": 3,
            "userId": user.userId,
            "gameSessionId": 12,
            "historyName": "historyYesterday"
        },
        {
            "historyId": 12,
            "userId": user.userId,
            "gameSessionId": 1,
            "historyName": "history123"
        },
        {
            "historyId": 24,
            "userId": user.userId,
            "gameSessionId": 4,
            "historyName": "historyNew"
        },
        {
            "historyId": 311,
            "userId": user.userId,
            "gameSessionId": 12,
            "historyName": "historyYesterdaysuperlong maegaisdhdugwf"
        },

    ]


    // function to fetch history
    async function fetchHistory(user: User) {
        try {
            const requestHeader = { "Authorization": user.token };
            const url = `/users/${user.userId}/history`;
            const response = await api.get(url, { headers: requestHeader })
            response.data = testHistory;
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
    async function fetchSequenceFromHistory(user: User, gameSessionId: number) {
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

        }
        catch (error) {
            console.log("Error while fetching history sequence: " + error);
        }
    }


    function toggleAvatar() {
        setAvatarId(avatarId % 6 + 1);
    }

    async function handleHistoryChange() {
        if (isEditing) {
            await updateUser();
            resetPasswordFields();
        } else {
            setPassword("");
            setConfirmPassword("");
        }
        setIsEditing(!isEditing);
    }

    function resetPasswordFields() {
        setPassword(defaultPassword);
        setConfirmPassword(defaultPassword);
    }

    function createAccount() {
        navigate("/login", { state: { isSignUp: true, toCreateAccount: true } });
    }

    function resetHistoryView(withToggleMenu: boolean) {
        setIsEditing(false);
        setAvatarId(user.avatarId);
        setNickname(user.nickname);
        setUsername(user.username);
        toggleHistory(withToggleMenu);
        resetPasswordFields();
    }

    async function updateUser() {
        let response;
        let updatedUser = { ...user, avatarId, nickname, username };
        if (password !== "") {
            updatedUser = { ...updatedUser, password };
        }
        if (user.userId) {
            try {
                response = await api.put(`/users/${user.userId}`, updatedUser);
            }
            catch {
                response = await api.post("/users", updatedUser);
            }
        } else {
            response = await api.post("/users", updatedUser);
        }
        let fullUser = new User(response.data);
        setUser(fullUser);
        sessionStorage.setItem("user", JSON.stringify(fullUser));
        console.log("user has been updated");
    }

    return (
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
                                    <div>
                                        {element.historyName}
                                    </div>
                                    <Button
                                        //className="history button"
                                        //key={element.historyId}
                                        width="30%"
                                        onClick={() => { fetchSequenceFromHistory(user, element.gameSessionId) }}
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
    );
}

export default History;