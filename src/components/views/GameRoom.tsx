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
import Avatar from "../../models/Avatar";
import { Tooltip } from "react-tooltip";


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

    const TIMEOUT = 500;

    // Naming inconsistency for gameRoom
    const [game, setGame] = useState<Game>(location.state ? location.state.gameRoom : null);

    // Need to do it like this
    const [thisUser, setThisUser] = useState<User>(new User(JSON.parse(sessionStorage.getItem("user"))));

    const [avatars, setAvatars] = useState<Array<Avatar>>(JSON.parse(sessionStorage.getItem("avatars")));

    const [users, setUsers] = useState<Array<User>>(null);
    const [isAdmin, setIsAdmin] = useState<boolean>(location.state ? location.state.isGameCreator : false);

    // Conditional rendering flags
    const [isGameCreated, setIsGameCreated] = useState(location.state ? location.state.isGameCreated : false);
    const [isSettingsActive, setIsSettingsActive] = useState(false);
    const [isSettingsSaved, setIsSettingsSaved] = useState(false);
    const [copyPin, setCopyPin] = useState<boolean>(false);

    const [openMenu, setOpenMenu] = useState<boolean>(false);

    // Player counts
    const MAX_PLAYERS = 8;
    const MIN_PLAYERS = 3;

    // Default settings
    const defaultNumCycles = 1;
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
            }, TIMEOUT); // Set interval to wait

            return () => clearInterval(interval);
        } else if (isAdmin) {
            createGame();
        }
        setIsGameCreated(game !== null);

    }, [game, isGameCreated, users, thisUser])

    const toggleMenu = () => {
        setOpenMenu(!openMenu);
        setThisUser(new User(JSON.parse(sessionStorage.getItem("user"))));
    }

    async function fetchGameUpdate() {
        try {
            const requestHeader = { "Authorization": thisUser.token, "X-User-ID": thisUser.userId };
            const url = `/games/${game.gameId}`;
            const response = await api.get(url, { headers: requestHeader })
            const fetchedGameUpdate = new Game(response.data);
            if (fetchedGameUpdate) {
                setGame(fetchedGameUpdate);
                sessionStorage.setItem("gameRoom", JSON.stringify(fetchedGameUpdate));
            }
        }
        catch (error) {
            console.log("Error while fetching gamesessions: " + error);
        }
    }

    async function fetchedAvatars() {
        let fetchedAvatars = new Array<Avatar>();
        try {
            const requestHeader = { "Authorization": thisUser.token, "X-User-ID": thisUser.userId };
            const response = await api.get("/users/avatars", { headers: requestHeader });

            fetchedAvatars = new Array<Avatar>(...response.data);
            console.log(fetchedAvatars)
            if (fetchedAvatars.length !== 0) {
                fetchedAvatars.forEach(avatar => {
                    avatar.avatarId += 6;
                    avatar.encodedImage = `data:image/png;base64,${avatar.encodedImage.replaceAll("\"", "").replaceAll("=", "")}`;
                    avatar.selected = thisUser.avatarId === avatar.avatarId ? "active" : "inactive"
                });
                console.log(fetchedAvatars);
                sessionStorage.setItem("avatars", JSON.stringify(fetchedAvatars));
                setAvatars(fetchedAvatars);
            }

        }
        catch (error) {
            console.log("Something went wrong while fetching all avatars: " + error);
        }

    }

    async function fetchGameRoomUsers() {
        try {
            const requestHeader = { "Authorization": thisUser.token, "X-User-ID": thisUser.userId };
            const response = await api.get(`/gameRooms/${game.gameId}/users`, { headers: requestHeader })
            let fetchedUsers = new Array<User>(response.data)[0];

            // a new user joined
            if (fetchedUsers.length !== users?.length) {
                console.log("new user detected");
                console.log(fetchedUsers);
                console.log(users)
                // refresh avatar
                await fetchedAvatars();
            }

            setUsers(fetchedUsers);
            const foundUser = users?.find(user => user.userId === thisUser.userId);
            const isUserAdmin = foundUser?.role === "admin" || false;
            
            setIsAdmin(isUserAdmin);
            let userToSave;
            if (isUserAdmin) {
                userToSave = { ...thisUser, role: "admin" };
            } else {
                userToSave = { ...thisUser, role: "player" };
            }
            sessionStorage.setItem("user", JSON.stringify(userToSave));
            setThisUser(userToSave);
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

            // Set this user role as admin
            sessionStorage.setItem("user", JSON.stringify({...thisUser, role: "admin"}));
        
            // also update thisUser object
            setThisUser({...thisUser, role: "admin"});

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
            const userToSave = { ...thisUser, role: null };
            sessionStorage.setItem("user", JSON.stringify(userToSave));
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
                    <BackButton disabled={true}></BackButton>
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
                        <img src={require("../../icons/ChubbyGuy.png")} alt="Chubby Guy" draggable="false" />
                    </div>
                </div>
                {Menu(openMenu, toggleMenu, thisUser.persistent, false)}
            </BaseContainer>);
    }

    // Users overview
    function Overview() {

        async function handleCopyClick() {
            if (copyPin) {
                return;
            }
            try {
                navigator.clipboard.writeText(game["gamePin"]);
                console.log(`Saved pin ${game["gamePin"]} to clipboard`);
                setCopyPin(true);
                await new Promise((resolve) => setTimeout(resolve, 1500));
                setCopyPin(false);
            } catch (error) {
                alert(
                    `Failed to copy: \n${handleError(error)}`
                )
            }
        }

        function showUserControls() {
            if (users.length >= 3) {

                return showGameStartControl();
            }

            return (
                <div className="gameroom waiting non-admin">{MIN_PLAYERS - users.length} more player{users.length !== 2 ? "s" : ""} needed</div>
            )
        }

        function showGameStartControl() {
            if (isAdmin) {

                return (
                    <Button
                        width="50%"
                        onClick={() => onClickGameStart()}
                    >Start Game</Button>
                )
            }

            return (
                <div className="gameroom waiting non-admin">Tell the admin to start the game</div>
            )
        }

        function handleSettingsButton() {
            const settings = new GameSettings(JSON.parse(sessionStorage.getItem("gameSettings")));
            setNumCycles(settings.numCycles);
            setGameSpeed(settings.gameSpeed);
            setIsEnabledTTS(settings.enableTextToSpeech);
            setIsSettingsActive(true)
        }

        function handleAdminMenu(selectedUser) {
            if (!isAdmin) {
                return;
            }
            if (selectedUser.userId === thisUser.userId) {
                return;
            }
            //TODO: open adminMenu to appoint new admin or kick user
            console.log(selectedUser);
        }

        return (
            <BaseContainer>
                <div className="gameroom header">
                    <BurgerMenu
                        onClick={() => setOpenMenu(!openMenu)}
                        disabled={openMenu}>
                    </BurgerMenu>
                </div>
                <div className="gameroom title lobby">Lobby</div>
                <div className="gameroom container">
                    <div className="gameroom subcontainer">
                        <button className={`gameroom pin ${copyPin ? "copied" : ""}`}
                            onClick={() => handleCopyClick()}
                            disabled={copyPin}>
                            <p>{copyPin ? "Copied Game PIN!" : `Game PIN: ${String(game["gamePin"]).slice(0, 3)} ${String(game["gamePin"]).slice(3)}`}</p>
                        </button>
                        <div className="gameroom waiting">
                            <p>{users?.length === MAX_PLAYERS ? "Lobby is full!" : "Waiting for players..."}</p>
                        </div>
                    </div>
                    <div className="gameroom subcontainer">
                        <UserOverviewContainer
                            userList={users || []}
                            onAdminMenu={handleAdminMenu}
                            isAdmin={isAdmin}
                            adminUserId={thisUser.userId}
                            showUserNames={true}
                            avatars={avatars}>
                        </UserOverviewContainer>
                        <div className="gameroom buttons-container row-flex">
                            {users ? showUserControls() : null}
                            <Button
                                width="50%"
                                onClick={() => exitRoom()}
                            >Exit Room</Button>
                            {isAdmin ?
                                <Button
                                    width="50%"
                                    onClick={() => handleSettingsButton()}
                                >Settings</Button>
                                : null}
                        </div>
                    </div>
                </div>
                {Menu(openMenu, toggleMenu, thisUser.persistent, false)}
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
                `Something went wrong while sending game settings: \n${handleError(error)}`
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
                    <div className="settings options-container">
                        <div className="settings option">
                            <label className="cyclesTooltip" htmlFor="numCycles">Game length:</label>
                            <Tooltip
                                anchorSelect=".cyclesTooltip"
                                place="top">
                                Corresponds to how many times your original prompt ends up with you again.
                            </Tooltip>
                            <select
                                name="numCycles"
                                value={numCycles}
                                id="numCycles"
                                onChange={(e) => setNumCycles(e.target.value)}
                            >
                                <option value={1}>Regular</option>
                                <option value={2}>Long</option>
                                <option value={3}>Very Long</option>
                            </select>
                        </div>
                        <div className="settings option">
                            <label className="gameSpeedTooltip" htmlFor="gameSpeed">Time limit per action:</label>
                            <Tooltip
                                anchorSelect=".gameSpeedTooltip"
                                place="top">
                                Time to complete a drawing or writing task. Normal: 25s Write / 50s Draw
                            </Tooltip>
                            <select
                                name="gameSpeed"
                                value={gameSpeed}
                                id="gameSpeed"
                                onChange={(e) => setGameSpeed(e.target.value)}
                            >
                                <option value={Number(GameSpeedEnum.RELAXED.inSeconds)}>{GameSpeedEnum.RELAXED.name}</option>
                                <option value={Number(GameSpeedEnum.NORMAL.inSeconds)}>{GameSpeedEnum.NORMAL.name}</option>
                                <option value={Number(GameSpeedEnum.QUICK.inSeconds)}>{GameSpeedEnum.QUICK.name}</option>
                            </select>
                        </div>
                        <div className="settings option">
                            <label className="ttsTooltip" htmlFor="text-to-speech">Enable text-to-speech:</label>
                            <Tooltip
                                anchorSelect=".ttsTooltip"
                                place="top">
                                Do you want the text prompts to be narrated at the end of the game?
                            </Tooltip>
                            <label className="switch">
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
                {Menu(openMenu, toggleMenu, thisUser.persistent, false)}
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