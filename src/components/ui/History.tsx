import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "helpers/api";
import PropTypes from "prop-types";
import "../../styles/ui/MenuButton.scss";
import "../../styles/ui/BackButton.scss";
import "../../styles/ui/History.scss";
import { BackButton } from "components/ui/BackButton";
import AvatarPreview from "./AvatarPreview";
import User from "models/User";
import { Button } from "./Button";

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
        navigate("/login", { state: {isSignUp: true, toCreateAccount: true}});
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
        let updatedUser = {...user, avatarId, nickname, username};
        if (password !== "") {
            updatedUser = {...updatedUser, password};
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
        console.log("user has been updated")
    }

    return (
        <div className={`history screen-layer ${openHistory ? "open" : "closed"}`}>
            <div className="history container">
                <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                    <BackButton className="menu-backbutton"
                        onClick={() => resetHistoryView(true)}>
                    </BackButton>
                    <BackButton className="menu-backbutton close"
                        onClick={() => resetHistoryView(false)}>
                    </BackButton>
                </div>
                <div className="history title">History</div>
                <div className="history field">
                    <AvatarPreview
                        className="inactive"
                        id={avatarId || 0}
                        onClick={() => toggleAvatar()}
                        disabled={!isEditing}>
                    </AvatarPreview>
                    <HistoryField
                        className="history input"
                        label="Nickname"
                        placeholder={nickname}
                        value={nickname}
                        disabled={!isEditing}
                        onChange={(n: string) => setNickname(n)}>
                    </HistoryField>
                    {user.persistent && !isInGameRoom ?
                        <><HistoryField
                            className="history input"
                            label="Username"
                            placeholder={username}
                            value={username}
                            disabled={!isEditing}
                            onChange={(u: string) => setUsername(u)}>
                        </HistoryField>
                        <HistoryField
                            className="history input"
                            label="Password"
                            placeholder="Password"
                            value={password}
                            disabled={!isEditing}
                            type="password"
                            onChange={(p: string) => setPassword(p)}>
                        </HistoryField>
                        <HistoryField
                            className="history input"
                            label="Confirm Password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            disabled={!isEditing}
                            type="password"
                            onChange={(p: string) => setConfirmPassword(p)}>
                        </HistoryField></>
                        : null}
                    <Button
                        width="25%"
                        onClick={() => handleHistoryChange()}
                        disabled={user.persistent ? isEditing && (!nickname || !username) || password !== confirmPassword : isEditing && !nickname}
                    >
                        {isEditing ? "Save": "Edit"}
                    </Button>
                    {!user.persistent && !isInGameRoom ?
                        <button className={"history sign-in-link"}
                            onClick={() => createAccount()}
                        >
                            Create account
                        </button>: null}
                </div>
            </div>
        </div>
    );
}

export default History;