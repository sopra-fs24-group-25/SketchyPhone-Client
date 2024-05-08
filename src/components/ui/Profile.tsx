import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "helpers/api";
import PropTypes from "prop-types";
import "../../styles/ui/MenuButton.scss";
import "../../styles/ui/BackButton.scss";
import "../../styles/ui/Profile.scss";
import { BackButton } from "components/ui/BackButton";
import AvatarPreview from "./AvatarPreview";
import User from "models/User";
import { Button } from "./Button";

const ProfileField = (props) => {
    return (
        <div>
            <label className="profile subtitle">{props.label}</label>
            <input
                className={`profile input ${props.invalid ? "invalid" : ""}`}
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

ProfileField.propTypes = {
    label: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    type: PropTypes.string,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    invalid: PropTypes.bool,
};

const Profile = (openProfile, toggleProfile, isInGame) => {

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

    async function handleProfileChange() {
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

    function resetProfileView(withToggleMenu: boolean) {
        setIsEditing(false);
        setAvatarId(user.avatarId);
        toggleProfile(withToggleMenu);
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
        <div className={`profile screen-layer ${openProfile ? "open" : "closed"}`}>
            <div className="profile container">
                <div style={{display: "flex", flexDirection: "row", justifyContent: "space-between"}}>
                    <BackButton className="menu-backbutton"
                        onClick={() => resetProfileView(true)}>
                    </BackButton>
                    <BackButton className="menu-backbutton close"
                        onClick={() => resetProfileView(false)}>
                    </BackButton>
                </div>
                <div className="profile title">Profile</div>
                <div className="profile field">
                    <AvatarPreview
                        className="inactive"
                        id={avatarId || 0}
                        onClick={() => toggleAvatar()}
                        disabled={!isEditing}>
                    </AvatarPreview>
                    <ProfileField
                        className="profile input"
                        label="Nickname"
                        placeholder={nickname}
                        value={nickname}
                        disabled={!isEditing}
                        onChange={(n: string) => setNickname(n)}>
                    </ProfileField>
                    {user.persistent && !isInGame ?
                        <><ProfileField
                            className="profile input"
                            label="Username"
                            placeholder={username}
                            disabled={!isEditing}
                            onChange={(u: string) => setUsername(u)}>
                        </ProfileField>
                        <ProfileField
                            className="profile input"
                            label="Password"
                            placeholder="Password"
                            value={password}
                            disabled={!isEditing}
                            type="password"
                            onChange={(p: string) => setPassword(p)}>
                        </ProfileField>
                        <ProfileField
                            className="profile input"
                            label="Confirm Password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            disabled={!isEditing}
                            type="password"
                            onChange={(p: string) => setConfirmPassword(p)}>
                        </ProfileField></>
                        : null}
                    <Button
                        width="25%"
                        onClick={() => handleProfileChange()}
                        disabled={user.persistent ? isEditing && (!nickname || !username) || password !== confirmPassword : isEditing && !nickname}
                    >
                        {isEditing ? "Save": "Edit"}
                    </Button>
                    {!user.persistent && !isInGame ?
                        <button className={"profile sign-in-link"}
                            onClick={() => createAccount()}
                        >
                            Create account
                        </button>: null}
                </div>
            </div>
        </div>
    );
}

export default Profile;