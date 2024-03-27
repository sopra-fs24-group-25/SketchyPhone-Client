import React from "react";
import PropTypes from "prop-types";
import "../../styles/ui/BackButton.scss";

export const BackButton = props => (
    <button
        {...props}
        className={`backbutton ${props.className}`}>
    </button>
);

BackButton.propTypes = {
    className: PropTypes.string,
};

