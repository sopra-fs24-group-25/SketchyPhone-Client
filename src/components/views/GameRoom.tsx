import React, { useEffect, useState, useRef } from "react";
import { api, handleError } from "helpers/api";
import { Button } from "components/ui/Button";
import { useLocation, useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import { BackButton } from "components/ui/BackButton";
import { BurgerMenu } from "components/ui/BurgerMenu";
import { UserOverviewContainer } from "components/ui/UserOverviewContainer";
import Menu from "components/ui/Menu";
import PropTypes from "prop-types";
import "styles/views/GameRoom.scss";
import "styles/views/GameSettings.scss" // Merge into one later
import "styles/ui/ChubbyGuy.scss";
import User from "models/User";
import GameSession from "models/GameSession";
import Game from "../../models/Game";
import GameSettings from "../../models/GameSettings";
import GameSpeedEnum from "../../helpers/gameSpeedEnum"

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

    // Naming inconsistency for gameRoom
    const [game, setGame] = useState<Game>(location.state ? location.state.gameRoom : null);

    // Need to do it like this
    const [thisUser, setThisUser] = useState<User>(new User(JSON.parse(sessionStorage.getItem("user"))));

    const [users, setUsers] = useState<Array<User>>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(location.state ? location.state.isGameCreator : false);

    // Conditional rendering flags
    const [isGameCreated, setIsGameCreated] = useState(location.state ? location.state.isGameCreated : false);
    const [isSettingsActive, setIsSettingsActive] = useState(false);
    const [isSettingsSaved, setIsSettingsSaved] = useState(false);
    const [copyPin, setCopyPin] = useState<boolean>(false);

    const [openMenu, setOpenMenu] = useState<boolean>(false);

    // Default settings
    const defaultNumCycles = 3;
    const defaultGameSpeed = GameSpeedEnum.NORMAL.inSeconds;
    const defaultIsEnabledTTS = true;

    const [numCycles, setNumCycles] = useState<number>(defaultNumCycles);
    const [gameSpeed, setGameSpeed] = useState<number>(defaultGameSpeed);
    const [isEnabledTTS, setIsEnabledTTS] = useState<boolean>(defaultIsEnabledTTS);

    // Store defaultGameSettings
    const gameSettings = useRef<GameSettings>(new GameSettings({ numCycles: defaultNumCycles, gameSpeed: defaultGameSpeed, enableTextToSpeech: defaultIsEnabledTTS }));
    sessionStorage.setItem("gameSettings", JSON.stringify(gameSettings.current));


    useEffect(() => {
        if (isGameCreated) {
            let interval = setInterval(() => {
                fetchGameRoomUsers();

                // Some continuous polling for clients
                if (!isAdmin && isGameCreated) {
                    fetchGameSettings();
                    fetchGameUpdate();

                    // A gamesession has started
                    if (game.status === "IN_PLAY") {
                        console.log("start game detected");
                        navigate("/game");
                    }

                }
            }, 250); // Set interval to 0.25 seconds

            return () => clearInterval(interval);
        } else if (isAdmin) {
            createGame();
        }
        setIsGameCreated(game !== null);

    }, [game, isGameCreated, users, thisUser])

    const toggleMenu = () => {
        setOpenMenu(!openMenu);
    }

    async function fetchGameUpdate() {
        try {
            const requestHeader = { "Authorization": thisUser.token, "X-User-ID": thisUser.userId };
            const url = `/games/${game.gameId}`;
            const response = await api.get(url, { headers: requestHeader })
            const fetchedGameUpdate = new Game(response.data);
            if (fetchedGameUpdate) {
                setGame(fetchedGameUpdate);
                sessionStorage.setItem("gameRoom", JSON.stringify(fetchedGameUpdate)); // Store to sessionstorage
            }
        }
        catch (error) {
            console.log("Error while fetching gamesessions: " + error);
        }
    }

    async function fetchGameRoomUsers() {
        try {
            const requestHeader = { "Authorization": thisUser.token, "X-User-ID": thisUser.userId };
            const response = await api.get(`/gameRooms/${game.gameId}/users`, { headers: requestHeader })
            let fetchedUsers = new Array<User>(response.data)[0];

            setUsers(fetchedUsers);
        }
        catch (error) {
            console.log("Error while fetching users: " + error);
        }
        if (game === null || isSettingsActive) {
            return;
        }
    }

    async function fetchGameSettings() {
        try {
            const requestHeader = { "Authorization": thisUser.token, "X-User-ID": thisUser.userId };
            const response = await api.get(`/gameRooms/${game.gameId}/settings`, { headers: requestHeader })

            const fetchedGameSettings = new GameSettings(response.data);
            if (fetchedGameSettings) {
                gameSettings.current = fetchedGameSettings;
                sessionStorage.setItem("gameSettings", JSON.stringify(gameSettings.current));
            }
        }
        catch (error) {
            console.log("Error while fetching game settings: " + error);
        }
    }

    async function createGame() { // ADMIN METHOD
        console.log("Attempting to create game")
        try {
            let createdRoom;
            if (game) {
                createdRoom = game;
            } else {
                const response = await api.post(`/gameRooms/create/${thisUser.userId}`);

                // Create new game object
                createdRoom = new Game(response.data);
                setIsAdmin(true);
            }
            // Set default settings values on game creation
            sessionStorage.setItem("numCycles", defaultNumCycles.toString());
            sessionStorage.setItem("gameSpeed", defaultGameSpeed.toString());
            sessionStorage.setItem("isEnabledTTS", defaultIsEnabledTTS ? "True" : "False");

            // Store user and gameroom to sessionstorage
            sessionStorage.setItem("user", JSON.stringify(createdRoom.users[0]));
            sessionStorage.setItem("gameRoom", JSON.stringify(createdRoom));


            setUsers(createdRoom.users);
            setGame({ ...createdRoom });
            setIsGameCreated(true);
        }
        catch (error) {
            alert(
                `Error while attempting to create game: \n${handleError(error)}`
            );
        }
    }

    async function onClickGameStart() {
        console.log(gameSettings.current);
        await sendGameSettings(gameSettings.current);
        await startGame();
    }

    // Send to server to start game ADMIN METHOD
    async function startGame() {
        try {
            console.log("starting game")
            const headers = { "Authorization": thisUser.token, "X-User-ID": thisUser.userId };
            const response = await api.post(`/games/${game.gameId}/start`, null, { headers: headers })

            const gameSession = new GameSession(response.data);

            // check if user is admin and navigate to start
            if (gameSession !== null && gameSession.admin === thisUser.userId) {
                // Store the gameSession as gameRoom
                sessionStorage.setItem("gameRoom", JSON.stringify(gameSession));

                // We store the newly created gameSession
                let currentGameSessions = gameSession.gameSessions;
                let idx = currentGameSessions.length - 1;
                let currentGameSession = currentGameSessions[idx];
                sessionStorage.setItem("gameSession", JSON.stringify(currentGameSession));
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
            const headers = { "Authorization": thisUser.token, "X-User-ID": thisUser.userId };
            await api.delete(`/games/${game.gameId}/leave/${thisUser.userId}`, { headers: headers });
            setIsAdmin(false);
            setGame(null);
            setIsGameCreated(false);
            setUsers(null);
            setThisUser(new User());
            sessionStorage.setItem("user", JSON.stringify(new User()));
            sessionStorage.removeItem("numCycles");
            sessionStorage.removeItem("gameSpeed");
            sessionStorage.removeItem("isEnabledTTS");
            sessionStorage.removeItem("gameRoom");
            sessionStorage.removeItem("gameroomToken");
            sessionStorage.removeItem("gameSettings");
            navigate("/gameRoom");
            console.log("exited room");
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
                    <BurgerMenu
                        onClick={() => setOpenMenu(!openMenu)}
                        disabled={openMenu}>
                    </BurgerMenu>
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

        function handleCopyClick() {
            if (copyPin) {
                return;
            }
            navigator.clipboard.writeText(game["gamePin"])
                .then(() => {
                    console.log(`Saved pin ${game["gamePin"]} to clipboard`);
                    setCopyPin(true);
                    setTimeout(() => {
                        setCopyPin(false);
                    }, 1500);
                })
                .catch(error => {
                    alert(
                        `Failed to copy: \n${handleError(error)}`
                    );
                });
        }

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
                        <div className={`gameroom pin ${copyPin ? "copied" : ""}`}
                            onClick={() => handleCopyClick()}
                            disabled={copyPin}>
                            <p>{copyPin ? "Copied Game PIN!" : `Game PIN: ${String(game["gamePin"]).slice(0, 3)} ${String(game["gamePin"]).slice(3)}`}</p>
                        </div>
                        <div className="gameroom waiting">
                            <p>Waiting for players...</p>
                        </div>
                    </div>
                    <div className="gameroom subcontainer">
                        <UserOverviewContainer
                            userList={users ? users : []}
                            showUserNames={true}>
                        </UserOverviewContainer>
                        <div className="gameroom buttons-container row-flex">
                            {users ?
                                (users.length >= 3 ?
                                    (isAdmin ?
                                        <Button
                                            width="50%"
                                            onClick={() => onClickGameStart()}
                                        >Start Game</Button>
                                        : <div className="gameroom waiting non-admin">Tell the admin to start the game</div>
                                    )
                                    : <div className="gameroom waiting non-admin">{3 - users.length} more player{users.length !== 2 ? "s": ""} needed</div>
                                )
                                : ""
                            }
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
            </BaseContainer>
        );
    }

    async function sendGameSettings(gameSettings) {
        try {
            const requestBody = JSON.stringify(gameSettings);
            const response = await api.put(`/gameRooms/${game.gameId}/settings`, requestBody);

            // Here we can also save the games settings id to the game settings
            console.log(response);

            setIsSettingsSaved(false);
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

    function GameSettingsView() {

        const onSettingsSave = async () => {
            // create gameSettings object to be used and stored
            const newGameSettings = new GameSettings();
            newGameSettings.gameSpeed = gameSpeed;
            newGameSettings.numCycles = numCycles;
            newGameSettings.enableTextToSpeech = isEnabledTTS;

            gameSettings.current = newGameSettings;

            sessionStorage.setItem("gameSettings", JSON.stringify(gameSettings.current));
            setIsSettingsSaved(true);
            await new Promise((resolve) => setTimeout(resolve, 1000));

            console.log(gameSettings.current);
            await sendGameSettings(gameSettings.current);
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
                                <option value={Number(GameSpeedEnum.RELAXED.inSeconds)}>{GameSpeedEnum.RELAXED.name}</option>
                                <option value={Number(GameSpeedEnum.NORMAL.inSeconds)}>{GameSpeedEnum.NORMAL.name}</option>
                                <option value={Number(GameSpeedEnum.QUICK.inSeconds)}>{GameSpeedEnum.QUICK.name}</option>
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
                    {isSettingsSaved ? <div className="settings saved">Saved successfully!</div> : ""}
                </div>
                {Menu(openMenu, toggleMenu)}
            </BaseContainer>
        );
    }

    let renderComponent;

    if (isSettingsActive) {
        renderComponent = GameSettingsView();
    } else if (isGameCreated && game) {
        renderComponent = Overview();
    } else {
        renderComponent = RoomChoice();
    }

    return renderComponent;

}

export default GameRoom;