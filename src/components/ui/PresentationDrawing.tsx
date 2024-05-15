import React from "react";
import PropTypes from "prop-types";
import "styles/ui/PresentationContainer.scss";

const PresentationDrawing = (props) => {
    return (
        <div className="presentation drawingContainer">
            <div className = "presentation username rightalign">
                {props.drawingPrompt.creator.nickname}
            </div>
            <img
                className="presentation drawing"
                alt={`Drawing from ${props.drawingPrompt.creator.nickname}`}
                src={`data:image/png; base64, ${props.drawingPrompt.encodedImage.replaceAll("\"", "")}`}
            ></img>
            <button
                className={`presentation voting ${props.drawingPrompt.numVotes > 0 ? "selected" : ""}`}
                onClick={() => props.doVote(props.drawingPrompt, props.drawingPrompt.creator)}
            >
                {`Upvote ${props.drawingPrompt.numVotes ? props.drawingPrompt.numVotes : ""}`}
            </button>
        </div>
    )
}

PresentationDrawing.propTypes = {
    drawingPrompt: PropTypes.object,
    doVote: PropTypes.func
}

export default PresentationDrawing;