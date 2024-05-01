import React from "react";
import PropTypes from "prop-types";
import "styles/ui/PresentationContainer.scss";

const PresentationText = (props) => {
    return (
        <div className = "presentation textContainer">
            <div className="presentation username leftalign">
                {props.textPrompt.creator.nickname}
            </div>
            <div className = "presentation text">
                {props.textPrompt.content}
            </div>
            <div
                className={`presentation voting ${props.textPrompt.votes > 0 ? "selected" : ""}`}
                onClick={() => props.doVote(props.textPrompt, props.textPrompt.creator)}
            >
                {`Upvote ${props.textPrompt.votes ? props.textPrompt.votes : ""}`}
            </div>
        </div>
    )
}

PresentationText.propTypes = {
    textPrompt: PropTypes.object,
    doVote: PropTypes.func
}

export default PresentationText;