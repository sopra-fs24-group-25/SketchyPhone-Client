import React, { useState } from "react";
import { api } from "helpers/api";
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


const HistoryPresentation = (presentationContents, toggleHistorySession, openHistorySession, toggleOpenHistorySession, historyName, historyId, user, avatars) => {

    
    
    function presentTextPrompt(element) {
        return (
            <div key={`${element.textPromptId}` + `${element.round}`} className="presentation subContainer">
                <UserPreview
                    id={element.creator.avatarId}
                    encodedImage={avatars.find(avatar => avatar.avatarId === element.creator.avatarId)?.encodedImage}
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
                    encodedImage={avatars.find(avatar => avatar.avatarId === element.creator.avatarId)?.encodedImage}
                ></UserPreview>
            </div>
        )
    }

    function closeHistorySession(withToggleHistory) {
        toggleOpenHistorySession(!openHistorySession);
        if (withToggleHistory) {
            toggleHistorySession(withToggleHistory);
        }
    }

    async function handleDeleteHistory(historyId: number) {
        try {
            const requestHeader = { "Authorization": user.token, "X-User-ID": user.userId };
            const url = `/games/history/${historyId}/delete`;
            const response = await api.delete(url, { headers: requestHeader });
            console.log(response.data);
            closeHistorySession(true);
        } catch (error) {
            console.log("Error while deleting history session: " + error);
        }
    }

    return (      
        <button className={`screen-layer ${openHistorySession ? "open" : "closed"}`}>
            <div className="history-presentation container">
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between" }}>
                    <BackButton className="menu-backbutton"
                        onClick={() => closeHistorySession(true)}>
                    </BackButton>
                    <BackButton className="menu-backbutton close"
                        onClick={() => closeHistorySession(false)}>
                    </BackButton>
                </div>
                <div className="history-presentation title">{historyName}</div>
                <div className="history-presentation scroll-container">
                    {presentationContents.map((element) => {
                        if (element instanceof TextPrompt) {
                            return presentTextPrompt(element);
                        } else if (element instanceof DrawingPrompt) {
                            return presentDrawing(element);
                        }
                    })}
                    <div className="history-presentation separator">
                        <hr className="history-presentation separator leftalign"
                            style={{
                                background: "black",
                                color: "black",
                                borderColor: "black",
                                height: "2px",
                                width: "90%"
                            }}
                        />
                    </div>
                    <div className="history-presentation buttonsContainer">
                        <Button 
                            className="history-presentation buttonsContainer presentationButton"
                            width="20%"
                            onClick={() => handleDeleteHistory(historyId)}
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