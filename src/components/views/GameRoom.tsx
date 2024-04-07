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
import "styles/ui/ChubbyGuy.scss";
import  User from "models/User";
import GameRoomDetails from "models/GameRoomDetails";
import Game from "./Game";


const GameRoom = () => {

    const navigate = useNavigate();
    const [name, setName] = useState<string>("peter");
    const [username, setUsername] = useState<string>("lustig");
    const [gameRoom, setGameRoom] = useState<typeof GameRoom>(null);
    const [users, setUsers] = useState<[]>(Array(0));
    const open_menu = (): void => {
        //open menu with profile, settings, and logout
    };

    const logout = (): void => {
        localStorage.removeItem("token");
        navigate("/");
    };

    const createGame = async () => {
        try {
            // const requestBody = JSON.stringify({ username, name });
            // const response = await api.post("/gameRooms/create", requestBody);
            setUsers(Array(
                new User({username: "player3000"}),
                new User({username: "leckerschmecker"}),
                new User({username: "soprauser"}),
                new User({username: "woopwoop"}),
                new User({username: "1234123"}),
                new User({username: "coolcool"}),
                new User({username: "adminUser", isAdmin: true}),
                new User({username: "1234123"}),
                new User({username: "coolcool"}),
                new User({username: "lastuser"})));

            console.log(users);
        }
        catch (error) {
            alert(
                `Something went wrong during the login: \n${handleError(error)}`
            );
        }
    }

    const joinGame = (): void => {
        navigate("/join")
    }

    function roomChoice() {
        return (
            <BaseContainer>
                <div className="gameroom header">
                    <BurgerMenu onClick={() => open_menu()}></BurgerMenu>
                </div>
                <div className="gameroom container">
                    <BackButton onClick={() => logout()}></BackButton>
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
                        <img src={require("../../icons/ChubbyGuy.png")} draggable="false"/>
                    </div>
                </div>
            </BaseContainer>);
    }

    function overview() {
        return (
            <BaseContainer>
                <div className="gameroom header">
                    <BurgerMenu onClick={() => open_menu()}></BurgerMenu>
                </div>
                <div className="gameroom container">
                    <BackButton onClick={() => logout()}></BackButton>

                    <UserOverviewContainer
                        userList={users}
                        showUserNames={true}></UserOverviewContainer>
                </div>

            </BaseContainer>

        );
    }

    return ( //temporary logout with back button, needs to be in burger menu later
        users.length !== 0 ? overview() : roomChoice()

    );
}

export default GameRoom;