import React from "react";
import PropTypes from "prop-types";
import "styles/ui/AvatarPreview.scss"

export const AvatarPreview = (props) => {
    const backgroundImageStyle = props.encodedImage ? { backgroundImage: `url(${props.encodedImage})` } : {};
    const combinedStyle = { ...backgroundImageStyle, ...props.style };

    return (
        <button
            {...props}
            className={`avatar-preview ${props.className} ${!props.encodedImage ? "avatar" + props.id : ""}`}
            style={combinedStyle}
        >
        </button>
    );
};

AvatarPreview.propTypes = {
    className: PropTypes.string,
    id: PropTypes.number,
    style: PropTypes.object,
    encodedImage: PropTypes.string,
};

export default AvatarPreview;
