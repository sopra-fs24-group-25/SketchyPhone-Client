import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Game from "../../views/Game";

const GameRouter = () => {
    return (
        <div style={{display: "flex", flexDirection: "column"}}>
            <Routes>

                <Route path="" element={<Game />} />

                <Route path="dashboard" element={<Game />} />

                <Route path="*" element={<Navigate to="dashboard" replace />} />

            </Routes>
    
        </div>
    );
};

export default GameRouter;
