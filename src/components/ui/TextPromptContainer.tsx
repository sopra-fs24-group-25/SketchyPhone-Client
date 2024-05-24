import React, { useState } from "react";
import { api, handleError } from "helpers/api";
import "../../styles/ui/BaseContainer.scss";
import "../../styles/ui/TextPromptContainer.scss";
import { Button } from "./Button";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import PropTypes from "prop-types";
import TextPrompt from "models/TextPrompt";
import GameLoopStatus from "../../helpers/gameLoopStatus"
import AudioContextEnum from "../../helpers/audioContextEnum";
import AudioPlayer from "../../helpers/AudioPlayer";

export const TextPromptContainer = ({ drawing, user, game, isInitialPrompt, timerDuration, setNextTask }) => {

    const [textPromptContent, setTextPromptContent] = useState<string>("");
    const [promptTooLong, setPromptTooLong] = useState<boolean>(false);
    let submitted = false;

    const maxChars = 50;

    const minuteSeconds = 60;
    const startTime = Date.now() / 1000; // use UNIX timestamp in seconds
    const endTime = startTime + timerDuration; // use UNIX timestamp in seconds

    const remainingTime = endTime - startTime;

    //fetch drawing, if first time, draw PhoneLogo

    // For audio effect
    const timerSound = new AudioPlayer(AudioContextEnum.TIMER);

    let sendAttempt = 0;
    const maxSendAttempt = 3;

    async function sendTextPrompt() {
        if (submitted) {
            console.log("Already successfully submitted");

            return;
        }
        try {
            // increase attempt counter
            sendAttempt += 1;

            // Get last gamesession (will always be the current)
            let currentGameSessions = game.gameSessions;
            let idx = currentGameSessions.length - 1;
            let currentGameSessionId = currentGameSessions[idx].gameSessionId;

            const requestHeader = { "Authorization": user.token, "X-User-ID": user.userId };

            // If we have a previous drawing id
            // for the very first text prompts -> insert 777 as previousDrawingId (from server documentation)W
            const previousDrawingId = (isInitialPrompt) ? 777 : drawing.drawingId;


            // Create new textprompt object and assign content
            const textPrompt = new TextPrompt();
            // Set data
            textPrompt.content = textPromptContent;
            textPrompt.previousDrawingId = previousDrawingId;

            const requestBody = JSON.stringify(textPrompt);

            const url = `/games/${currentGameSessionId}/prompts/${user.userId}/${previousDrawingId}`;
            console.log(url);
            const response = await api.post(url, requestBody, { headers: requestHeader });

            console.log("sending text prompt to server");
            console.log(response);

            if (response.status === 201) {
                submitted = true;
            }
            else if(sendAttempt <= maxSendAttempt){
                setTimeout(() => 500)
                await sendTextPrompt();
            }
        }
        catch (error) {
            alert(
                `Something went wrong: \n${handleError(error)}`
            );
        }
    }

    async function onSubmit() {
        await sendTextPrompt();

        setNextTask(GameLoopStatus.DRAWING);
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
    }

    return (
        <button className="prompt container"
            onKeyDown={(e) => (e.keyCode === 13 && textPromptContent ? onSubmit() : null)}>
            <div className={`prompt title ${isInitialPrompt ? "hidden" : ""}`}
            >
                It&apos;s time to guess what this drawing is about
            </div>
            <div className={`prompt drawing ${isInitialPrompt ? "first" : ""}`}>
                <div className="prompt field">
                    {isInitialPrompt ? drawing : (drawing !== null && <img
                        src={`data:image/png; base64, ${drawing.encodedImage.replaceAll("\"", "")}`}
                        alt="Drawing to guess"
                        style={{ userSelect: "none", "-webkit-user-drag": "none" }}>
                    </img>)}
                </div>
            </div>
            <div className="prompt timer">
                <CountdownCircleTimer
                    {...timerProps}
                    colors="#000000"
                    duration={timerDuration}
                    initialRemainingTime={remainingTime & minuteSeconds}
                    onComplete={() => ({ shouldRepeat: false })}

                    // Here submit if timer ran out
                    onUpdate={(remainingTime) => { (remainingTime === 0 && onSubmit()); (remainingTime === 10 && timerSound.handlePlay()) }}
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
        </button>
    )

}

TextPromptContainer.propTypes = {
    drawing: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    game: PropTypes.object.isRequired,
    isInitialPrompt: PropTypes.bool,
    timerDuration: PropTypes.number,
    setNextTask: PropTypes.func,
};