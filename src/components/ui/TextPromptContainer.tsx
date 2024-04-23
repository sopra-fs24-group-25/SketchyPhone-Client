import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import { PhoneLogo } from "../ui/PhoneLogo";
import "../../styles/ui/BaseContainer.scss";
import "../../styles/ui/TextPromptContainer.scss";
import { Button } from "./Button";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import PropTypes from "prop-types";
import TextPrompt from "models/TextPrompt";
import User from "../../models/User"
import GameSession from "../../models/GameSession"

export const TextPromptContainer = ({ drawing, isInitialPrompt, timerDuration, setNextTask }) => {

    const [textPromptContent, setTextPromptContent] = useState<String>("");
    const [promptTooLong, setPromptTooLong] = useState<Boolean>(false);

    const maxChars = 50;

    const minuteSeconds = 60;
    const startTime = Date.now() / 1000; // use UNIX timestamp in seconds
    const endTime = startTime + timerDuration; // use UNIX timestamp in seconds

    const remainingTime = endTime - startTime;

    //fetch drawing, if first time, draw PhoneLogo

    async function sendTextPrompt() {
        try {
            // TODO Change these to props
            // Send text here
            const user = new User(JSON.parse(sessionStorage.getItem("user")));
            const gameSession = new GameSession(JSON.parse(sessionStorage.getItem("gameSession")));

            // console.log(gameSession.gameSessions[gameSession.gameSessions.length -1].gameSessionId);
            console.log(user);

            // Get last gamesession (will always be the current)
            const gameSessionId = gameSession.gameSessions[gameSession.gameSessions.length - 1].gameSessionId;

            const requestHeader = { "Authorization":  user.token, "X-User-ID": user.id };

            // If we have a previous drawing id
            // for the very first text prompts -> insert 777 as previousDrawingId (from server documentation)W
            const previousDrawingId = (isInitialPrompt) ? 777 : drawing.drawingId;


            // Create new textprompt object and assign content
            const textPrompt = new TextPrompt();
            // Set data
            textPrompt.content = textPromptContent;
            textPrompt.previousDrawingId = previousDrawingId;

            const requestBody = JSON.stringify(textPrompt);
            
            const url = `/games/${gameSessionId}/prompts/${user.id}/${previousDrawingId}`;
            const response = api.post(url, requestBody, { headers: requestHeader });

            // Some logging
            console.log(requestBody);
            console.log(url);
            console.log(requestHeader);

            textPromptContent;
            console.log("sending text prompt to server");
        }
        catch (error) {
            alert(
                `Something went wrong: \n${handleError(error)}`
            );
        }
    }

    async function onSubmit() {
        await sendTextPrompt();

        // Lets wait for 2 seconds
        //await new Promise((resolve) => setTimeout(resolve, 2000));

        setNextTask("Drawing");
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
            setTextPromptContent(t.target.value);
        }
        // console.log("field", t.target.value);
        // console.log("prompt", textPromptContent);
    }

    return (
        <div className="prompt container">
            <div className={`prompt title ${isInitialPrompt ? "hidden" : ""}`}
            >
                It&apos;s time to guess what this drawing is about
            </div>
            <div className="prompt drawing"
                style={{ backgroundColor: `${isInitialPrompt ? "transparent" : "white"}` }}
            >
                <div className="prompt field">
                    {isInitialPrompt ? drawing : (drawing !== null && <img
                        src={`data:image/png; base64, ${drawing.encodedImage}`}
                        style={{userSelect:"none", "-webkit-user-drag":"none"}}
                    ></img>)}

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
                        style={{ userSelect: "none" }}
                        value={textPromptContent}
                        onChange={(t) => handleChange(t)}
                    />
                </div>
            </div>
            <Button
                width="20%"
                onClick={() => onSubmit()}
                disabled={!textPromptContent}
            >
                Submit
            </Button>
        </div>
    )

}

TextPromptContainer.propTypes = {
    drawing: PropTypes.object,
    isInitialPrompt: PropTypes.bool,
    timerDuration: PropTypes.number,
    setNextTask: PropTypes.func,
};