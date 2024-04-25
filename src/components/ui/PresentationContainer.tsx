import React, { useEffect, useState, useRef } from "react";
import { api, handleError } from "helpers/api";
import { Spinner } from "components/ui/Spinner";
import { Button } from "components/ui/Button";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import { BackButton } from "components/ui/BackButton";
import { BurgerMenu } from "components/ui/BurgerMenu";
import PresentationDrawing from "components/ui/PresentationDrawing";
import PresentationText from "components/ui/PresentationText";
import { PhoneLogo } from "../ui/PhoneLogo";
import Menu from "components/ui/Menu";
import PropTypes from "prop-types";
import "styles/ui/PresentationContainer.scss";
import { User } from "models/user";
import TextPrompt from "models/TextPrompt";
import DrawingPrompt from "models/DrawingPrompt";
import { DrawContainer } from "components/ui/DrawContainer";
import { TextPromptContainer } from "components/ui/TextPromptContainer";
import UserPreview from "./UserPreview";


const PresentationContainer = ({presentationContents}) => {
    const containerRef = useRef(null);

    useEffect(() => {
        // Scroll to the bottom when the component initially renders
        containerRef.current.scrollTop = containerRef.current.scrollHeight;
      }, []);

      useEffect(() => {
        // Calculate the difference in height before and after the update
        const prevHeight = containerRef.current.scrollHeight;
        
        // Calculate the new scroll position
        const newHeight = containerRef.current.scrollHeight;
        const scrollDifference = newHeight - prevHeight;
    
        // Adjust the scroll position to maintain the bottom alignment
        containerRef.current.scrollTop += scrollDifference;
      }, [presentationContents]);

    return (
        <div ref = {containerRef} className="presentation container">
            {presentationContents.map((element) => {
                if (element instanceof TextPrompt) {
                    return (
                        <div key={`${element.textPromptId}` + `${element.round}`} className="presentation subContainer">
                            <UserPreview></UserPreview>
                            <PresentationText
                                textPrompt={element}
                            ></PresentationText>
                        </div>

                    )
                } else if (element instanceof DrawingPrompt) {
                    return (
                        <div key={`${element.drawingId}` + `${element.round}`} className="presentation subContainer">
                            <PresentationDrawing
                                // key={element.drawingId}
                                drawingPrompt={element}
                            ></PresentationDrawing>
                            <UserPreview></UserPreview>
                        </div>

                    )
                }
            })}
            <div className="presentation separator">
                <hr className="presentation separator leftalign"
                    style={{
                        background: "black",
                        color: "black",
                        borderColor: "black",
                        height: "2px",
                        width: "40%"
                    }}
                />
                <p>DONE</p>
                <hr className="presentation separator rightalign"
                    style={{
                        background: "black",
                        color: "black",
                        borderColor: "black",
                        height: "2px",
                        width: "40%"
                    }}
                />
            </div>
            <Button className="presentation resultsButton"
                width='20%'
            >
                See Results
            </Button>

        </div>
    )
}

PresentationContainer.propTypes = {
    // The array passed in is already in order and contains either textPrompts or drawingPrompts
    presentationContents: PropTypes.array
}

export default PresentationContainer;