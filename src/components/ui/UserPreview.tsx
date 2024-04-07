import React from "react";
import PropTypes from "prop-types";
import "styles/ui/UserPreview.scss"

export const UserPreview = props => (
    <img className={`userpreview ${props.className}`}
        src={require("./../../icons/user-svgrepo-com.svg").default} >

    </img>
);
UserPreview.propTypes = {
    className:PropTypes.string
};

export default UserPreview;