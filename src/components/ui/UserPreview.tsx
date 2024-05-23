import React from "react";
import PropTypes from "prop-types";
import "styles/ui/UserPreview.scss"

export const UserPreview = props => (
    <button
        {...props}
        className={`userpreview ${props.className} ${!props.encodedImage ? "avatar" + props.id : ""}`}
        style={props.encodedImage ? { backgroundImage: `url(${props.encodedImage})` } : {}}
    >
    </button>
);
UserPreview.propTypes = {
    className: PropTypes.string,
    id: PropTypes.number,
    encodedImage: PropTypes.string,
};

export default UserPreview;