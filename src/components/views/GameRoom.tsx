import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import { Button } from "components/ui/Button";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import { BackButton } from "components/ui/BackButton";
import { BurgerMenu } from "components/ui/BurgerMenu";
import { UserPreview } from "components/ui/UserPreview";
import { UserOverviewContainer } from "components/ui/UserOverviewContainer";
import Menu from "components/ui/Menu";
import PropTypes from "prop-types";
import "styles/views/GameRoom.scss";
import "styles/views/GameSettings.scss" // Merge into one later
import "styles/ui/ChubbyGuy.scss";
import User from "models/User";
import GameRoomDetails from "models/GameRoom";
import Game from "./Game";

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

const GameRoom = () => {

    const navigate = useNavigate();

    const [gameRoom, setGameRoom] = useState<typeof GameRoomDetails>(null);

    // For persistent user
    const [thisUser, setThisUser] = useState<User>(JSON.parse(sessionStorage.getItem("user")));

    const [username, setUsername] = useState(null);
    const [users, setUsers] = useState<Array<User>>(null);

    // Conditional rendering flags
    const [isGameCreated, setIsGameCreated] = useState(false);
    const [isSettingsActive, setIsSettingsActive] = useState(false);
    const [isSettingNickname, setIsSettingNickname] = useState(false);

    const [openMenu, setOpenMenu] = useState<Boolean>(false);

    // Default settings
    const defaultNumCycles = 3;
    const defaultGameSpeed = 1;
    const defaultIsEnabledTTS = true;

    // Settings states
    const [numCycles, setNumCycles] = useState(defaultNumCycles); // will default to first option when null
    const [gameSpeed, setGameSpeed] = useState(defaultGameSpeed);
    const [isEnabledTTS, setIsEnabledTTS] = useState(defaultIsEnabledTTS); // Need to parse it otherwise will stay true for any string

    const [isAdmin, setIsAdmin] = useState(true); // Should change to false by default just for testing


    useEffect(() => {
        console.log("useEffect")
        if (isGameCreated) {
            let interval = setInterval(() => {
                fetchGameRoomUsers();

            }, 1000); // Set interval to 1 second

            return () => clearInterval(interval);
        }

    }, [gameRoom, isGameCreated, users, thisUser, isSettingNickname, username])

    const open_menu = (): void => {
        //open menu with profile, settings, and logout
    };

    const toggleMenu = () => {
        setOpenMenu(!openMenu);
    }

    const logout = (): void => {
        localStorage.removeItem("token");
        navigate("/");
    };

    async function fetchGameRoomUsers() {
        if (gameRoom === null || isSettingsActive) {
            return;
        }

        const headers = { "Authorization": thisUser.token, "X-User-ID": thisUser.id };
        const response = await api.get(`/gameRooms/${gameRoom.gameId}/users`, { headers: headers })

        let fetchedUsers = new Array<User>(response.data)[0];

        setUsers(fetchedUsers);
    }

    async function createGame() {
        try {
            const name = thisUser !== null ? thisUser.name : username;
            const password = thisUser !== null ? thisUser.name : "password";
            const requestBody = JSON.stringify({ name, password });
            const response = await api.post("/gameRooms/create", requestBody);

            // Create new gameRoomDetails
            const thisgameroom = new GameRoomDetails(response.data);

            // Set sessionstorage
            sessionStorage.setItem("adminUser", JSON.stringify(thisgameroom.users[0])); // This might not be smart
            sessionStorage.setItem("gameRoomDetails", JSON.stringify(thisgameroom));

            // Set default settings values on game creation
            sessionStorage.setItem("numCycles", defaultNumCycles.toString());
            sessionStorage.setItem("gameSpeed", defaultGameSpeed.toString());
            sessionStorage.setItem("isEnabledTTS", defaultIsEnabledTTS ? "True" : "False");

            setUsers(thisgameroom.users);
            setThisUser(thisgameroom.users[0]);
            setGameRoom({ ...thisgameroom });
            setIsGameCreated(true);
        }
        catch (error) {
            alert(
                `Something went wrong: \n${handleError(error)}`
            );
        }
    }

    const joinGame = (): void => {
        navigate("/join")
    }

    const EnterNickname = () => {
        const handleClick = (e) => {
            createGame();
            setIsSettingNickname(false);
        }
        return (
            <div>
                <JoinField
                    label="Set nickname"
                    placeholder="Nickname"
                    value={username}
                    onChange={(n: string) => setUsername(n)}
                ></JoinField>
                <Button
                    onClick={(e) => handleClick(e)}>
                    Save
                </Button>
            </div>
        );
    }

    // Function to return the basic choices for connection to a room
    function RoomChoice() {
        return (
            <BaseContainer>
                <div className="gameroom header">
                    <BurgerMenu onClick={() => setOpenMenu(!openMenu)}></BurgerMenu>
                </div>
                <div className="gameroom container">
                    <BackButton disabled={true} onClick={() => navigate("/")}></BackButton>
                    <div className="gameroom buttons-container">
                        <Button
                            width="80%"
                            // onClick={() => createGame()}
                            onClick={() => setIsSettingNickname(true)}
                        >
                            New Game
                        </Button>
                        <Button
                            width="80%"
                            onClick={() => joinGame()}>
                            Join Game
                        </Button>
                    </div>
                    <div className="mascot">
                        <img src={require("../../icons/ChubbyGuy.png")} draggable="false" />
                    </div>
                </div>
                {Menu(openMenu, toggleMenu)}
            </BaseContainer>);
    }

    // Users overview
    function Overview() {
        return (
            <BaseContainer>
                <div className="gameroom header">
                    <BurgerMenu onClick={() => setOpenMenu(!openMenu)}></BurgerMenu>
                </div>
                <div className="gameroom container">
                    <BackButton onClick={() => logout()}></BackButton> {/* Should go back not logout */}

                    <div className="gameroom subcontainer">
                        <div className="gameroom pin">
                            <p>Game PIN: {gameRoom["gamePin"]}</p>
                        </div>
                        <div className="gameroom waiting">
                            <p>Waiting for players...</p>
                        </div>

                    </div>

                    <div className="gameroom subcontainer">
                        <UserOverviewContainer
                            userList={users}
                            showUserNames={true}></UserOverviewContainer>
                        <div className="gameroom buttons-container row-flex">
                            <Button
                                onClick={() => navigate("/gameroom")}
                            >Start Game</Button>
                            <Button
                                onClick={() => navigate("/")}
                            >Exit Room</Button>
                            <Button
                                onClick={() => setIsSettingsActive(true)}
                            >Settings</Button>
                        </div>
                    </div>
                </div>
                {Menu(openMenu, toggleMenu)}
            </BaseContainer >

        );
    }

    async function sendGameSettings() {
        try {
            const requestBody = { gameSettingsId: gameRoom.gameSettingsId, enableTextToSpeech: isEnabledTTS, gameSpeed: gameSpeed, numCycles: numCycles };
            const response = await api.put(`/gameRooms/${gameRoom.gameId}/settings`, requestBody);
            console.log(response);


            alert("Settings saved");

            setIsSettingsActive(false);
        } catch (error) {
            console.error(
                `Something went wrong while sending game settings: \n${handleError(
                    error
                )}`
            );
            console.error("Details:", error);
            alert(
                "Something went wrong while sending game settings! See the console for details."
            );
        }
    }

    function GameSettings() {
        const onSettingsSave = async () => {
            // First send data to server

            // Store to sessionstorage
            sessionStorage.setItem("numCycles", numCycles);
            sessionStorage.setItem("gameSpeed", gameSpeed);
            sessionStorage.setItem("isEnabledTTS", isEnabledTTS);

            console.log(isEnabledTTS);
            console.log(numCycles);
            console.log(gameSpeed);

            await sendGameSettings();
        }

        return (
            <BaseContainer>
                <div className="settings header">
                    <BurgerMenu onClick={() => setOpenMenu(!openMenu)}></BurgerMenu> {/* ADD menu functionality*/}
                </div>
                <BackButton onClick={() => navigate("/gameroom")}></BackButton>
                <div className="settings container">
                    <h1>Settings</h1>

                    {/* TODO: fetch stored values from sessionstorage*/}
                    <div className="settings options-container">
                        <div className="settings option">
                            <label htmlFor="numCycles">Number of cycles:</label>

                            <select
                                name="numCycles"
                                value={numCycles}
                                defaultValue={numCycles}
                                id="numCycles"
                                onChange={(e) => setNumCycles(e.target.value)}
                            >
                                <option value={3}>3</option>
                                <option value={4}>4</option>
                                <option value={5}>5</option>
                                <option value={6}>6</option>
                            </select>
                        </div>
                        <div className="settings option">
                            <label htmlFor="gameSpeed">Time limit per action:</label>

                            <select
                                name="gameSpeed"
                                value={gameSpeed}
                                defaultValue={gameSpeed}
                                id="gameSpeed"
                                onChange={(e) => setGameSpeed(e.target.value)}
                            >
                                <option value={2}>normal</option>
                                <option value={1}>relaxed</option>
                                <option value={3}>quick</option>
                            </select>
                        </div>
                        <div className="settings option">
                            <label htmlFor="text-to-speech">Enable text-to-speech:</label>
                            <label className="switch" >
                                <input
                                    type="checkbox"
                                    checked={isEnabledTTS}
                                    value={isEnabledTTS}
                                    onChange={(e) => setIsEnabledTTS(e.target.checked)}
                                    id="text-to-speech"></input>
                                <span className="slider round"></span>
                            </label>
                        </div>
                    </div>
                    <Button
                        width="10%"
                        onClick={() => onSettingsSave()}>
                        Save</Button>

                </div>
                {Menu(openMenu, toggleMenu)}
            </BaseContainer>
        );
    }

    let renderComponent;

    if (isSettingsActive) {
        renderComponent = <GameSettings />;
    } else if (isSettingNickname) {
        renderComponent = <EnterNickname />;
    } else if (isGameCreated && gameRoom) {
        renderComponent = <Overview />;
    } else {
        renderComponent = <RoomChoice />;
    }

    return renderComponent;

}

export default GameRoom;