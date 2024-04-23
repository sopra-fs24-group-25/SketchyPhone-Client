import React, { useEffect, useState } from "react";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import { Button } from "components/ui/Button";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import { BackButton } from "components/ui/BackButton";
import { BurgerMenu } from "components/ui/BurgerMenu";
import { PhoneLogo } from "../ui/PhoneLogo";
import Menu from "components/ui/Menu";
import PropTypes from "prop-types";
import "styles/ui/PresentationContainer.scss";
import { User } from "types";
import DrawingPrompt from "models/DrawingPrompt"

const PresentationDrawing = (props) => {
    return (
        <div className="presentation drawingContainer">
            <p className = "presentation username rightalign">{props.drawingPrompt.creatorId}</p>
            <img
                className="presentation drawing"
                src={`data:image/png; base64, ${props.drawingPrompt.encodedImage}`}
            ></img>
        </div>

    )

}

PresentationDrawing.propTypes = {
    drawingPrompt: PropTypes.object
}

export default PresentationDrawing;