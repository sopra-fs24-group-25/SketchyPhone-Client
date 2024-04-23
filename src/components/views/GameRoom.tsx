import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import { Button } from "components/ui/Button";
import { useLocation, useNavigate } from "react-router-dom";
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
import GameSession from "models/GameSession";
import Game from "../../models/Game"

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
    const location = useLocation();

    const [gameRoom, setGameRoom] = useState<typeof GameRoomDetails>(location.state ? location.state.gameRoom : null);

    // Need to do it like this
    const [thisUser, setThisUser] = useState<User>(new User(JSON.parse(sessionStorage.getItem("user"))));

    const [users, setUsers] = useState<Array<User>>(null);
    const [isAdmin, setIsAdmin] = useState<Boolean>(false);

    // Conditional rendering flags
    const [isGameCreated, setIsGameCreated] = useState(location.state ? location.state.isGameCreated : false);
    const [isSettingsActive, setIsSettingsActive] = useState(false);

    const [openMenu, setOpenMenu] = useState<Boolean>(false);

    // Default settings
    const defaultNumCycles = 3;
    const defaultGameSpeed = 1;
    const defaultIsEnabledTTS = true;

    // Settings states
    const [numCycles, setNumCycles] = useState(defaultNumCycles); // will default to first option when null
    const [gameSpeed, setGameSpeed] = useState(defaultGameSpeed);
    const [isEnabledTTS, setIsEnabledTTS] = useState(defaultIsEnabledTTS); // Need to parse it otherwise will stay true for any string

    // const [isAdmin, setIsAdmin] = useState(true); // Should change to false by default just for testing

    useEffect(() => {
        if (isGameCreated) {
            let interval = setInterval(() => {
                fetchGameRoomUsers();

            }, 1000); // Set interval to 1 second

            return () => clearInterval(interval);
        } else {
            createGame();
        }

        setIsGameCreated(gameRoom !== null);


    }, [gameRoom, isGameCreated, users, thisUser])

    const toggleMenu = () => {
        setOpenMenu(!openMenu);
    }

    async function fetchGameRoomUsers() {
        if (gameRoom === null || isSettingsActive) {
            return;
        }

        const headers = { "Authorization": thisUser.token, "X-User-ID": thisUser.id };

        // add try catch
        const response = await api.get(`/gameRooms/${gameRoom.gameId}/users`, { headers: headers })

        let fetchedUsers = new Array<User>(response.data)[0];

        setUsers(fetchedUsers);
    }

    async function createGame() {
        if (!thisUser) {
            return;
        }
        try {
            const name = thisUser.name;
            const password = "password"; // PLACEHOLDER
            const requestBody = JSON.stringify({ name, password });
            var thisgameroom;
            if (gameRoom) {
                thisgameroom = gameRoom;
            } else {
                const response = await api.post("/gameRooms/create", requestBody);

                const game = new Game(response.data);

                // Create new gameRoomDetails
                thisgameroom = new GameRoomDetails(response.data);
                setIsAdmin(true);
            }
            // Set default settings values on game creation
            sessionStorage.setItem("numCycles", defaultNumCycles.toString());
            sessionStorage.setItem("gameSpeed", defaultGameSpeed.toString());
            sessionStorage.setItem("isEnabledTTS", defaultIsEnabledTTS ? "True" : "False");

            // Store user and gameroom to sessionstorage
            sessionStorage.setItem("user", JSON.stringify(thisgameroom.users[0]));
            sessionStorage.setItem("gameRoom", JSON.stringify(thisgameroom));

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

    // Send to server to start game
    async function startGame() {
        try {
            const headers = { "Authorization": thisUser.token, "X-User-ID": thisUser.id };
            const response = await api.post(`/games/${gameRoom.gameId}/start`, null, { headers: headers })

            const gameSession = new GameSession(response.data);
            console.log(gameSession);

            // check if user is admin and navigate to start
            if (gameSession !== null && gameSession.admin === thisUser.id) {
                console.log("storing gamesession");
                console.log(gameSession);
                sessionStorage.setItem("gameSession", JSON.stringify(gameSession));
                navigate("/game");
            }
        }
        catch (error) {
            alert(
                `Error while attempting to start game: \n${handleError(error)}`
            );
        }
    }

    const exitRoom = async () => {
        try {
            const headers = { "Authorization": thisUser.token, "X-User-ID": thisUser.id };
            await api.delete(`/games/${gameRoom.gameId}/leave/${thisUser.id}`, { headers: headers });
            setIsAdmin(false);
            setGameRoom(null);
            setIsGameCreated(false);
            setUsers(null);
            setThisUser(null);
            sessionStorage.removeItem("numCycles");
            sessionStorage.removeItem("gameSpeed");
            sessionStorage.removeItem("isEnabledTTS");
            sessionStorage.removeItem("gameRoom");
            sessionStorage.removeItem("gameroomToken");
            navigate("/gameRoom");
            console.log("out");
        } catch (error) {
            alert(`Could not exit:\n ${handleError(error)}`);
        }
    }

    const joinGame = (): void => {
        navigate("/join")
    }

    // Function to return the basic choices for connection to a room
    function RoomChoice() {

        const handleGameCreate = () => {
            navigate("/join", { state: { isGameCreator: true } }); // We pass the isGameCreator flag
        }

        return (
            <BaseContainer>
                <div className="gameroom header">
                    <BurgerMenu onClick={() => setOpenMenu(!openMenu)}></BurgerMenu>
                </div>
                <div className="gameroom container">
                    <BackButton disabled={true} onClick={() => navigate("/")}></BackButton>
                    <div className="gameroom buttons-container">
                        <Button
                            width="50%"
                            onClick={() => handleGameCreate()} // We use this route to fetch username, avatar etc.
                        >
                            New Game
                        </Button>
                        <Button
                            width="50%"
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
                    <BurgerMenu
                        onClick={() => setOpenMenu(!openMenu)}
                        disabled={openMenu}>
                    </BurgerMenu>
                </div>
                <div className="gameroom container">
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
                            showUserNames={true}>
                        </UserOverviewContainer>
                        <div className="gameroom buttons-container row-flex">
                            {isAdmin ?
                                <Button
                                    width="50%"
                                    onClick={() => startGame()}
                                >Start Game</Button>
                                : <div className="gameroom waiting non-admin">Tell the admin to start the game</div>}
                            <Button
                                width="50%"
                                onClick={() => exitRoom()}
                            >Exit Room</Button>
                            {isAdmin ?
                                <Button
                                    width="50%"
                                    onClick={() => setIsSettingsActive(true)}
                                >Settings</Button>
                                : null}
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
                <div className="gameroom header">
                    <BurgerMenu
                        onClick={() => setOpenMenu(!openMenu)}
                        disabled={openMenu}>
                    </BurgerMenu>
                </div>

                <div className="settings container">
                    <div className="settings title">Settings</div>

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
                    <div className="settings button-container">
                        <BackButton
                            onClick={() => setIsSettingsActive(false)}>
                        </BackButton>
                        <Button
                            width="40%"
                            onClick={() => onSettingsSave()}
                        >
                            Save
                        </Button>
                    </div>


                </div>
                {Menu(openMenu, toggleMenu)}
            </BaseContainer>
        );
    }

    let renderComponent;

    if (isSettingsActive) {
        renderComponent = GameSettings();
    } else if (isGameCreated && gameRoom) {
        renderComponent = Overview();
    } else {
        renderComponent = RoomChoice();
    }

    return renderComponent;

}

export default GameRoom;