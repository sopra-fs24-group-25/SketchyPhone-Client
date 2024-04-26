import React from "react";
import PropTypes from "prop-types";
import { AvatarPreview } from "./AvatarPreview";
import "styles/ui/AvatarChoice.scss";
import Avatar from "models/Avatar";

const AvatarChoice = props => (
    <div className={`avatar-container ${props.className}`}>
        {props.avatarList.map((item: Avatar) => (
            <div className = "avatar" key={item.id}>
                <AvatarPreview
                    className={item.selected}
                    id={item.id}
                    onClick={() => props.choose(item.id)}
                >
                </AvatarPreview>
            </div>
        ))}
    </div>
);

AvatarChoice.propTypes = {
    className: PropTypes.string,
    avatarList: PropTypes.array,
    choose: PropTypes.func
};

export default AvatarChoice;