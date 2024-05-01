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


const PresentationContainer = ({ presentationContents, isAdmin, onClickIncrement, onClickNextRound }) => {

    const navigate = useNavigate();

    const containerRef = useRef(null);

    const [newVote, setNewVote] = useState<number>(0);

    const exitGame = () => {
        sessionStorage.clear();
        navigate("/gameRoom");
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

        // get last element and speak if textprompt
        const lastElement = presentationContents[presentationContents.length - 1];
        if (lastElement instanceof TextPrompt) {
            TextToSpeech(lastElement.content);
        }

    }, [presentationContents, newVote]);

    function doVoteTextPrompt(textPrompt, creator) {
        console.log(`Voted for text prompt ${textPrompt.textPromptId} from ${creator.nickname}`);

        //for testing, should be a server request to increase/decrease vote count in future
        textPrompt.votes += 1;
        setNewVote(newVote + 1);
    }

    function doVoteDrawing(drawing, creator) {
        console.log(`Voted for drawing ${drawing.drawingId} from ${creator.nickname}`);

        //for testing, should be a server request to increase/decrease vote count in future
        drawing.votes += 1;
        setNewVote(newVote + 1);
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
                ></PresentationText>
            </div>
        )
    }

    function presentDrawing(element) {
        return (
            <div key={`${element.drawingId}` + `${element.round}`} className="presentation subContainer">
                <PresentationDrawing
                    // key={element.drawingId}
                    drawingPrompt={element}
                    doVote={doVoteDrawing}
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
                        onClick={() => onClickIncrement()}
                        width="20%"
                        className="presentation buttonsContainer presentationButton"
                    >
                        Show next prompt
                    </Button>}
                    {isAdmin && <Button
                        onClick={() => onClickNextRound()}
                        width="20%"
                        className="presentation buttonsContainer presentationButton"
                    >
                        Start new round
                    </Button>}
                    <Button className="presentation buttonsContainer presentationButton"
                        width="20%"
                        onClick={() => exitGame()}
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
    onClickNextRound: PropTypes.func
}

export default PresentationContainer;