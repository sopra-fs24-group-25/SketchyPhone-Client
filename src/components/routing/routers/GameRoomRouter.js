import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import GameRoom from "../../views/GameRoom";
import GameJoin from "../../views/GameJoin";

const GameRoomRouter = () => {
    return (
        <div style={{display: "flex", flexDirection: "column"}}>
            <Routes>

                <Route path="" element={<GameRoom />} />

                <Route path="join" element={<GameJoin />} />

                <Route path="dashboard" element={<GameRoom />} />

                <Route path="*" element={<Navigate to="dashboard" replace />} />

            </Routes>
    
        </div>
    );
};


export default GameRoomRouter;
