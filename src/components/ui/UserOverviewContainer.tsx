import React from 'react';
import PropTypes from "prop-types";
import { UserPreview } from '../ui/UserPreview';
import "styles/ui/UserOverviewContainer.scss"

export const UserOverviewContainer = props => (
    <div className={`usercontainer ${props.className}`}>
        {props.userList.map((item) => (
            <div className = "usercontainer user" key={item.username}>
                <UserPreview ></UserPreview>
                {props.showUserNames && <div>{item.username}</div>}
                {item.isAdmin && <div className = "admin">admin</div>}
            </div>
        ))}
    </div>
);

UserOverviewContainer.propTypes = {
    className: PropTypes.string,
    userList: PropTypes.array,
    showUserNames: PropTypes.bool
};