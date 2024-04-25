import React from "react";
import PropTypes from "prop-types";
import "styles/ui/UserPreview.scss"

export const UserPreview = props => (
    <img {...props} className={`userpreview ${props.className}`}
        //src={require(`/avatars/avatar${props.linkId}.svg`).default}
    >
    </img>
);
UserPreview.propTypes = {
    className: PropTypes.string,
    linkId: PropTypes.string
};

export default UserPreview;