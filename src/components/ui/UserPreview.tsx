import React from "react";
import PropTypes from "prop-types";
import "styles/ui/UserPreview.scss"

export const UserPreview = props => (
    <button {...props} className={`userpreview ${props.className}`}
    >
    </button>
);
UserPreview.propTypes = {
    className: PropTypes.string,
};

export default UserPreview;