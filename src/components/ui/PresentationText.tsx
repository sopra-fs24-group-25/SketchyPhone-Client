import React from "react";
import PropTypes from "prop-types";
import "styles/ui/PresentationContainer.scss";

const PresentationText = (props) => {
    console.log(props.ownsDrawing);
    console.log(props.textPrompt.creator.userId);

    return (
        <div className="presentation textContainer">
            <div className="presentation username leftalign">
                {props.textPrompt.creator.nickname}
            </div>
            <div className="presentation text">
                {props.textPrompt.content}
            </div>
            {props.ownsDrawing &&
                <button
                    className={`presentation voting ${props.textPrompt.hasVoted ? "selected" : ""}`}
                    onClick={() => props.doVote(props.textPrompt, props.textPrompt.creator)}
                >
                    {`${props.textPrompt.hasVoted ? "Upvoted!" : "Upvote"}`}
                </button>
            }

        </div>
    )
}

PresentationText.propTypes = {
    textPrompt: PropTypes.object,
    doVote: PropTypes.func,
    ownsDrawing: PropTypes.boolean
}

export default PresentationText;