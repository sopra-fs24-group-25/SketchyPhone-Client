import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import { Button } from "components/ui/Button";
import { useLocation, useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import { BackButton } from "components/ui/BackButton";
import { BurgerMenu } from "components/ui/BurgerMenu";
import Menu from "components/ui/Menu";
import PropTypes from "prop-types";
import "styles/views/GameRoom.scss";
import "styles/views/GameJoin.scss";
import User from "models/User";
import Game from "models/Game";
import AvatarChoice from "components/ui/AvatarChoice";
import Avatar from "models/Avatar";
import { resolveTypeReferenceDirective } from "typescript";

const JoinField = (props) => {
    return (
        <div className="join field">
            <label className="join label">{props.label}</label>
            <input
                className={`join input ${props.disabled ? "invalid" : ""}`}
                placeholder={props.placeholder}
                style={{ userSelect: "none" }}
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
    const location = useLocation();

    const [isGameCreator, setIsGameCreator] = useState(location.state ? location.state.isGameCreator : false); // If we pass a state with location
    const [game, setGame] = useState<Game>(null);
    const [pin, setPin] = useState<string>("");
    const [pinInvalid, setPinInvalid] = useState<Boolean>(false);
    const [nickname, setNickname] = useState<string>("");
    const [avatarId, setAvatarId] = useState<number>(null);
    const [avatarSelection, setAvatarSelection] = useState<[]>(Array(0));
    const [view, setView] = useState<string>("nicknameView"); // If is gamecreator we dont show the pin
    const [openMenu, setOpenMenu] = useState<Boolean>(false);
    const [countdownNumber, setCountdownNumber] = useState<number>(null);
    const [user, setUser] = useState(new User(JSON.parse(sessionStorage.getItem("user"))));

    const toggleMenu = () => {
        setOpenMenu(!openMenu);
    }

    const goBack = (): void => {
        //does not work anymore, enters a newly created room when exiting
        setCountdownNumber(0);
        setGame(null);
        setIsGameCreator(false);
        setPin("");
        sessionStorage.removeItem("numCycles");
        sessionStorage.removeItem("gameSpeed");
        sessionStorage.removeItem("isEnabledTTS");
        sessionStorage.removeItem("gameRoom");
        sessionStorage.removeItem("gameroomToken");
        navigate("/gameRoom", { state: { isGameCreated: false, gameRoom: null } });
    };

    const chooseAvatar = (index: number) => {
        setAvatarId(index);
        avatarSelection.forEach(function (a) {
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
        var status;
        var numChecks = 4;
        while (numChecks >= 0) {
            numChecks -= 1;
            try {
                const requestBody = { "nickname": nickname, "password": "defaultPassword" }
                const response = await api.post(`/gameRooms/join/${pin}`, requestBody);
                const room = new Game(response.data);
                sessionStorage.setItem("gameroomToken", room.gameToken);

                if (room.status === "OPEN") {
                    console.log("room open");
                    setView("openRoomView");
                    await new Promise((resolve) => setTimeout(resolve, 2000));
                    navigate("/gameRoom", { state: { isGameCreated: false, gameRoom: room } });

                    return;
                } else if (room.status === "IN-PLAY" || status === "in play") {
                    console.log("in waiting room");
                    setView("waitingRoomView");
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                } else if (room.status === "CLOSED" || status === "closed") {
                    console.log("room closed");
                    setView("unavailableRoomView");
                    await startCountdown(5);
                    navigate("/gameRoom", { state: { isGameCreated: false, gameRoom: null } });

                    return;
                } else {
                    console.log("not fetched room info yet");
                    setView("waitingRoomView");
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                }
            } catch (error) {
                console.log("in error")
                status = error.response.data.message;
                if (numChecks === 0) {
                    status = "closed";
                }
                if (status.includes("in play")) {
                    status = "in play";
                    console.log("in waiting room");
                    setView("waitingRoomView");
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                } else if (status.includes("closed")) {
                    status = "closed";
                    console.log("room closed");
                    setView("unavailableRoomView");
                    await startCountdown(5);
                    navigate("/gameRoom", { state: { isGameCreated: false, gameRoom: null } });

                    return;
                } else {
                    console.log("nothing in error");
                    setView("pinView");
                    throw new Error;
                }
            }
        }
    }

    const validatePin = async () => {
        try {
            await checkRoomAvailability();
        } catch (error) {
            setPinInvalid(true);
            await new Promise((resolve) => setTimeout(resolve, 500));
            setPin("Invalid PIN!");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setPinInvalid(false);
            setPin("");
        }
    }

    const validateNickname = async () => {
        try {
            // Lets assume the nickname is valid
            var updatedUser = {...user, nickname};
            var response;
            if (updatedUser.id) {
                try {
                    response = await api.put(`/users/${user.id}`, updatedUser);
                }
                catch {
                    response = await api.post("/users", updatedUser);
                }
            } else {
                response = await api.post("/users", updatedUser);
            }
            var fullUser = new User(response.data);
            setUser(fullUser);
            sessionStorage.setItem("user", JSON.stringify(fullUser));

            setAvatarId(null);

            //fetch avatars GET avatars
            response = true//await api.post(`/gameRooms/join/${pin}`);
            if (response === true) { // fix later with correct server behavior
                const fetchedAvatars = Array(
                    new Avatar({ id: 1 }),
                    new Avatar({ id: 2 }),
                    new Avatar({ id: 3 }),
                    new Avatar({ id: 4 }),
                    new Avatar({ id: 6 }),
                    new Avatar({ id: 8 }),
                    new Avatar({ id: 12 }),
                    new Avatar({ id: 9 }),
                    new Avatar({ id: 87 }),
                    new Avatar({ id: 412 }),
                    new Avatar({ id: 6424 }),
                    new Avatar({ id: 844 }),
                    new Avatar({ id: 123 }),
                    new Avatar({ id: 921 }),
                );//await api.get(`/users/${UserId}`) //implement correct request
                setAvatarSelection(fetchedAvatars);
                setView("avatarView");
            }
        }
        catch (error) {
            alert(
                `Something went wrong during joining: \n${handleError(error)}`
            );
        }
    }

    const validateAvatar = async () => {
        try {
            // MISSING validate
            var updatedUser = {...user, avatarId}; //avatarId not available on server yet
            var response;
            if (updatedUser.id) {
                try {
                    response = await api.put(`/users/${user.id}`, updatedUser);
                }
                catch {
                    response = await api.post("/users", updatedUser);
                }
            } else {
                response = await api.post("/users", updatedUser);
            }
            var fullUser = new User(response.data);
            setUser(fullUser);
            sessionStorage.setItem("user", JSON.stringify(fullUser));

            
            isGameCreator ? navigate("/gameRoom", { state: { isGameCreator: isGameCreator } }) : setView("pinView");
            
        }
        catch (error) {
            alert(
                `Something went wrong during joining: \n${handleError(error)}`
            );
        }
    }

    const drawAvatar = async () => {
        console.log("drawing avatar");
        try {
            const response = true//await api.post(`/gameRooms/join/${pin}`);
            if (response === true) { // fix later with correct server behavior
                //navigate("/game") // temporary
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
        return (
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
                        <img src={require("../../icons/ChubbyGuy.png")} draggable="false" />
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
                    disabled={pinInvalid}
                ></JoinField>
                <Button
                    disabled={!pin || pinInvalid}
                    width="50%"
                    onClick={() => validatePin()}>
                    Continue
                </Button>
            </div>,
            () => setView("avatarView")
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
                    disabled={!nickname}
                    width="50%"
                    onClick={() => validateNickname()}>
                    Continue
                </Button>
            </div>,
            () => goBack()
        );
    }

    function avatarView() {
        return baseView(
            <div className="gameroom buttons-container" style={{ "alignItems": "left" }}>
                <div className="join label">Choose avatar</div>
                <div className="start sign-in-link"
                    onClick={() => drawAvatar()}>
                    or personalize your own avatar!</div>
                <AvatarChoice
                    avatarList={avatarSelection}
                    choose={(id) => chooseAvatar(id)}>
                </AvatarChoice>
                <Button
                    disabled={!avatarId}
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
            <div className="gameroom buttons-container" style={{ "alignItems": "left" }}>
                <div className="join title">Waiting room...</div>
                <Spinner></Spinner>
                <text>
                    Please wait. The game room is currently hosting a game. You will be granted access by the admin once this game session concludes.
                </text>
            </div>,
            () => goBack()
        );
    }

    function unavailableRoomView() {
        return baseView(
            <div className="gameroom buttons-container" style={{ "alignItems": "left" }}>
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

    function openRoomView() {
        return baseView(
            <div className="gameroom buttons-container" style={{ "alignItems": "left" }}>
                <div className="join title">Joining room...</div>
                <Spinner></Spinner>
                <text>
                    Please wait. In just a moment you&apos;ll be redirected to the room.
                </text>
            </div>,
            () => goBack(),
            "mid",
            false
        );
    }

    let renderComponent;

    if (view === "pinView") {
        renderComponent = pinView();
    }
    else if (view === "nicknameView") {
        renderComponent = nicknameView();
    }
    else if (view === "avatarView") {
        renderComponent = avatarView();
    }
    else if (view === "waitingRoomView") {
        renderComponent = waitingRoomView();
    }
    else if (view === "unavailableRoomView") {
        renderComponent = unavailableRoomView();
    }
    else if (view === "openRoomView") {
        renderComponent = openRoomView();
    }

    return renderComponent;

}

export default GameJoin;