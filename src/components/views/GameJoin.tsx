import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import { Button } from "components/ui/Button";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import { BackButton } from "components/ui/BackButton";
import { BurgerMenu } from "components/ui/BurgerMenu";
import PropTypes from "prop-types";
import "styles/views/GameRoom.scss";
import "styles/views/GameJoin.scss";
import { User } from "types";
import GameRoomDetails from "models/GameRoomDetails";
import Game from "./Game";
import { AvatarChoice } from "components/ui/AvatarChoice";
import Avatar from "models/Avatar";

const JoinField = (props) => {
    return (
        <div className="join field">
            <label className="join label">{props.label}</label>
            <input
                className="join input"
                placeholder={props.placeholder}
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
            />
        </div>
    );
};

JoinField.propTypes = {
    label: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
};

const GameJoin = () => {

    const navigate = useNavigate();
    const [name, setName] = useState<string>("noah");
    const [username, setUsername] = useState<string>("crisaak");
    const [gameRoom, setGameRoom] = useState<typeof GameJoin>(null);
    const [pin, setPin] = useState<string>("");
    const [nickname, setNickname] = useState<string>("");
    const [avatar, setAvatar] = useState<number>(null);
    const [avatarSelection, setAvatarSelection] = useState<[]>(Array(0));
    const [view, setView] = useState<string>("pinView");

    const open_menu = (): void => {
        //open menu with profile, settings, and logout
    };

    const logout = (): void => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const goBack = (): void => {
        navigate("/GameRoom");
    };

    const chooseAvatar = (index: number) => {
        setAvatar(index);
        avatarSelection.forEach(function(a) {
            if (a.id === index) {
                a.selected = "active";
            } else {
                a.selected = "inactive";
            }
            
        })
        //avatarSelection.find(({ id }) => id === index).selected = "active";
        console.log("eojh");
    }
    

    const validatePin = async () => {
        try {
            const response = true//await api.post(`/gameRooms/join/${pin}`);
            if (response === true) { // fix later with correct server behavior
                setView("nicknameView");
            }
            //console.log(response.data);
        }
        catch (error) {
            alert(
                `Something went wrong during joining: \n${handleError(error)}`
            );
        }
    }

    const validateNickname = async () => {
        try {
            setAvatar(null);

            const response = true//await api.post(`/gameRooms/join/${pin}`);
            if (response === true) { // fix later with correct server behavior
                const fetchedAvatars = Array(
                    new Avatar({id: 1}),
                    new Avatar({id: 2}),
                    new Avatar({id: 300})
                );//await api.get(`/users/${UserId}`) //implement correct request
                setAvatarSelection(fetchedAvatars);
                setView("avatarView");
            }
            //console.log(response.data);
        }
        catch (error) {
            alert(
                `Something went wrong during joining: \n${handleError(error)}`
            );
        }
    }

    const validateAvatar = async () => {
        try {
            const response = true//await api.post(`/gameRooms/join/${pin}`);
            if (response === true) { // fix later with correct server behavior
                navigate("/game") // temporary
            }
            //console.log(response.data);
        }
        catch (error) {
            alert(
                `Something went wrong during joining: \n${handleError(error)}`
            );
        }
    }

    const drawAvatar = async () => {
        try {
            const response = true//await api.post(`/gameRooms/join/${pin}`);
            if (response === true) { // fix later with correct server behavior
                navigate("/game") // temporary
            }
            //console.log(response.data);
        }
        catch (error) {
            alert(
                `Something went wrong during joining: \n${handleError(error)}`
            );
        }
    }

    function baseView(content, goPlace) {
        return ( //temporary logout with back button, needs to be in burger menu later
            <BaseContainer>
                <div className="gameroom header">
                    <BurgerMenu onClick={() => open_menu()}></BurgerMenu>
                </div>
                <div className="gameroom container">
                    <BackButton onClick={() => goPlace()}></BackButton>
                    {content}
                    <div className="mascot">
                        <img src={require("../../icons/ChubbyGuy.png")} draggable="false"/>
                    </div>
                </div>
            </BaseContainer>
        );
    }

    function pinView() {
        return baseView(
            <div className="gameroom buttons-container">
                <JoinField
                    label="Insert game PIN"
                    placeholder="Game PIN"
                    value={pin}
                    onChange={(p: string) => setPin(p)}
                ></JoinField>
                <Button
                    disabled={pin === "" ? true : false}
                    width="80%"
                    onClick={() => validatePin()}>
                    Continue
                </Button>
            </div>,
            () => goBack()
        );
    }

    function nicknameView() {
        return baseView(
            <div className="gameroom buttons-container">
                <JoinField
                    label="Set nickname"
                    placeholder="Nickname"
                    value={nickname}
                    onChange={(n: string) => setNickname(n)}
                ></JoinField>
                <Button
                    disabled={nickname === "" ? true : false}
                    width="80%"
                    onClick={() => validateNickname()}>
                    Continue
                </Button>
            </div>,
            () => setView("pinView")
        );
    }

    function avatarView() {
        return baseView(
            <div className="gameroom buttons-container" style={{"alignItems":"left"}}>
                <div className="join label">Choose avatar</div>
                <text className="start sign-in-link"
                    onClick={() => drawAvatar()}
                >or personalize your own avatar!</text>
                <AvatarChoice
                    avatarList={avatarSelection}
                    choose={(id) => chooseAvatar(id)}
                >
                </AvatarChoice>
                <Button
                    disabled={avatar === null ? true : false}
                    width="80%"
                    onClick={() => validateAvatar()}>
                    Continue
                </Button>
            </div>,
            () => setView("nicknameView")
        );
    }

    if (view === "pinView") {
        return pinView();
    }
    if (view === "nicknameView") {
        return nicknameView();
    }
    if (view === "avatarView") {
        return avatarView();
    }
    
}

export default GameJoin;