import React from "react";
import PropTypes from "prop-types";
import { AvatarPreview } from "./AvatarPreview";
import "styles/ui/AvatarChoice.scss"
import Avatar from "models/Avatar";

export const AvatarChoice = props => (
    <div className={`avatar-container ${props.className}`}>
        {props.avatarList.map((item: Avatar) => (
            <div className = "avatar-container avatar" key={item.id}>
                <AvatarPreview
                    className={item.selected}
                    onClick={() => props.choose(item.id)}
                >
                </AvatarPreview>
                {item.selected}
            </div>
        ))}
    </div>
);

AvatarChoice.propTypes = {
    className: PropTypes.string,
    avatarList: PropTypes.array,
    choose: PropTypes.func
};