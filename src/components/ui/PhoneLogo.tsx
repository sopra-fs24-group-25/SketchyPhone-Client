import React from "react";
import PropTypes from "prop-types";
import PhoneSVG from "../../icons/PhoneLogo.svg"

export const PhoneLogo = () => {
    return(
        <img src={PhoneSVG} style={{userSelect:"none", "-webkit-user-drag":"none", "animation": "shake1 0.4s ease-in-out 0s infinite"}}/>
    );
};
