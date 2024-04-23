import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import { Button } from "components/ui/Button";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import { BackButton } from "components/ui/BackButton";
import { BurgerMenu } from "components/ui/BurgerMenu";
import { PhoneLogo } from "../ui/PhoneLogo";
import Menu from "components/ui/Menu";
import PropTypes from "prop-types";
import "styles/views/Game.scss";
import "styles/views/GameRoom.scss";
import { DrawContainer } from "components/ui/DrawContainer";
import { TextPromptContainer } from "components/ui/TextPromptContainer";
import DrawingPrompt from "models/DrawingPrompt";
import User from "../../models/User"
import GameSession from "../../models/GameSession"

const Player = ({ user }: { user: User }) => (
    <div className="player container">
        <div className="player username">{user.username}</div>
        <div className="player name">{user.name}</div>
        <div className="player id">id: {user.id}</div>
    </div>
);

Player.propTypes = {
    user: PropTypes.object,
};

const Game = () => {

    const [openMenu, setOpenMenu] = useState<Boolean>(false);
    const [currentTask, setCurrentTask] = useState<String>("Text Prompt");
    const [isInitialPrompt, setIsInitialPrompt] = useState<boolean>(true);

    useEffect(() => {
        if (currentTask === "Drawing") { // Can never be initial prompt
            fetchPrompt();
        }
        else if (currentTask === "Text Prompt" && !isInitialPrompt) {
            fetchDrawing();
        }
    }
    , [currentTask])

    // For testing
    const testDrawingPrompt1 = new DrawingPrompt();
    testDrawingPrompt1.creatorId = 1;
    testDrawingPrompt1.encodedImage = "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";

    var currentDrawing;
    if (isInitialPrompt) {
        currentDrawing = <PhoneLogo />
    } else {
        currentDrawing = testDrawingPrompt1;
    }

    const toggleMenu = () => {
        setOpenMenu(!openMenu);
    }

    const fetchDrawing = async () => {
        // Send text here
        const user = new User(JSON.parse(sessionStorage.getItem("user")));
        const gameSession = new GameSession(JSON.parse(sessionStorage.getItem("gameSession")));

        // Get last gamesession (will always be the current)
        const gameSessionId = gameSession.gameSessions[gameSession.gameSessions.length - 1].gameSessionId;

        const requestHeader = { "Authorization": user.token, "X-User-ID": user.id };
        const response = await api.get(`/games/${gameSessionId}/drawings/${user.id}`, null, { headers: requestHeader });

        return (
            <img src={response.data} style={{ userSelect: "none", "-webkit-user-drag": "none" }} />
        )
    }

    const fetchPrompt = async () => {
        // Send text here
        const user = new User(JSON.parse(sessionStorage.getItem("user")));
        const gameSession = new GameSession(JSON.parse(sessionStorage.getItem("gameSession")));

        console.log(user);
        console.log(gameSession);

        // Get last gamesession (will always be the current)
        const gameSessionId = gameSession.gameSessions[gameSession.gameSessions.length - 1].gameSessionId;

        const requestHeader = { "Authorization": user.token, "X-User-ID": user.id };
        const url = `/games/${gameSessionId}/prompts/${user.id}`
        console.log(requestHeader);
        console.log(url);

        const response = await api.get(url, {}, { headers: requestHeader });

        console.log("received prompt:")
        console.log(response.data);

        return (
            //prompt
            <div></div>
        )
    }

    if (currentTask === "Text Prompt") {
        return (
            <BaseContainer>
                <div className="gameroom header">
                    <BurgerMenu
                        onClick={() => setOpenMenu(!openMenu)}
                        disabled={openMenu}>
                    </BurgerMenu>
                </div>
                <div className={"join container-mid"}>
                </div>
                <TextPromptContainer
                    drawing={currentDrawing}
                    isInitialPrompt={isInitialPrompt}
                    timerDuration={20}
                    setNextTask={setCurrentTask}>
                </TextPromptContainer>
                {Menu(openMenu, toggleMenu)}
            </BaseContainer>
        );
    }
    if (currentTask === "Drawing") {
        return (
            <BaseContainer>
                <div className="gameroom header">
                    <BurgerMenu
                        onClick={() => setOpenMenu(!openMenu)}
                        disabled={openMenu}>
                    </BurgerMenu>
                </div>
                <DrawContainer
                    height={400}
                    width={600}
                    textPrompt="A dog eating a tasty banana" // Just for testing
                    textPromptId={1} // Just for testing
                    timerDuration={20}
                    setNextTask={setCurrentTask}
                    setInitial={setIsInitialPrompt}>
                </DrawContainer>
                {Menu(openMenu, toggleMenu)}
            </BaseContainer>
        );
    }
};

export default Game;
