import React from "react";
import PropTypes from "prop-types";
import "styles/ui/PresentationContainer.scss";

const PresentationDrawing = (props) => {
    return (
        <div className="presentation drawingContainer">
            <div className="presentation username rightalign">
                {props.drawingPrompt.creator.nickname}
            </div>
            <img
                className="presentation drawing"
                alt={`Drawing from ${props.drawingPrompt.creator.nickname}`}
                src={`data:image/png; base64, ${props.drawingPrompt.encodedImage.replaceAll("\"", "")}`}
            ></img>
            {props.ownsDrawing &&
                <button
                    className={`presentation voting ${props.drawingPrompt.hasVoted ? "selected" : ""}`}
                    onClick={() => props.doVote(props.drawingPrompt, props.drawingPrompt.creator)}
                >
                    {`${props.drawingPrompt.hasVoted ? "Upvoted" : "Upvote"}`}
                </button>
            }

        </div>
    )
}

PresentationDrawing.propTypes = {
    drawingPrompt: PropTypes.object,
    doVote: PropTypes.func,
    ownsDrawing: PropTypes.boolean
}

export default PresentationDrawing;