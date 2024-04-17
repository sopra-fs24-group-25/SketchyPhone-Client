import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import { Button } from "components/ui/Button";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import { BackButton } from "components/ui/BackButton";
import { BurgerMenu } from "components/ui/BurgerMenu";
import Menu from "components/ui/Menu";
import PropTypes from "prop-types";
import "styles/views/GameRoom.scss";
import "styles/views/GameJoin.scss";
import { User } from "types";
import GameRoom from "models/GameRoom";
import Game from "./Game";
import { AvatarChoice } from "components/ui/AvatarChoice";
import Avatar from "models/Avatar";

const JoinField = (props) => {
    return (
        <div className="join field">
            <label className="join label">{props.label}</label>
            <input
                className={`join input ${props.disabled ? "invalid" : ""}`}
                placeholder={props.placeholder}
                style={{userSelect:"none"}}
                value={props.value}
                onChange={(e) => props.onChange(e.target.value)}
                disabled={props.disabled}
            />
        </div>
    );
};

JoinField.propTypes = {
    label: PropTypes.string,
    placeholder: PropTypes.string,
    value: PropTypes.string,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
};

const GameJoin = () => {

    const navigate = useNavigate();
    const [name, setName] = useState<string>("noah");
    const [gameRoom, setGameRoom] = useState<typeof GameJoin>(null);
    const [pin, setPin] = useState<string>("");
    const [pinInvalid, setPinInvalid] = useState<Boolean>(false);
    const [nickname, setNickname] = useState<string>("");
    const [avatar, setAvatar] = useState<number>(null);
    const [avatarSelection, setAvatarSelection] = useState<[]>(Array(0));
    const [view, setView] = useState<string>("pinView");
    const [openMenu, setOpenMenu] = useState<Boolean>(false);
    const [countdownNumber, setCountdownNumber] = useState<number>(null);

    const toggleMenu = () => {
        setOpenMenu(!openMenu);
    }

    const goBack = (): void => {
        setCountdownNumber(0);
        sessionStorage.removeItem("GameRoomToken");
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
    }

    const startCountdown = async (i: number) => {
        var counter = i;
        while (true) {
            if (counter <= 0) {
                return;
            } else {
                setCountdownNumber(counter);
                await new Promise((resolve) => setTimeout(resolve, 1000));
                counter -= 1;
                console.log(counter);
            }
        }
    }

    const checkRoomAvailability = async () => {
        var array = ["IN-PLAY", "IN-PLAY", "OPEN", "CLOSED"];
        var room : GameRoom;
        setView("waitingRoomView");
        while (true) {
            const response = 0//GET gameroom status
            room = new GameRoom({status: array[Math.floor(Math.random() * array.length)]});
            if (room.status === "OPEN") {
                //navigate to active gameroom
                console.log("open");
                //navigate("/lobby");
                await new Promise((resolve) => setTimeout(resolve, 1000));
                setView("openRoomView");
                await startCountdown(3);
                navigate("/GameRoom");
                
                return;
            } else if (room.status === "IN-PLAY") {
                console.log("waiting");
                setView("waitingRoomView");
                await new Promise((resolve) => setTimeout(resolve, 5000));
            } else if (room.status === "CLOSED") {
                console.log("closed");
                setView("unavailableRoomView");
                await startCountdown(5);
                navigate("/GameRoom");
                
                return;
            }
        }
    }

    const validatePin = async () => {
        try {
            const requestBody = {"name": name, "password": "defaultPassword"}
            const response = await api.post(`/gameRooms/join/${pin}`, requestBody);
            const room = new GameRoom({status: "OPEN"});

            console.log(response);

            setGameRoom(room);
            if (pin === "123") { // fix later with correct server behavior
                sessionStorage.setItem("GameRoomToken", room.token);
                setView("nicknameView");
                if (room.status === "OPEN") {
                    //potentially tell server that user will join soon
                }
            } else {
                setPinInvalid(true);
                setPin("Invalid PIN!");
                await new Promise((resolve) => setTimeout(resolve, 2000));
                setPinInvalid(false);
                setPin("");
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

            //fetch avatars GET avatars
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
            //fetch room again to verify if still open
            checkRoomAvailability();
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

    function baseView(content, goPlace, placement = "mid", visible = true) {
        return ( //temporary logout with back button, needs to be in burger menu later
            <BaseContainer>
                <div className="gameroom header">
                    <BurgerMenu
                        onClick={() => setOpenMenu(!openMenu)}
                        disabled={openMenu}>
                    </BurgerMenu>
                </div>
                <div className={`join container-${placement}`}>
                    <BackButton
                        onClick={() => goPlace()}
                        disabled={!visible}></BackButton>
                    {content}
                    <div className="mascot">
                        <img src={require("../../icons/ChubbyGuy.png")} draggable="false"/>
                    </div>
                </div>
                {Menu(openMenu, toggleMenu)}
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
                    disabled={pinInvalid ? true : false}
                ></JoinField>
                <Button
                    disabled={pin === "" ? true : false}
                    width="50%"
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
                    width="50%"
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
                    onClick={() => drawAvatar()}>
                    or personalize your own avatar!</text>
                <AvatarChoice
                    avatarList={avatarSelection}
                    choose={(id) => chooseAvatar(id)}>
                </AvatarChoice>
                <Button
                    disabled={avatar === null ? true : false}
                    width="50%"
                    onClick={() => validateAvatar()}>
                    Continue
                </Button>
            </div>,
            () => setView("nicknameView"),
            "up"
        );
    }

    function waitingRoomView() {
        return baseView(
            <div className="gameroom buttons-container" style={{"alignItems":"left"}}>
                <div className="join title">Waiting room...</div>
                <Spinner></Spinner>
                <text>
                    Please wait. The game room is currently hosting a game. You will be granted access by the admin once this game session concludes.
                </text>
            </div>,
            () => setView("avatarView")
        );
    }

    function unavailableRoomView() {
        return baseView(
            <div className="gameroom buttons-container" style={{"alignItems":"left"}}>
                <div className="join title">Room currently unavailable...</div>
                <text>
                    The game room is no longer active. Please return and insert a new game PIN to start a new session.
                </text>
                <h2 className="join label">Going back in...</h2>
                <h2 className="join title">{countdownNumber} seconds</h2>
            </div>,
            () => goBack(),
            "mid",
            false
        );
    }

    function openRoomView() { //temporary
        return baseView(
            <div className="gameroom buttons-container" style={{"alignItems":"left"}}>
                <div className="join title">Temporary view for open game...</div>
                <text>
                    Will redirect to active game room in future.
                </text>
                <h2 className="join label">Going back in...</h2>
                <h2 className="join title">{countdownNumber} seconds</h2>
            </div>,
            () => goBack(),
            "mid",
            false
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
    if (view === "waitingRoomView") {
        return waitingRoomView();
    }
    if (view === "unavailableRoomView") {
        return unavailableRoomView();
    }
    if (view === "openRoomView") { //temporary
        return openRoomView();
    }
    
}

export default GameJoin;