import React from "react";
import PropTypes from "prop-types";
import { UserPreview } from "../ui/UserPreview";
import "styles/ui/UserOverviewContainer.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCrown } from "@fortawesome/free-solid-svg-icons";

export const UserOverviewContainer = props => (
    <div className={`usercontainer ${props.className}`}>
        {props.userList.map((item) => (
            <div className="user" key={item.nickname}>
                <UserPreview
                    style={{ backgroundImage: `url("../avatars/avatar${item.avatarId}.svg")` }}
                    onClick={() => console.log(`Avatar ID: ${item.avatarId}, future kick functionality`)}
                >
                </UserPreview>
                <div style={{flexDirection: "column", }}>
                    {item.role === "admin" &&
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px"
                            }}
                        >
                            <div className="username admin">Admin</div>
                            <FontAwesomeIcon
                                icon={faCrown}
                                style={{color: "yellow"}}
                            />
                        </div>
                    }
                    {props.showUserNames && <div className ="username">{item.nickname}</div>}
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