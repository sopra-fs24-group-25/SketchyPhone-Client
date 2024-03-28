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
import GameRoomDetails from "models/GameRoomDetails";
import Game from "./Game";


const GameJoin = () => {

    const navigate = useNavigate();
    const [name, setName] = useState<string>("noah");
    const [username, setUsername] = useState<string>("crisaak");
    const [gameRoom, setGameRoom] = useState<typeof GameJoin>(null);

    const open_menu = (): void => {
        //open menu with profile, settings, and logout
    };

    const logout = (): void => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    

    const joinGame = (): void => {
        console.log("hl");
        try {
            const requestBody = JSON.stringify({username, name});
            //const response = await api.post("/gameRooms/join", requestBody); // fix request

            //console.log(response.data);
        }
        catch (error) {
            alert(
                `Something went wrong during the login: \n${handleError(error)}`
            );
        }
    }

    return ( //temporary logout with back button, needs to be in burger menu later
        <BaseContainer>
            <div className="gameroom header">
                <BurgerMenu onClick={() => open_menu()}></BurgerMenu>
            </div>
            <div className="gameroom container">
                <BackButton onClick={() => logout()}></BackButton>
                <div className="gameroom buttons-container">
                    <div
                        // textfield to come
                    >
                    </div>
                    <Button
                        width="80%"
                        onClick={() => joinGame()}>
                        Join Game
                    </Button>
                </div>
                <div className="mascotte">
                    <img src={require("../../icons/ChubbyGuy.png")} />
                </div>
            </div>
        </BaseContainer>
    );
}

export default GameJoin;