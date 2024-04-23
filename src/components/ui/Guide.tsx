import React from "react";
import PropTypes from "prop-types";
import "../../styles/ui/Button.scss";

export const Guide = props => (
    <button
        {...props}
        style={{ width: props.width, ...props.style }}
        className={`primary-button ${props.className}`}>
        {props.children}
    </button>
);


Guide.propTypes = {
    width: PropTypes.number,
    style: PropTypes.string,
    className: PropTypes.string,
    children: PropTypes.node,
};