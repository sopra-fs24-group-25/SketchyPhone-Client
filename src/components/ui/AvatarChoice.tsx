import { React, useEffect } from "react";
import PropTypes from "prop-types";
import { AvatarPreview } from "./AvatarPreview";
import "styles/ui/AvatarChoice.scss";
import Avatar from "models/Avatar";

const AvatarChoice = (props) => {
    useEffect(() => {
        props.avatarList.forEach(element => {
            const avatarElement = document.getElementById(element.id);
            const avatarLocation = `${process.env.PUBLIC_URL}/avatars/avatar${element.id}.svg`
            const avatarURL =  "url('"+avatarLocation+"')"
            avatarElement.style.backgroundImage = avatarURL;
        });
    })

    return (
        <div className={`avatar-container ${props.className}`}>
            {props.avatarList.map((item: Avatar) => {
                return (
                    <div className="avatar" key={item.id}>
                        <AvatarPreview
                            className={item.selected}
                            onClick={() => props.choose(item.id)}
                            id={item.id}
                        >
                        </AvatarPreview>
                    </div>
                )
            })}
        </div>
    );

}

AvatarChoice.propTypes = {
    className: PropTypes.string,
    avatarList: PropTypes.array,
    choose: PropTypes.func
};

export default AvatarChoice;