import React from "react";
import PropTypes from "prop-types";
import "styles/ui/PresentationContainer.scss";
import { Button } from "./Button";
import { saveAs } from "file-saver";

const PresentationDrawing = (props) => {

    let FileSaver = require("file-saver");

    const downloadImage = (ImageBase64, fileName) => {
        const imgDL = document.createElement("a") as HTMLAnchorElement;
        imgDL.href = "data:image/png;base64," + ImageBase64;
        imgDL.download = fileName;
        imgDL.click();
    }


    return (
        <div className="presentation drawingContainer">
            <div className="presentation username rightalign">
                {props.drawingPrompt.creator.nickname}
            </div>
            <img
                className="presentation drawing"
                alt={`Drawing from ${props.drawingPrompt.creator.nickname}`}
                src={`data:image/png; base64, ${props.drawingPrompt.encodedImage.replaceAll("\"", "")}`}
                onClick={() => downloadImage(props.drawingPrompt.encodedImage.replaceAll("\"", ""), `SKETCHY_PHONE_${props.drawingPrompt.creator.nickname + props.drawingPrompt.drawingId}`)}
            >

            </img>
            <div className = "presentation download"
            >
            </div>
            <span>
                {!props.ownsDrawing &&
                    <button
                        className={`presentation voting ${props.drawingPrompt.hasVoted ? "selected" : ""}`}
                        onClick={() => props.doVote(props.drawingPrompt, props.drawingPrompt.creator)}
                    >
                        {`${props.drawingPrompt.hasVoted ? "Upvoted" : "Upvote"}`}
                    </button>
                }
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