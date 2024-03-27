import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import { Button } from "components/ui/Button";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import { BackButton } from "components/ui/BackButton";
import { BurgerMenu } from "components/ui/BurgerMenu";
import PropTypes from "prop-types";
import "styles/views/GameRoom.scss";
import { User } from "types";

const GameRoom = () => {

    return (
        <BaseContainer>
        <div className = "gameroom header">
            <BurgerMenu></BurgerMenu>
        </div>
        <div className = "gameroom container">
            <BackButton></BackButton>
            <div className ="gameroom buttons-container">
                <Button
                width = "200%">
                    New Game
                </Button>
                <Button
                width = "200%">
                    Join Game
                </Button>
            </div>
            <img src = {require('../../chubs-hero-4.png')}/>
        </div>
        </BaseContainer>

    );
}

export default GameRoom;