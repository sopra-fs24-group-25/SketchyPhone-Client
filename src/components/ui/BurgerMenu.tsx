import React from "react";
import PropTypes from "prop-types";
import "../../styles/ui/BurgerMenu.scss";
import "../../styles/ui/BackButton.scss";

export const BurgerMenu = props => (
    <button
        {...props}
        className={props.open ? "backbutton" : `burgermenu ${props.className}`}
        onClick={() => props.onClick()}
    >
    </button>
);

BurgerMenu.propTypes = {
    className: PropTypes.string,
    open: PropTypes.bool,
    onClick: PropTypes.func,
};
