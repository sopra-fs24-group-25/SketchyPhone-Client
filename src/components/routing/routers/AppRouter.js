import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { GameGuard } from "../routeProtectors/GameGuard";
import GameRouter from "./GameRouter";
import { GameRoomGuard } from "../routeProtectors/GameRoomGuard";
import GameRoomRouter from "./GameRoomRouter";
import { GameRoomJoinGuard } from "../routeProtectors/GameRoomJoinGuard";
import GameJoin from "../../views/GameJoin";
import { LoginGuard } from "../routeProtectors/LoginGuard";
import Login from "../../views/Login";
import { StartGuard } from "../routeProtectors/StartGuard";
import Start from "../../views/Start";
import { DrawAvatarGuard } from "../routeProtectors/DrawAvatarGuard";
import DrawAvatar from "../../views/DrawAvatar";
import User from "models/User";


/**
 * Main router of your application.
 * In the following class, different routes are rendered. In our case, there is a Login Route with matches the path "/login"
 * and another Router that matches the route "/game".
 * The main difference between these two routes is the following:
 * /login renders another component without any sub-route
 * /game renders a Router that contains other sub-routes that render in turn other react components
 * Documentation about routing in React: https://reactrouter.com/en/main/start/tutorial 
 */
const AppRouter = () => {
    const user = new User(JSON.parse(sessionStorage.getItem("user")));

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/GameRoom/*" element={<GameRoomGuard/>}>
                    <Route path="/GameRoom/*" element={<GameRoomRouter base="/GameRoom"/>} />
                </Route>

                <Route path="/game/*" element={<GameGuard />}>
                    <Route path="/game/*" element={<GameRouter base="/game"/>} />
                </Route>

                <Route path="/login" element={<LoginGuard />}>
                    <Route path="/login" element={<Login/>} />
                </Route>

                <Route path="/" element={<StartGuard />}>
                    <Route path="/" element={<Start/>} />
                </Route>

                <Route path="/join" element={<GameRoomJoinGuard />}>
                    <Route path="/join" element={<GameJoin/>} />
                </Route>

                <Route path="/drawAvatar" element={<DrawAvatarGuard />}>
                    <Route path="/drawAvatar" element={<DrawAvatar/>} />
                </Route>

                <Route path="*" element={<Navigate to={user.userId ? "/gameRoom" : "/"} replace />} />
            </Routes>
        </BrowserRouter>
    );
};


export default AppRouter;
