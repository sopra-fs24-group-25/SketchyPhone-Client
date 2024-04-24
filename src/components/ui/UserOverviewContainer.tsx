import React from "react";
import PropTypes from "prop-types";
import { UserPreview } from "../ui/UserPreview";
import "styles/ui/UserOverviewContainer.scss"

export const UserOverviewContainer = props => (
    <div className={`usercontainer ${props.className}`}>
        {props.userList.map((item) => (
            <div className="usercontainer user" key={item.name}>
                <UserPreview ></UserPreview>
                <div>
                    {props.showUserNames && <p className ="username">{item.nickname}</p>}
                    {item.role === "admin" && <p className="admin">admin</p>}
                </div>

            </div>
        ))}
    </div>
);

UserOverviewContainer.propTypes = {
    className: PropTypes.string,
    userList: PropTypes.array,
    showUserNames: PropTypes.bool
};