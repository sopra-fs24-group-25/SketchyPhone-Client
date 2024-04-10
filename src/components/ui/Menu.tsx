import React from "react";
import PropTypes from "prop-types";
import "../../styles/ui/MenuButton.scss";
import "../../styles/ui/MenuContainer.scss";
import { BackButton } from "components/ui/BackButton";
//import "styles/views/GameRoom.scss";

export const Menu = props => (
    <div
        className={`screen-layer ${props.open ? "open" : "closed"}`}
        onClick={() => props.menuButton(!props.open)}>
        <div
            className={`menu-container ${props.open ? "open" : "closed"}`}
            onClick={() => props.menuButton(!props.open)}>
            <div className="gameroom header">
                <BackButton
                    onClick={() => props.menuButton(!props.open)}>
                </BackButton>
            </div>
            <div //profile
                {...props}
                className="menu-button"
                onClick={() => props.profileButton()}
            >
                Profile
            </div>
            <div //history
                {...props}
                className="menu-button"
                onClick={() => props.historyButton()}
            >
                History
            </div>
            <div //logout
                {...props}
                className="menu-button"
                onClick={() => props.logoutButton()}
            >
                Log out
            </div>
        </div>
    </div>
);

Menu.propTypes = {
    className: PropTypes.string,
    open: PropTypes.bool,
    menuButton: PropTypes.func,
    profileButton: PropTypes.func,
    historyButton: PropTypes.func,
    logoutButton: PropTypes.func,
};
