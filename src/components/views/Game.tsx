import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import { Button } from "components/ui/Button";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import PropTypes from "prop-types";
import "styles/views/Game.scss";
import { User } from "types";
import { DrawContainer } from "components/ui/DrawContainer";

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

    return (
        <BaseContainer>
            <DrawContainer
                height={400}
                width={600}
                textPrompt = "A dog eating a tasty banana" // Just for testing
                textPromptId = {1} // Just for testing
                timerDuration={20}
            />
        </BaseContainer>
    );
};

export default Game;
