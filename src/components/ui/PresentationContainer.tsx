import React, { useEffect, useState, useRef } from "react";
import { Button } from "components/ui/Button";
import { useNavigate } from "react-router-dom";
import BaseContainer from "components/ui/BaseContainer";
import PresentationDrawing from "components/ui/PresentationDrawing";
import PresentationText from "components/ui/PresentationText";
import PropTypes from "prop-types";
import "styles/ui/PresentationContainer.scss";
import TextPrompt from "models/TextPrompt";
import DrawingPrompt from "models/DrawingPrompt";
import UserPreview from "./UserPreview";
import AudioContextEnum from "../../helpers/audioContextEnum";
import AudioPlayer from "../../helpers/AudioPlayer";
import { api, handleError } from "helpers/api";


const PresentationContainer = ({ presentationContents, isAdmin, onClickIncrement, onClickNextRound, onClickResults, gameSession, gameId, user }) => {

    const navigate = useNavigate();

    const containerRef = useRef(null);

    const [newVote, setNewVote] = useState<number>(0);

    // create audioplayer to use
    const revealAudio = new AudioPlayer(AudioContextEnum.PRESENTATION_REVEAL_DRAWING);
    const upvoteAudio = new AudioPlayer(AudioContextEnum.UPVOTE);
    const clickAudio = new AudioPlayer(AudioContextEnum.BUTTON_POP);

    const exitGame = async () => {
        try {
            const headers = { "Authorization": user.token, "X-User-ID": user.userId };
            await api.delete(`/games/${gameId}/leave/${user.userId}`, { headers: headers });
            sessionStorage.removeItem("numCycles");
            sessionStorage.removeItem("gameSpeed");
            sessionStorage.removeItem("isEnabledTTS");
            sessionStorage.removeItem("gameRoom");
            sessionStorage.removeItem("gameroomToken");
            sessionStorage.removeItem("gameSettings");
            navigate("/gameRoom");
            console.log("exited room");
        } catch (error) {
            alert(`Could not exit:\n ${handleError(error)}`);
        }
    }

    function TextToSpeech(text) {
        const synth = window.speechSynthesis;
        let speakThis = new SpeechSynthesisUtterance(text);

        speakThis.rate = 1;
        speakThis.pitch = 1;
        speakThis.voice = synth.getVoices()[50]
        speakThis.lang = "pl-PL";
        synth.cancel();
        synth.speak(speakThis);
    }


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

    }, [presentationContents, newVote]);

    // UseEffect for sound effect trigger
    useEffect(() => {
        const lastElement = presentationContents[presentationContents.length - 1];

        if (lastElement instanceof DrawingPrompt) {
            // Play audio
            revealAudio.handlePlay();
        }

        if (lastElement instanceof TextPrompt) {
            TextToSpeech(lastElement.content);
        }

    }, [presentationContents])

    // useEffect for upvote sound
    useEffect(() => {
        upvoteAudio.handlePlay();
    }, [newVote])

    async function doVoteTextPrompt(textPrompt, creator) {
        // For testing
        if (gameSession === undefined) {
            if (textPrompt.hasVoted) {
                textPrompt.numVotes -= 1;
                setNewVote(newVote - 1);
            }
            else {
                textPrompt.numVotes += 1;
                setNewVote(newVote + 1);
            }

            textPrompt.hasVoted = !textPrompt.hasVoted;

            return;
        }

        console.log(`Voted for text prompt ${textPrompt.textPromptId} from ${creator.nickname}`);

        // Base url for upvoting
        const url = `/games/${gameSession.gameSessionId}/prompt/${textPrompt.textPromptId}/vote`;

        if (textPrompt.hasVoted) {
            // Base url for unvoting
            const url = `/games/${gameSession.gameSessionId}/prompt/${textPrompt.textPromptId}/unvote`;
        }

        const requestHeader = { "Authorization": user.token, "X-User-ID": user.userId };
        console.log(requestHeader)

        try {
            const response = await api.put(url, null, { headers: requestHeader });
            console.log(response);

            if (textPrompt.hasVoted) {
                textPrompt.votes -= 1;
                setNewVote(newVote - 1);
            }
            else {
                textPrompt.votes += 1;
                setNewVote(newVote + 1);
            }

            textPrompt.hasVoted = !textPrompt.hasVoted;
        } catch (error) {
            console.log("There was an issue when upvoting on textprompt: " + error)
        }


    }

    async function doVoteDrawing(drawing, creator) {
        // For testing
        if (gameSession === undefined) {
            if (drawing.hasVoted) {
                drawing.votes -= 1;
                setNewVote(newVote - 1);
            }
            else {
                drawing.votes += 1;
                setNewVote(newVote + 1);
            }

            drawing.hasVoted = !drawing.hasVoted;

            return;
        }
        console.log(`Voted for drawing ${drawing.drawingId} from ${creator.nickname}`);

        // Base url for upvoting
        const url = `/games/${gameSession.gameSessionId}/drawing/${drawing.drawingId}/vote`;

        if (drawing.hasVoted) {
            alert("Unvoting!")

            // Base url for unvoting
            const url = `/games/${gameSession.gameSessionId}/drawing/${drawing.drawingId}/unvote`;
        }

        const requestHeader = { "Authorization": user.token, "X-User-ID": user.userId };

        try {
            const response = await api.put(url, null, { headers: requestHeader });
            console.log(response);

            if (drawing.hasVoted) {
                drawing.numVotes -= 1;
                setNewVote(newVote - 1);
            }
            else {
                drawing.numVotes += 1;
                setNewVote(newVote + 1);
            }

            drawing.hasVoted = !drawing.hasVoted;
        } catch (error) {
            console.log("There was an issue when upvoting on drawing: " + error)
        }


    }

    function presentTextPrompt(element) {
        return (
            <div key={`${element.textPromptId}` + `${element.round}`} className="presentation subContainer">
                {/* <Button
                    style = {{margin: "20px"}}
                    onClick={() => TextToSpeech(element.content)}>
                    Speak
                </Button> */}
                <UserPreview
                    id={element.creator.avatarId}
                ></UserPreview>
                <PresentationText
                    textPrompt={element}
                    doVote={doVoteTextPrompt}
                    ownsDrawing= {user.userId === element.creator.userId}
                ></PresentationText>
            </div>
        )
    }

    function presentDrawing(element) {
        console.log(user.userId === element.creator.userId)
        return (
            <div key={`${element.drawingId}` + `${element.round}`} className="presentation subContainer">
                <PresentationDrawing
                    // key={element.drawingId}
                    drawingPrompt={element}
                    doVote={doVoteDrawing}
                    ownsDrawing= {user.userId === element.creator.userId}
                ></PresentationDrawing>
                <UserPreview
                    id={element.creator.avatarId}
                ></UserPreview>
            </div>
        )
    }

    return (
        <BaseContainer style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div ref={containerRef} className="presentation container">
                {presentationContents.map((element) => {
                    if (element instanceof TextPrompt) {
                        return presentTextPrompt(element);
                    } else if (element instanceof DrawingPrompt) {
                        return presentDrawing(element);
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
                {/* NOT IMPLEMENTED YET */}
                {/* <Button className="presentation presentationButton"
                    width='20%'
                >
                    See Results
                </Button> */}
                <div className="presentation buttonsContainer">
                    {isAdmin && <Button
                        onClick={() => { onClickIncrement(); clickAudio.handlePlay() }}
                        width="20%"
                        className="presentation buttonsContainer presentationButton"
                    >
                        Show next prompt
                    </Button>}
                    {isAdmin && <Button
                        onClick={() => { onClickNextRound(); clickAudio.handlePlay() }}
                        width="20%"
                        className="presentation buttonsContainer presentationButton"
                    >
                        Start new round
                    </Button>}
                    {isAdmin && <Button
                        onClick={() => { onClickResults(); clickAudio.handlePlay() }}
                        width="20%"
                        className="presentation buttonsContainer presentationButton"
                    >
                        Show results
                    </Button>}
                    <Button className="presentation buttonsContainer presentationButton"
                        width="20%"
                        onClick={() => { exitGame(); clickAudio.handlePlay() }}
                    >
                        End game
                    </Button>
                </div>

            </div >
        </BaseContainer>
    )
}

PresentationContainer.propTypes = {
    // The array passed in is already in order and contains either textPrompts or drawingPrompts
    presentationContents: PropTypes.array,
    isAdmin: PropTypes.bool,
    onClickIncrement: PropTypes.func,
    onClickNextRound: PropTypes.func,
    onClickResults: PropTypes.func,
    gameSession: PropTypes.object,
    gameId: PropTypes.number,
    user: PropTypes.object
}

export default PresentationContainer;