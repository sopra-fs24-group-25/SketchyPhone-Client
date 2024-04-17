import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import {PhoneLogo} from "../ui/PhoneLogo";
import "../../styles/ui/BaseContainer.scss";
import "../../styles/ui/TextPromptContainer.scss";
import { Button } from "./Button";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import PropTypes from "prop-types";

export const TextPromptContainer = ({ drawing, isInitialPrompt, timerDuration, setNextTask }) => {

    const [textPrompt, setTextPrompt] = useState<String>("");
    const [promptTooLong, setPromptTooLong] = useState<Boolean>(false);

    const maxChars = 50;

    const minuteSeconds = 60;
    const startTime = Date.now() / 1000; // use UNIX timestamp in seconds
    const endTime = startTime + timerDuration; // use UNIX timestamp in seconds

    const remainingTime = endTime - startTime;

    //fetch drawing, if first time, draw PhoneLogo
    
    async function sendTextPrompt() {
        try {
            // Send image here
            const gameSessionId = sessionStorage.getItem("gameSessionId");
            const userId = sessionStorage.getItem("userId");
            const userToken = sessionStorage.getItem("userToken");
            textPrompt;
            console.log("sending textprompt to server");
        }
        catch (error) {
            alert(
                `Something went wrong: \n${handleError(error)}`
            );
        }
    }

    async function onSubmit() {
        await sendTextPrompt();
        //setNextTask("Drawing");
    }

    const timerProps = {
        isPlaying: true,
        size: 60,
        strokeWidth: 6
    };

    const handleChange = async (t) => {
        if (t.target.value.length > maxChars) {
            setPromptTooLong(true);
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setPromptTooLong(false);
        } else {
            setPromptTooLong(false);
            setTextPrompt(t.target.value);
        }
        console.log("field", t.target.value);
        console.log("prompt", textPrompt);
    }

    return (
            <div className="prompt container">
                <div className={`prompt title ${isInitialPrompt ? "hidden" : ""}`}
                >
                    It&apos;s time to guess what this drawing is about
                </div>
                <div className="prompt drawing"
                    style={{backgroundColor: `${isInitialPrompt ? "transparent" : "white"}`}}
                >
                    <div className="prompt field">
                        {drawing}
                    </div>
                </div>
                <div className="prompt timer">
                    <CountdownCircleTimer
                        {...timerProps}
                        colors="#000000"
                        duration={timerDuration}
                        initialRemainingTime={remainingTime & minuteSeconds}
                        onComplete={(totalElapsedTime) => ({ shouldRepeat: false })}

                        // Here submit if timer ran out
                        onUpdate={(remainingTime) => (remainingTime === 0 && onSubmit())}
                    >
                    </CountdownCircleTimer>
                    <div className="prompt sub-container">
                        <label className="prompt label">{isInitialPrompt ? "Input a quirky sentence:" : "Describe the drawing:"}</label>
                        <input
                            className={`prompt input ${promptTooLong ? "invalid" : ""}`}
                            placeholder={`Max ${maxChars} characters`}
                            style={{userSelect:"none"}}
                            value={textPrompt}
                            onChange={(t) => handleChange(t)}
                        />
                    </div>
                </div>
                <Button
                    width="20%"
                    onClick={() => onSubmit()}
                    disabled={!textPrompt}
                >
                    Submit
                </Button>
            </div>
    )

}

TextPromptContainer.propTypes = {
    drawing: PropTypes.image,
    isInitialPrompt: PropTypes.bool,
    timerDuration: PropTypes.number,
    setNextTask: PropTypes.func,
};