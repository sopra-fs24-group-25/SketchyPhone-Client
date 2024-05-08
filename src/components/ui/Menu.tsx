import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/ui/MenuButton.scss";
import "../../styles/ui/BackButton.scss";
import "../../styles/ui/MenuContainer.scss";
import { BackButton } from "components/ui/BackButton";
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

    const logout = (): void => {
        sessionStorage.clear();
        navigate("/");
    };

    return (
        <div>
            <div
                className={`screen-layer ${openMenu ? "open" : "closed"}`}
                onClick={() => toggleMenu()}>
                <div
                    className={`menu-container ${openMenu ? "open" : "closed"}`}>
                    <div>
                        <BackButton className="menu-backbutton"
                            onClick={() => toggleMenu()}>
                        </BackButton>
                    </div>
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
            </div>
            {Profile(openProfile, toggleProfile, isInGame)}
        </div>
    );
}

export default Menu;