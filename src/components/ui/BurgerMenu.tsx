import React from "react";
import PropTypes from "prop-types";
import "../../styles/ui/BurgerMenu.scss";

export const BurgerMenu = props => (
    <button
        {...props}
        className={`burgermenu ${props.className}`}>
    </button>
);

BurgerMenu.propTypes = {
    className: PropTypes.string,
};
