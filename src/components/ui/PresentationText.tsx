import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import { Button } from "components/ui/Button";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import { BackButton } from "components/ui/BackButton";
import { BurgerMenu } from "components/ui/BurgerMenu";
import { PhoneLogo } from "./PhoneLogo";
import Menu from "components/ui/Menu";
import PropTypes from "prop-types";
import "styles/ui/PresentationContainer.scss";
import { User } from "types";
import TextPrompt from "models/TextPrompt"

const PresentationText = (props) => {
    return (
        <div className = "presentation textContainer">
            <p className="presentation username leftalign">
                {props.textPrompt.creator}</p>
            <p className = "presentation text">
                {props.textPrompt.content}</p>
        </div>
    )
}

PresentationText.propTypes = {
    textPrompt: PropTypes.object
}

export default PresentationText;