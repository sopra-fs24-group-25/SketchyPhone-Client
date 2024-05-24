import React from "react";
import PropTypes from "prop-types";
import { AvatarPreview } from "./AvatarPreview";
import "styles/ui/AvatarChoice.scss";
import Avatar from "models/Avatar";

const AvatarChoice = props => (
    <div className={`avatar-container ${props.className}`}>
        {props.avatarList.map((item: Avatar) => (
            <div className = "avatar" key={item.avatarId}>
                <AvatarPreview
                    className={item.selected}
                    id={item.avatarId}
                    onClick={() => props.choose(item.avatarId)}
                    encodedImage={item.encodedImage ?? null}
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