import React from "react";
import PropTypes from "prop-types";
import "../../styles/ui/GuideButton.scss";

export const GuideButton = props => (
    <button
        {...props}
        style={{ width: props.width, ...props.style }}
        className={`guide-button ${props.className}`}>
        {props.children}
    </button>
);


GuideButton.propTypes = {
    width: PropTypes.number,
    style: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.node,
};
