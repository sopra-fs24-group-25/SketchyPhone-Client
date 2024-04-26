import React from "react";
import PropTypes from "prop-types";
import "styles/ui/AvatarPreview.scss"

export const AvatarPreview = (props) => (
    <button {...props} className={`avatar-preview ${props.className} avatar${props.id}`}
    >
    </button>
);

AvatarPreview.propTypes = {
    className: PropTypes.string,
    id: PropTypes.number
};

export default AvatarPreview;