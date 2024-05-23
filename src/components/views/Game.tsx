import React, { useEffect, useState, useRef, useMemo } from "react";
import { api, handleError } from "helpers/api";
import BaseContainer from "components/ui/BaseContainer";
import { BurgerMenu } from "components/ui/BurgerMenu";
import { PhoneLogo } from "../ui/PhoneLogo";
import Menu from "components/ui/Menu";
import "styles/views/Game.scss";
import "styles/views/GameRoom.scss";
import { DrawContainer } from "components/ui/DrawContainer";
import { TextPromptContainer } from "components/ui/TextPromptContainer";
import User from "../../models/User"
import GameSession from "../../models/GameSession"
import GameObject from "../../models/Game"; // renaming required bcs component has same name
import TextPrompt from "../../models/TextPrompt";
import DrawingPrompt from "models/DrawingPrompt";
import GameLoopStatus from "../../helpers/gameLoopStatus"
import PresentationContainer from "components/ui/PresentationContainer";
import { Spinner } from "components/ui/Spinner";
import { useNavigate } from "react-router-dom";
import Leaderboard from "components/ui/Leaderboard";

const Game = () => {

    const navigate = useNavigate();

    const MIN_PLAYERS = 3;

    const TIMEOUT = 1000;

    const [openMenu, setOpenMenu] = useState<boolean>(false);
    const [currentTask, setCurrentTask] = useState<string>(GameLoopStatus.TEXTPROMPT);
    const prevTask = useRef<string>(GameLoopStatus.TEXTPROMPT);
    const [isInitialPrompt, setIsInitialPrompt] = useState<boolean>(true);
    const isReadyForTask = useRef<boolean>(isInitialPrompt);

    // What the user will be prompted with
    const receivedTextPrompt = useRef<TextPrompt>(null);
    const receivedDrawingPrompt = useRef<DrawingPrompt>(null);
    const receivedPreviousTextPrompt = useRef<TextPrompt>(null);
    const receivedPreviousDrawingPrompt = useRef<DrawingPrompt>(null);

    // main objects we need for the application logic
    const user = useRef<User>(new User(JSON.parse(sessionStorage.getItem("user"))));

    const [sameUser, setSameUser] = useState<User>(user.current);

    // this should always be the current gameSession
    const gameSession = useRef<GameSession>(new GameSession(JSON.parse(sessionStorage.getItem("gameSession"))));

    // The naming might be ambiguous as gameSession extends gameObject
    const [gameObject, setGameObject] = useState<GameSession>(new GameObject(JSON.parse(sessionStorage.getItem("gameRoom"))));
    const [presentationIndex, setPresentationIndex] = useState<number>(0);

    const [playerCount, setPlayerCount] = useState<number>(gameObject.users.length);

    const gameSettings = useRef(JSON.parse(sessionStorage.getItem("gameSettings")));

    // Initialize to empty array
    const [presentationElements, setPresentationElements] = useState(null);
    const startIndex = useRef(0);

    // To store top three text/drawings
    const [topThreeDrawings, setTopThreeDrawings] = useState<[DrawingPrompt]>(null);
    const [topThreeTextPrompts, setTopThreeTextPrompts] = useState<[TextPrompt]>(null);

    const exitGame = async () => {
        try {
            const headers = { "Authorization": user.current.token, "X-User-ID": user.current.userId };
            await api.delete(`/games/${gameObject.gameId}/leave/${user.current.userId}`, { headers: headers });
            const userToSave = {...user.current, role: null};
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

    useEffect(() => {
        // Change in gameLoopStatus detected
        if (prevTask.current !== gameSession.current.gameLoopStatus) {
            // If we were in presentation or leaderboard mode before and it changed to a text prompt -> a new game has started
            if ((prevTask.current === GameLoopStatus.PRESENTATION || prevTask.current === GameLoopStatus.LEADERBOARD) && gameSession.current.gameLoopStatus === GameLoopStatus.TEXTPROMPT) {
                console.log("RESETTING FOR NEW GAME")
                // reset elements
                receivedDrawingPrompt.current = null;
                receivedPreviousDrawingPrompt.current = null;
                receivedPreviousTextPrompt.current = null;
                receivedTextPrompt.current = null;
                setIsInitialPrompt(true);
                setPresentationElements(null);
                setTopThreeDrawings(null);
                setTopThreeTextPrompts(null);
                setPresentationIndex(-1);

                // set current task for client to update view
                setCurrentTask(gameSession.current.gameLoopStatus);
            }
            else if (gameSession.current.gameLoopStatus === GameLoopStatus.PRESENTATION && presentationElements === null) {
                fetchPresentationElements(user.current, gameSession.current);
                fetchPresentationIndex(user.current, gameSession.current);
            }
            else if (user.current.role !== "admin" && gameSession.current.gameLoopStatus === GameLoopStatus.LEADERBOARD) {
                console.log("Fetching leaderboard for: " + user.current)
                fetchTopThreeDrawings(user.current, gameSession.current);
                fetchTopThreeTextPrompts(user.current, gameSession.current);
            }
            else if (gameSession.current.gameLoopStatus === GameLoopStatus.TEXTPROMPT && !isInitialPrompt) {
                fetchDrawing();
            }
            else if (gameSession.current.gameLoopStatus === GameLoopStatus.DRAWING) {
                fetchPrompt();
            }
        }

        // We also check if the room has changed to "OPEN"
        if (gameObject.status === "OPEN") {
            // We move to gameRoom
            navigate("/gameRoom", { state: { isGameCreator: false, isGameCreated: true, gameRoom: gameObject } })
        }

    }, [currentTask, gameSession.current, presentationElements])

    // UseEffect for continuous polling
    useEffect(() => {
        let interval = setInterval(() => {
            fetchGameUpdate(user.current, gameObject);
            isReadyForTask.current = (gameSession.current.gameLoopStatus === currentTask);

            if (gameSession.current.gameLoopStatus === GameLoopStatus.PRESENTATION) {
                fetchPresentationIndex(user.current, gameSession.current);
            }
        }, TIMEOUT); // Set interval to wait

        return () => clearInterval(interval);

    })

    // For testing
    const fallBackDrawing = new DrawingPrompt();
    fallBackDrawing.creatorId = 1;
    fallBackDrawing.encodedImage = "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";


    const toggleMenu = () => {
        setOpenMenu(!openMenu);
    }

    async function fetchPresentationIndex(user: User, game: GameSession) {
        try {
            const requestHeader = { "Authorization": user.token, "X-User-ID": user.userId };
            const url = `/games/${game.gameSessionId}/presentation/next`;
            const response = await api.get(url, { headers: requestHeader })
            setPresentationIndex(Number(response.data));
        }
        catch (error) {
            console.log("Error while fetching presentation index: " + error);
        }
    }

    async function incrementPresentationIndex(user: User, game: GameSession) {
        try {
            const requestHeader = { "Authorization": user.token, "X-User-ID": user.userId };
            const url = `/games/${game.gameSessionId}/presentation/next`;
            await api.put(url, null, { headers: requestHeader })
        }
        catch (error) {
            console.log("Error while incrementing presentation index: " + error);
        }
    }

    async function startNewRound(user: User, game: GameObject) {
        try {
            const headers = { "Authorization": user.token, "X-User-ID": user.userId };
            const response = await api.post(`/games/${game.gameId}/start`, null, { headers: headers })

            const gameSession = new GameSession(response.data);

            // check if user is admin and navigate to start
            if (gameSession !== null && gameSession.admin === user.userId) {
                sessionStorage.setItem("gameSession", JSON.stringify(gameSession));
                setIsInitialPrompt(true);
            }
        }
        catch (error) {
            alert(
                `Error while attempting to start game: \n${handleError(error)}`
            );
        }
    }

    // Send to server to start game ADMIN METHOD
    async function backToLobby(user: User, game: GameObject) {
        try {
            console.log("back to lobby");
            const requestHeader = { "Authorization": user.token, "X-User-ID": user.userId };
            const url = `/games/${game.gameId}`;
            console.log(requestHeader)
            await api.put(url, null, { headers: requestHeader });
            navigate("/gameRoom", {state: {isGameCreated: true, isGameCreator: true, gameRoom: gameObject}});
        }
        catch (error) {
            alert(
                `Error while attempting to go back to lobby: \n${handleError(error)}`
            );
        }
    }

    async function fetchPresentationElements(user: User, game: GameSession) {
        try {
            const requestHeader = { "Authorization": user.token, "X-User-ID": user.userId };
            const url = `/games/${game.gameSessionId}/sequence`;
            const response = await api.get(url, { headers: requestHeader })
            console.log(response.data);

            const fetchedPresentationElements = response.data.map(element => {
                if (element.drawingId === undefined) {
                    return new TextPrompt(element);
                } else {
                    return new DrawingPrompt(element);
                }
            });
            if (fetchedPresentationElements) {
                setPresentationElements(fetchedPresentationElements);
            }
        }
        catch (error) {
            console.log("Error while fetching presentation elements: " + error);
        }
    }

    // Duplicate code
    async function fetchGameUpdate(user: User, game: GameObject) {
        try {
            const requestHeader = { "Authorization": user.token, "X-User-ID": user.userId };
            const url = `/games/${game.gameId}`;
            const response = await api.get(url, { headers: requestHeader })
            const fetchedGameUpdate = new GameObject(response.data);

            // We store the previous task, to detect change and readiness to fetch prompts
            prevTask.current = gameSession.current.gameLoopStatus;

            if (fetchedGameUpdate) {
                setGameObject(fetchedGameUpdate);
                sessionStorage.setItem("gameRoom", JSON.stringify(fetchedGameUpdate)); // Store to sessionStorage

                // Get last gameSession (will always be the current)
                let currentGameSessions = gameObject.gameSessions;
                let idx = currentGameSessions.length - 1;
                let currentGameSession = currentGameSessions[idx];
                gameSession.current = currentGameSession;

                // reassign user role when player leaves
                const isUserAdmin = fetchedGameUpdate.users.find(u => u.userId === user.userId)?.role === "admin" || false;
                let userToSave;
                if (isUserAdmin) {
                    userToSave = {...user, role: "admin"};
                } else {
                    userToSave = {...user, role: "player"};
                }
                sessionStorage.setItem("user", JSON.stringify(userToSave));
                user = userToSave;
                if (userToSave.role !== sameUser.role) {
                    setSameUser(userToSave);
                }
            }
        }
        catch (error) {
            console.log("Error while fetching game sessions: " + error);
        }
    }

    const fetchDrawing = async () => {
        // reset received drawing before fetching
        receivedDrawingPrompt.current = null;

        const maxAttempts = 10;
        let attempts = 0;

        while (receivedDrawingPrompt.current === null && attempts < maxAttempts) {

            try {
                // Get last gameSession (will always be the current)
                let currentGameSessions = gameObject.gameSessions;
                let idx = currentGameSessions.length - 1;
                let currentGameSessionId = currentGameSessions[idx].gameSessionId;

                const requestHeader = { "Authorization": user.current.token, "X-User-ID": user.current.userId };
                const response = await api.get(`/games/${currentGameSessionId}/drawings/${user.current.userId}`, { headers: requestHeader });

                if (response.data) {
                    // set receivedDrawingPrompt
                    receivedPreviousDrawingPrompt.current = receivedDrawingPrompt.current;
                    const newDrawingPrompt = new DrawingPrompt(response.data);
                    receivedDrawingPrompt.current = newDrawingPrompt;
                    console.log(receivedDrawingPrompt.current);
                }

                return (
                    <img src={response.data} alt="Drawing" style={{ userSelect: "none", "-webkit-user-drag": "none" }} />
                )
            }
            catch (error) {
                console.log("Attempt:" + attempts + " -- Unable to fetch drawing: " + error)
                receivedDrawingPrompt.current = null;
            }

            attempts += 1;

            // wait to try again
            setTimeout(() => TIMEOUT)

        }
    }

    const fetchPrompt = async () => {
        // reset before fetching
        receivedTextPrompt.current = null;

        const maxAttempts = 10;
        let attempts = 0;
        while (receivedTextPrompt.current === null && attempts < maxAttempts) {

            try {
                // Get last gameSession (will always be the current)
                let currentGameSessions = gameObject.gameSessions;
                let idx = currentGameSessions.length - 1;
                let currentGameSessionId = currentGameSessions[idx].gameSessionId;

                const requestHeader = { "Authorization": user.current.token, "X-User-ID": user.current.userId };
                const url = `/games/${currentGameSessionId}/prompts/${user.current.userId}`;

                const response = await api.get(url, { headers: requestHeader });

                if (response.data) {
                    // set receivedTextPrompt
                    receivedPreviousTextPrompt.current = receivedTextPrompt.current;
                    const newTextPrompt = new TextPrompt(response.data);
                    receivedTextPrompt.current = newTextPrompt;
                    console.log(receivedTextPrompt.current);
                }

            }
            catch (error) {
                console.log("Attempt:" + attempts + " -- Unable to fetch prompt: " + error)
                receivedTextPrompt.current = null;
            }

            attempts += 1;
            // wait to try again
            setTimeout(() => TIMEOUT);
        }
    }

    const fetchTopThreeDrawings = async (user: User, game: GameSession) => {
        try {
            const requestHeader = { "Authorization": user.token, "X-User-ID": user.userId };
            const url = `/games/${game.gameSessionId}/top/drawing`;

            const response = await api.get(url, { headers: requestHeader });

            if (response.data) {
                let fetchedTopDrawings = new Array<DrawingPrompt>(...response.data);

                // remove elements if more than 3
                if (fetchedTopDrawings.length > 3) {
                    fetchedTopDrawings = fetchedTopDrawings.slice(0, 4);
                }

                console.log(fetchedTopDrawings);


                if (fetchedTopDrawings.length !== 0)
                    setTopThreeDrawings(fetchedTopDrawings);
            }


        }
        catch (error) {
            console.log("There was an issue while fetching the top three drawings: " + error);
        }
    }

    const fetchTopThreeTextPrompts = async (user: User, game: GameSession) => {
        try {
            const requestHeader = { "Authorization": user.token, "X-User-ID": user.userId };
            const url = `/games/${game.gameSessionId}/top/text`;

            const response = await api.get(url, { headers: requestHeader });

            if (response.data) {
                let fetchedTopTextPrompts = new Array<TextPrompt>(...response.data);

                // remove elements if more than 3
                if (fetchedTopTextPrompts.length > 3) {
                    fetchedTopTextPrompts = fetchedTopTextPrompts.slice(0, 4);
                }

                console.log(fetchedTopTextPrompts);

                if (fetchedTopTextPrompts.length !== 0)
                    setTopThreeTextPrompts(fetchedTopTextPrompts);
            }

        }
        catch (error) {
            console.log("There was an issue while fetching the top three drawings: " + error);
        }
    }

    const TextPromptView = React.memo(() => {
        const timerDuration = Number(gameSettings.current.gameSpeed);

        let currentDrawing;
        if (isInitialPrompt) {
            currentDrawing = <PhoneLogo />
        } else {
            currentDrawing = fallBackDrawing;
        }

        return (
            <BaseContainer>
                <TextPromptContainer
                    drawing={receivedDrawingPrompt.current === null ? currentDrawing : receivedDrawingPrompt.current}
                    user={user.current}
                    game={gameObject}
                    isInitialPrompt={isInitialPrompt}
                    timerDuration={timerDuration}
                    setNextTask={setCurrentTask}>
                </TextPromptContainer>
            </BaseContainer>
        );
    });

    TextPromptView.displayName = "TextPromptView";

    const DrawView = React.memo(() => {
        const timerDuration = Number(gameSettings.current.gameSpeed);

        return (
            <BaseContainer>
                <div className="gameroom header">
                </div>
                <DrawContainer
                    height={400}
                    width={600}
                    user={user.current}
                    game={gameObject}
                    textPrompt={receivedTextPrompt.current === null ? new TextPrompt({ content: "" }) : receivedTextPrompt.current} // Just for testing
                    timerDuration={timerDuration * 2} // twice the time for drawing
                    setNextTask={setCurrentTask}
                    setInitial={setIsInitialPrompt}>
                </DrawContainer>
            </BaseContainer>
        );
    });

    DrawView.displayName = "DrawView";

    const WaitingView = React.memo(() => {
        return (
            <BaseContainer style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div className="gameroom header">
                    <BurgerMenu
                        onClick={() => setOpenMenu(!openMenu)}
                        disabled={openMenu}>
                    </BurgerMenu>
                </div>
                <div className="gameroom between-tasks">
                    Waiting for players to finish their tasks...
                </div>
                <Spinner></Spinner>
                {Menu(openMenu, toggleMenu, user.persistent, true)}
            </BaseContainer>
        )
    });

    WaitingView.displayName = "WaitingView";

    const PresentationView = React.memo(() => {
        let endIndex = presentationIndex;
        let lastElementToShow = presentationElements[presentationIndex]

        // If element has no predecessor we show a new subsequence
        if (lastElementToShow instanceof TextPrompt && lastElementToShow?.previousDrawingId === 777) {
            startIndex.current = endIndex;
        }

        let elementsToShow = presentationElements ? presentationElements.slice(startIndex.current, endIndex + 1) : null; // End not included thats why + 1
        
        return (
            <BaseContainer>
                <div className="gameroom header">
                    <BurgerMenu
                        onClick={() => setOpenMenu(!openMenu)}
                        disabled={openMenu}>
                    </BurgerMenu>
                </div>
                <div className="gameroom title">Presentation</div>
                <PresentationContainer
                    presentationContents={elementsToShow}
                    isAdmin={user.current.role === "admin"}
                    onClickIncrement={() => incrementPresentationIndex(user.current, gameSession.current)}
                    onClickNextRound={() => startNewRound(user.current, gameObject)}
                    onClickBackToLobby={() => backToLobby(user.current, gameObject)}
                    onClickResults={() => { fetchTopThreeDrawings(user.current, gameSession.current); fetchTopThreeTextPrompts(user.current, gameSession.current) }}
                    onExitGame={() => exitGame()}
                    gameSession={gameSession.current}
                    user={user.current}
                    lowPlayerCount={gameObject.users.length < MIN_PLAYERS}
                ></PresentationContainer>
                {Menu(openMenu, toggleMenu, user.persistent, true)}
            </BaseContainer>)
    });

    PresentationView.displayName = "PresentationView";

    const LeaderboardView = React.memo(() => {
        return (
            <BaseContainer>
                <div className="gameroom header">
                    <BurgerMenu
                        onClick={() => setOpenMenu(!openMenu)}
                        disabled={openMenu}>
                    </BurgerMenu>
                </div>
                <div className="gameroom title">Leaderboard</div>
                <Leaderboard
                    topThreeDrawings={topThreeDrawings}
                    topThreeTextPrompts={topThreeTextPrompts}
                    onClickNextRound={() => startNewRound(user.current, gameObject)}
                    onClickBackToLobby={() => backToLobby(user.current, gameObject)}
                    onExitGame={() => exitGame()}
                    user={user.current}
                    lowPlayerCount={gameObject.users.length < MIN_PLAYERS}
                >
                </Leaderboard>
                {Menu(openMenu, toggleMenu, user.persistent, true)}
            </BaseContainer>
        )
    })

    LeaderboardView.displayName = "LeaderboardView";

    const renderComponent = useMemo(() => {
        if (user.current.role !== sameUser.role) {
            user.current = new User(JSON.parse(sessionStorage.getItem("user")));
        }
        
        if (gameSession.current !== null && gameSession.current.gameLoopStatus === GameLoopStatus.PRESENTATION && presentationElements !== null) {
            return <PresentationView />;
        }
        if (gameSession.current !== null && gameSession.current.gameLoopStatus === GameLoopStatus.LEADERBOARD) {
            return <LeaderboardView />;
        }
        if (playerCount !== gameObject.users.length) {
            if (user.current.role === "admin") {
                backToLobby(user.current, gameObject);
            }
            setPlayerCount(gameObject.users.length);
        }
        if (!isReadyForTask.current) {
            return <WaitingView />;
        }
        if (currentTask === GameLoopStatus.TEXTPROMPT && isReadyForTask && (receivedDrawingPrompt.current !== null || isInitialPrompt)) {
            return <TextPromptView />;
        }
        if (currentTask === GameLoopStatus.DRAWING && isReadyForTask && receivedTextPrompt.current !== null) {
            return <DrawView />;
        }

        // Waiting room fallback
        return <WaitingView />;

    }, [isReadyForTask.current, presentationElements, presentationIndex, openMenu, topThreeDrawings, topThreeTextPrompts, sameUser, gameSession.current.gameLoopStatus, user.current, gameObject.users.length]);

    return renderComponent;
};

export default Game;
