import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "helpers/api";
import "../../styles/ui/MenuButton.scss";
import "../../styles/ui/BackButton.scss";
import "../../styles/ui/MenuContainer.scss";
import { BackButton } from "components/ui/BackButton";
import User from "models/User";
import Game from "../../models/Game";
import Profile from "./Profile";

const Menu = (openMenu, toggleMenu) => {

    const navigate = useNavigate();

    const [openProfile, setOpenProfile] = useState<boolean>(false);
    const [isInGame, setIsInGame] = useState<boolean>(sessionStorage.getItem("gameRoom"));

    function toggleProfile(withToggleMenu: boolean) {
        setOpenProfile(!openProfile);
        if (withToggleMenu) {
            toggleMenu();
        }
    }

    const handleOpenProfile = () => {
        console.log("To profile");
        setOpenProfile(true);
        setIsInGame(sessionStorage.getItem("gameRoom"));
    }

    const handleOpenHistory = () => {
        console.log("To history");
        alert(
            "Feature available soon"
        );
    }

    const logout = async () => {
        const user = new User(JSON.parse(sessionStorage.getItem("user")));
        const game = new Game(JSON.parse(sessionStorage.getItem("gameRoom")));
        sessionStorage.clear();
        navigate("/");
        if (game === null) {
            return;
        }
        try {
            const headers = { "Authorization": user.token, "X-User-ID": user.userId };
            await api.delete(`/games/${game.gameId}/leave/${user.userId}`, { headers: headers });
            console.log("Successfully exited game while logging out!");
        } catch {
            console.log("Couldn't exit the game properly!");
        }
        
    };

    return (
        <div>
            <button
                className={`screen-layer ${openMenu ? "open" : "closed"}`}
                onClick={() => toggleMenu()}>
                <div
                    className={`menu-container ${openMenu ? "open" : "closed"}`}>
                    <BackButton className="menu-backbutton"
                        onClick={() => toggleMenu()}>
                    </BackButton>
                    <button //profile
                        className="menu-button"
                        onClick={() => handleOpenProfile()}
                    >
                        Profile
                    </button>
                    <button //history
                        className="menu-button"
                        onClick={() => handleOpenHistory()}
                    >
                        History
                    </button>
                    <button //logout
                        className="menu-button"
                        onClick={() => logout()}
                    >
                        Log out
                    </button>
                </div>
            </button>
            {Profile(openProfile, toggleProfile, isInGame)}
        </div>
    );
}

export default Menu;