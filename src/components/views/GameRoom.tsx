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
import PropTypes from "prop-types";
import "styles/views/GameRoom.scss";
import "styles/views/GameSettings.scss" // Merge into one later
import "styles/ui/ChubbyGuy.scss";
import User from "models/User";
import GameRoomDetails from "models/GameRoom";
import Game from "./Game";


const GameRoom = () => {

    const navigate = useNavigate();
    // just for testing
    const [name, setName] = useState<string>("TestUser");
    const [gameRoom, setGameRoom] = useState<typeof GameRoomDetails>(null);
    const [thisUser, setThisUser] = useState<User>(null);
    const [isGameCreated, setIsGameCreated] = useState(false);
    const [users, setUsers] = useState<Array<User>>(null);
    const [isSettingsActive, setIsSettingsActive] = useState(false);

    // Settings states
    const [numCycles, setNumCycles] = useState(sessionStorage.getItem("numCycles")); // will default to first option when null
    const [timeLimit, setTimeLimit] = useState(sessionStorage.getItem("timeLimit"));
    const [isEnabledTTS, setIsEnabledTTS] = useState(JSON.parse(sessionStorage.getItem("isEnabledTTS"))); // Need to parse it otherwise will stay true for any string
    const [isAdmin, setIsAdmin] = useState(true); // Should change to false by default just for testing


    useEffect(() => {
        let interval = setInterval(() => {
            fetchGameRoomUsers();

        }, 1000); // Set interval to 1 second

        return () => clearInterval(interval);
    }, [gameRoom, isGameCreated, users])

    const open_menu = (): void => {
        //open menu with profile, settings, and logout
    };

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
            const requestBody = JSON.stringify({ name });
            const response = await api.post("/gameRooms/create", requestBody);

            const thisgameroom = new GameRoomDetails(response.data);

            sessionStorage.setItem("adminUser", JSON.stringify(thisgameroom.users[0]));
            sessionStorage.setItem("gameRoomDetails", JSON.stringify(thisgameroom));

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

    // Function to return the basic choices for connection to a room
    function RoomChoice() {
        return (
            <BaseContainer>
                <div className="gameroom header">
                    <BurgerMenu onClick={() => open_menu()}></BurgerMenu>
                </div>
                <div className="gameroom container">
                    <BackButton disabled={true} onClick={() => navigate("/")}></BackButton>
                    <div className="gameroom buttons-container">
                        <Button
                            width="80%"
                            onClick={() => createGame()}>
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
            </BaseContainer>);
    }

    // Users overview
    function Overview() {
        return (
            <BaseContainer>
                <div className="gameroom header">
                    <BurgerMenu onClick={() => open_menu()}></BurgerMenu>
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
            </BaseContainer >

        );
    }

    function GameSettings() {
        const onSettingsSave = async () => {
            // First send data to server

            // Store to sessionstorage
            sessionStorage.setItem("numCycles", numCycles);
            sessionStorage.setItem("timeLimit", timeLimit);
            sessionStorage.setItem("isEnabledTTS", isEnabledTTS);

            // Requestbody for gamesettings put
            const requestBody = { gameSettingsId: gameRoom.gameSettingsId, enableTextToSpeech: isEnabledTTS, gameSpeed: timeLimit, numCycles: numCycles };
            const response = await api.put(`/gameRooms/${gameRoom.gameId}/settings`, requestBody);
            console.log(response);


            alert("Settings saved")

            setIsSettingsActive(false);
        }

        return (
            <BaseContainer>
                <div className="settings header">
                    <BurgerMenu></BurgerMenu> {/* ADD menu functionality*/}
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
                            <label htmlFor="timeLimit">Time limit per action:</label>

                            <select
                                name="timeLimit"
                                value={timeLimit}
                                defaultValue={timeLimit}
                                id="timeLimit"
                                onChange={(e) => setTimeLimit(e.target.value)}
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
            </BaseContainer>
        );
    }


    //Conditional rendering
    if (isSettingsActive) {
        return GameSettings();
    }
    if (isGameCreated && gameRoom) {
        return Overview()
    }

    return RoomChoice()

}

export default GameRoom;