import React from "react";
import PhoneSVG from "../../icons/PhoneLogo.svg";

export const PhoneLogo = () => {
    return(
        <img
            src={PhoneSVG}
            alt=""
            style={{
                userSelect:"none",
                WebkitUserDrag:"none",
                "animation": "shake1 0.4s ease-in-out 0s infinite"
            }}
        />
    );
};
