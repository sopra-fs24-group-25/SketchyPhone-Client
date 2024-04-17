import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import "../../styles/ui/MenuButton.scss";
import "../../styles/ui/MenuContainer.scss";
import { BackButton } from "components/ui/BackButton";
//import "styles/views/GameRoom.scss";

const Menu = (openMenu, toggleMenu) => {

    const navigate = useNavigate();

    const openProfile = () => {
        //navigate("/profile");
        console.log("To profile");
    }

    const openHistory = () => {
        //navigate("/history");
        console.log("To history");
    }

    const logout = (): void => {
        localStorage.removeItem("token");
        sessionStorage.removeItem("GameRoomToken");
        navigate("/");
    };

    return (
        <div
            className={`screen-layer ${openMenu ? "open" : "closed"}`}
            onClick={() => toggleMenu()}>
            <div
                className={`menu-container ${openMenu ? "open" : "closed"}`}>
                <div className="gameroom header">
                    <BackButton
                        onClick={() => toggleMenu()}>
                    </BackButton>
                </div>
                <div //profile
                    className="menu-button"
                    onClick={() => openProfile()}
                >
                    Profile
                </div>
                <div //history
                    className="menu-button"
                    onClick={() => openHistory()}
                >
                    History
                </div>
                <div //logout
                    className="menu-button"
                    onClick={() => logout()}
                >
                    Log out
                </div>
            </div>
        </div>
    );
}

export default Menu;