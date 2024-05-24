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
import History from "./History";

const Menu = (openMenu, toggleMenu, isPersistent, isPlaying, showProfile = true) => {

    const navigate = useNavigate();

    const [openProfile, setOpenProfile] = useState<boolean>(false);
    const [openHistory, setOpenHistory] = useState<boolean>(false);
    const [isInGameRoom, setIsInGameRoom] = useState<boolean>(sessionStorage.getItem("gameRoom"));

    function toggleProfile(withToggleMenu: boolean) {
        setOpenProfile(!openProfile);
        if (withToggleMenu) {
            toggleMenu();
        }
    }

    const handleOpenProfile = () => {
        console.log("To profile");
        setOpenProfile(true);
        setIsInGameRoom(sessionStorage.getItem("gameRoom"));
    }

    function toggleHistory(withToggleMenu: boolean) {
        setOpenHistory(!openHistory);
        if (withToggleMenu) {
            toggleMenu();
        }
    }

    const handleOpenHistory = () => {
        console.log("To history");
        setOpenHistory(true);
        setIsInGameRoom(sessionStorage.getItem("gameRoom"));
    }

    async function removeFromGame(user: User, game: Game, headers) {
        try {
            await api.delete(`/games/${game.gameId}/leave/${user.userId}`, { headers: headers });
            console.log("Successfully exited game!");
        } catch {
            console.log("Couldn't exit the game properly!");
        }
    }

    async function deleteUser(user: User, headers) {
        try {
            await api.delete(`/users/${user.userId}`, { headers: headers});
            console.log("Successfully deleted user!");
        } catch {
            console.log("Couldn't delete user properly!");
        }
    }

    const exitGame = async () => {
        const user = new User(JSON.parse(sessionStorage.getItem("user")));
        const game = new Game(JSON.parse(sessionStorage.getItem("gameRoom")));
        const headers = { "Authorization": user.token, "X-User-ID": user.userId };

        if (game.gameId) {
            await removeFromGame(user, game, headers);
        }

        const userToSave = {...user, role: null};
        sessionStorage.setItem("user", JSON.stringify(userToSave));
        sessionStorage.removeItem("numCycles");
        sessionStorage.removeItem("gameSpeed");
        sessionStorage.removeItem("isEnabledTTS");
        sessionStorage.removeItem("gameRoom");
        sessionStorage.removeItem("gameroomToken");
        sessionStorage.removeItem("gameSettings");
        navigate("/gameRoom");
    }

    const logout = async () => {
        console.log("logout");
        const user = new User(JSON.parse(sessionStorage.getItem("user")));
        const game = new Game(JSON.parse(sessionStorage.getItem("gameRoom")));
        const headers = { "Authorization": user.token, "X-User-ID": user.userId };

        sessionStorage.clear();
        navigate("/");

        if (game.gameId) {
            await removeFromGame(user, game, headers);
        }
        if (user.userId && !user.persistent) {
            await deleteUser(user, headers);
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
                    {!isPlaying && showProfile ? <button //profile
                        className="menu-button"
                        onClick={() => handleOpenProfile()}
                    >
                        Profile
                    </button>
                        : null}
                    {isPersistent && !isPlaying ?
                        <button //history
                            className="menu-button"
                            onClick={() => handleOpenHistory()}
                        >
                            History
                        </button>
                        : null }
                    {isPlaying ?
                        <button //exit game
                            className="menu-button"
                            onClick={() => exitGame()}
                        >
                            Exit game
                        </button>
                        : null }
                    <button //logout
                        className="menu-button"
                        onClick={() => logout()}
                    >
                        Log out
                    </button>
                </div>
            </button>
            {Profile(openProfile, toggleProfile, isInGameRoom)}
            {History(openHistory, toggleHistory)}
        </div>
    );
}

export default Menu;