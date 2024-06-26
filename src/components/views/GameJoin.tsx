import React, { useState } from "react";
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

    const [user, setUser] = useState(new User(JSON.parse(sessionStorage.getItem("user"))));
    const [isGameCreator, setIsGameCreator] = useState(location.state ? location.state.isGameCreator : false); // If we pass a state with location
    const [avatarSelection, setAvatarSelection] = useState<[]>(Array(0));
    const [avatarId, setAvatarId] = useState<number>(user.avatarId || "");
    const [nickname, setNickname] = useState<string>(user.nickname || "");
    const [pin, setPin] = useState<string>("");
    const [pinInvalid, setPinInvalid] = useState<boolean>(false);
    const [view, setView] = useState<string>("nicknameView"); // If is gameCreator we don't show the pin
    const [isFullRoom, setIsFullRoom] = useState<boolean>(false);
    const [openMenu, setOpenMenu] = useState<boolean>(false);
    const [countdownNumber, setCountdownNumber] = useState<number>(null);

    const toggleMenu = () => {
        setOpenMenu(!openMenu);
    }

    const goBack = (): void => {
        //does not work anymore, enters a newly created room when exiting
        setCountdownNumber(0);
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
            if (a.avatarId === index) {
                a.selected = "active";
            } else {
                a.selected = "inactive";
            }
        })
    }

    const startCountdown = async (i: number) => {
        let counter = i;
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

    async function doRoomOpen(room: Game) {
        console.log("room open");
        setView("openRoomView");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        navigate("/gameRoom", { state: { isGameCreated: false, gameRoom: room } });
    }

    async function doRoomInPlay() {
        console.log("in waiting room");
        setView("waitingRoomView");
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    async function doRoomClosed() {
        console.log("room closed");
        setView("unavailableRoomView");
        await startCountdown(5);
        navigate("/gameRoom", { state: { isGameCreated: false, gameRoom: null } });
    }

    async function fetchRoom() {
        console.log("fetch room");
        const requestHeader = { "Authorization": user.token, "X-User-ID": user.userId };
        const response = await api.post(`/gameRooms/join/${pin}/${user.userId}`, null, { headers: requestHeader });
        const room = new Game(response.data);
        sessionStorage.setItem("gameroomToken", room.gameToken);
        sessionStorage.setItem("gameRoom", JSON.stringify(room));

        return room;
    }

    const checkRoomAvailability = async (numChecks: number) => {
        let status;
        while (numChecks >= 0) {
            numChecks -= 1;
            try {
                const room = await fetchRoom();
                await doRoomOpen(room);

                return;
            } catch (error) {
                console.log("in error")
                status = error.response.status;
                console.log("Status", status);
                if (numChecks === 0) {
                    setIsFullRoom(false);
                    await doRoomClosed();

                    return;
                }
                if (status === 403) { // room closed
                    setIsFullRoom(true);
                    await doRoomClosed();

                    return;
                } else if (status === 401) { // room in play
                    setIsFullRoom(false);
                    await doRoomInPlay();
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
            await checkRoomAvailability(4); // change number of times (5s interval) it checks before giving up
        } catch (error) {
            setPinInvalid(true);
            await new Promise((resolve) => setTimeout(resolve, 500));
            setPin("Invalid PIN!");
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setPinInvalid(false);
            setPin("");
        }
    }

    async function updateUser(updatedUser) {
        let response;
        if (updatedUser.userId) {
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

        return fullUser;
    }

    async function fetchAvatars() {
        let fetchedAvatars = new Array<Avatar>();
        try {
            // Lets assume the nickname is valid
            let updatedUser = { ...user, nickname };
            updatedUser = await updateUser(updatedUser);

            console.log(updatedUser)

            const requestHeader = { "Authorization": updatedUser.token, "X-User-ID": updatedUser.userId };
            const response = await api.get("/users/avatars", { headers: requestHeader });

            fetchedAvatars = new Array<Avatar>(...response.data);

            fetchedAvatars.forEach(avatar => {
                avatar.avatarId += 6;
                avatar.encodedImage = `data:image/png;base64,${avatar.encodedImage.replaceAll("\"", "").replaceAll("=", "")}`;
                avatar.selected = user.avatarId === avatar.avatarId ? "active" : "inactive"
            });
        }
        catch (error) {
            console.log("Something went wrong while fetching all avatars: " + error);
        }

        sessionStorage.setItem("avatars", JSON.stringify(fetchedAvatars));
        console.log(fetchedAvatars)

        const defaultAvatars = Array.from({ length: 6 }, (_, index) => new Avatar(
            {
                avatarId: index + 1,
                selected: avatarId === index + 1 ? "active" : "inactive"
            }
        ));

        if (user.persistent) {
            // filter to only contain avatars a user created
            const allAvatars = [...fetchedAvatars.filter((avatar) => (avatar.creatorId === user.userId)).reverse(), ...defaultAvatars];
            setAvatarSelection(allAvatars);
        } else {
            setAvatarSelection(defaultAvatars);
        }
    }

    const validateNickname = async () => {
        try {
            await fetchAvatars();

            setView("avatarView");
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
            let updatedUser = { ...user, avatarId };
            await updateUser(updatedUser);

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
        navigate("/drawAvatar", { state: { isGameCreator: isGameCreator } });
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
                        <img src={require("../../icons/ChubbyGuy.png")} alt="Chubby Guy" draggable="false" />
                    </div>
                </div>
                {Menu(openMenu, toggleMenu, user.persistent, false, false)}
            </BaseContainer>
        );
    }

    function nicknameView() {
        return baseView(
            <div className="gameroom buttons-container"
                onKeyDown={(e) => (e.keyCode === 13 && nickname ? validateNickname() : null)}>
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
            <div className="gameroom buttons-container" style={{ "alignItems": "left" }}
                onKeyDown={(e) => (e.keyCode === 13 && avatarId ? validateAvatar() : null)}>
                <div className="join label">Choose avatar</div>
                {user.persistent && <button className="join avatar-link"
                    onClick={() => drawAvatar()}
                >
                    or personalize your own avatar!</button>}
                <AvatarChoice
                    avatarList={avatarSelection}
                    choose={(id: number) => chooseAvatar(id)}>
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

    function pinView() {
        return baseView(
            <div className="gameroom buttons-container"
                onKeyDown={(e) => (e.keyCode === 13 && pin ? validatePin() : null)}>
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

    function waitingRoomView() {
        return baseView(
            <div className="gameroom buttons-container" style={{ "alignItems": "left" }}>
                <div className="join title">Waiting room...</div>
                <Spinner></Spinner>
                <div>
                    Please wait. The game room is currently hosting a game. You will be granted access once the running game session ends.
                </div>
            </div>,
            () => goBack()
        );
    }

    function unavailableRoomView() {
        return baseView(
            <div className="gameroom buttons-container" style={{ "alignItems": "left" }}>
                <div className="join title">{`Room currently ${isFullRoom ? "full!" : "unavailable..."}`}</div>
                <div>
                    {`The game room is ${isFullRoom ? "already full" : "currently not available"}. Please return and join another game or create a new one.`}
                </div>
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
                <div>
                    Please wait. In just a moment you&apos;ll be redirected to the room.
                </div>
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