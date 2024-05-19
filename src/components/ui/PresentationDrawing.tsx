import React from "react";
import PropTypes from "prop-types";
import "styles/ui/PresentationContainer.scss";

const PresentationDrawing = (props) => {

    const downloadImage = (ImageBase64, fileName) => {
        const imgDL = document.createElement("a");
        imgDL.href = "data:image/png;base64," + ImageBase64;
        imgDL.download = fileName;
        imgDL.click();
    }

    function getVotingButtonState() {
        if (props.ownsDrawing) {
            return "hidden";
        }

        return props.drawingPrompt.hasVoted ? "selected" : "";
    }

    return (
        <div className="presentation drawingContainer">
            <div className="presentation username rightalign">
                {props.drawingPrompt.creator.nickname}
            </div>
            <div className="presentation drawingDownloadContainer">
                <img
                    className="presentation drawing"
                    alt={`Drawing from ${props.drawingPrompt.creator.nickname}`}
                    src={`data:image/png; base64, ${props.drawingPrompt.encodedImage.replaceAll("\"", "")}`}
                >
                </img>
                <button
                    className="presentation download"
                    onClick={() => downloadImage(props.drawingPrompt.encodedImage.replaceAll("\"", ""), `SKETCHY_PHONE_${props.drawingPrompt.creator.nickname + props.drawingPrompt.drawingId}`)}
                ></button>
            </div>
            <span>
                <button
                    className={`presentation voting ${getVotingButtonState()}`}
                    onClick={() => props.doVote(props.drawingPrompt, props.drawingPrompt.creator)}
                >
                    {`${props.drawingPrompt.hasVoted ? "Upvoted!" : "Upvote"}`}
                </button>
            </span>


        </div>
    )
}

PresentationDrawing.propTypes = {
    drawingPrompt: PropTypes.object,
    doVote: PropTypes.func,
    ownsDrawing: PropTypes.bool
}

export default PresentationDrawing;