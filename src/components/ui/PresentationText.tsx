import React from "react";
import PropTypes from "prop-types";
import "styles/ui/PresentationContainer.scss";

const PresentationText = (props) => {

    function getVotingButtonState() {
        if (props.ownsDrawing) {
            return "hidden";
        }
        
        return props.textPrompt.hasVoted ? "selected" : "";
    }

    return (
        <div className="presentation textContainer">
            <div className="presentation username leftalign">
                {props.textPrompt.creator.nickname}
            </div>
            <div className="presentation text">
                {props.textPrompt.content}
            </div>
            <button
                className={`presentation voting ${getVotingButtonState()}`}
                onClick={() => props.doVote(props.textPrompt, props.textPrompt.creator)}
            >
                {`${props.textPrompt.hasVoted ? "Upvoted!" : "Upvote"}`}
            </button>
        </div>
    )
}

PresentationText.propTypes = {
    textPrompt: PropTypes.object,
    doVote: PropTypes.func,
    ownsDrawing: PropTypes.bool
}

export default PresentationText;