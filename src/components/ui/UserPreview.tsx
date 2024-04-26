import React from "react";
import PropTypes from "prop-types";
import "styles/ui/UserPreview.scss"

export const UserPreview = props => (
    <button {...props} className={`userpreview ${props.className} avatar${props.id}`}
    >
    </button>
);
UserPreview.propTypes = {
    className: PropTypes.string,
    id: PropTypes.number,
};

export default UserPreview;