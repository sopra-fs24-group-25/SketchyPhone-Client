import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import { Button } from "components/ui/Button";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import { BackButton } from "components/ui/BackButton";
import { BurgerMenu } from "components/ui/BurgerMenu";
import {PhoneLogo} from "../ui/PhoneLogo";
import Menu from "components/ui/Menu";
import PropTypes from "prop-types";
import "styles/views/Game.scss";
import "styles/views/GameRoom.scss";
import { User } from "types";
import { DrawContainer } from "components/ui/DrawContainer";
import { TextPromptContainer } from "components/ui/TextPromptContainer";

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

    var currentDrawing = <PhoneLogo/>

    const toggleMenu = () => {
        setOpenMenu(!openMenu);
        setIsInitialPrompt(false)
    }

    const fetchDrawing = async () => {
        const gameID = sessionStorage.getItem("gameID");
        const userID = sessionStorage.getItem("userID");
        const response = await api.get(`/games/${gameID}/drawings/${userID}`)

        return (
            <img src={response.data} style={{userSelect:"none", "-webkit-user-drag":"none"}}/>
        )
    }

    const fetchPrompt = async () => {
        const gameID = sessionStorage.getItem("gameID");
        const userID = sessionStorage.getItem("userID");
        const response = await api.get(`/games/${gameID}/prompts/${userID}`)

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
                    timerDuration={10}
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
                    textPrompt = "A dog eating a tasty banana" // Just for testing
                    textPromptId = {1} // Just for testing
                    timerDuration={20}
                    setNextTask={setCurrentTask}>
                </DrawContainer>
                {Menu(openMenu, toggleMenu)}
            </BaseContainer>
        );
    }
};

export default Game;
