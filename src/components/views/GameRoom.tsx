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

    const navigate = useNavigate();

    const open_menu = (): void => {
        //open menu with profile, settings, and logout
    };

    const logout = (): void => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    return ( //temporary logout with back button, needs to be in burger menu later
        <BaseContainer>
            <div className = "gameroom header">
                <BurgerMenu onClick={() => open_menu()}></BurgerMenu>
            </div>
            <div className = "gameroom container">
                <BackButton onClick={() => logout()}></BackButton>
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
                <img src = {require("../../chubs-hero-4.png")}/>
            </div>
        </BaseContainer>
    );
}

export default GameRoom;