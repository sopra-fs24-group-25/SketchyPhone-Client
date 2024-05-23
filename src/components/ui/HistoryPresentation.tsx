import React from "react";
import { Button } from "components/ui/Button";
import PresentationDrawing from "components/ui/PresentationDrawing";
import PresentationText from "components/ui/PresentationText";
import "styles/ui/HistoryPresentation.scss";
import TextPrompt from "models/TextPrompt";
import DrawingPrompt from "models/DrawingPrompt";
import UserPreview from "./UserPreview";
import "../../styles/ui/MenuButton.scss";
import "../../styles/ui/BackButton.scss";
import "../../styles/ui/HistoryPopUp.scss";
import { BackButton } from "components/ui/BackButton";


const HistoryPresentation = (presentationContents, goBack, openHistory, toggleHistory, historyName) => {

    function presentTextPrompt(element) {
        return (
            <div key={`${element.textPromptId}` + `${element.round}`} className="presentation subContainer">
                <UserPreview
                    id={element.creator.avatarId}
                ></UserPreview>
                <PresentationText
                    textPrompt={element}
                    doVote={null}
                    ownsDrawing={true}
                ></PresentationText>
            </div>
        )
    }

    function presentDrawing(element) {
        return (
            <div key={`${element.drawingId}` + `${element.round}`} className="presentation subContainer">
                <PresentationDrawing
                    drawingPrompt={element}
                    doVote={null}
                    ownsDrawing={true}
                ></PresentationDrawing>
                <UserPreview
                    id={element.creator.avatarId}
                ></UserPreview>
            </div>
        )
    }

    function closeHistory(x) {
        toggleHistory(!openHistory);
        goBack(x);
    }

    return (      
        <button className={`presentation screen-layer ${openHistory ? "open" : "closed"}`}>
            <div className="presentation container">
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                    <BackButton className="menu-backbutton"
                        onClick={() => closeHistory(true)}>
                    </BackButton>
                    <BackButton className="menu-backbutton close"
                        onClick={() => closeHistory(false)}>
                    </BackButton>
                </div>
                <div className="presentation title">{historyName}</div>
                <div className="presentation scroll-container">
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
                                width: "90%"
                            }}
                        />
                    </div>
                    <div className="presentation buttonsContainer">
                        <Button 
                            className="presentation buttonsContainer presentationButton"
                            width="20%"
                            onClick={() => console.log("possibly delete")}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </div >
        </button>
    )
}

export default HistoryPresentation;