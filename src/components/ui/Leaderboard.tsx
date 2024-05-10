import { React, useState } from "react";
import PropTypes from "prop-types";
import UserPreview from "./UserPreview";
import "../../styles/ui/Leaderboard.scss";
import { Button } from "./Button";

const LeaderboardType = {
    TEXTPROMPT: "TEXTPROMPT",
    DRAWING: "DRAWING"
}

const IndexToRank = {
    1: "1st",
    2: "2nd",
    3: "3rd",
}

const Leaderboard = ({ topThreeDrawings, topThreeTextPrompts }) => {
    
    const [leaderboardType, setLeaderboardType] = useState<string>(LeaderboardType.TEXTPROMPT);


    function leaderboardTextPromptElement(element, idx) {
        return (
            <div key={`${element.textPromptId}` + `${element.creator.userId}`} className="leaderboard elementcontainer">
                <div className="leaderboard user">
                    <span style={{ fontSize: "x-large" }}>{IndexToRank[idx + 1][0]}<sup>{IndexToRank[idx + 1].slice(1, 4)}</sup></span>
                    <UserPreview
                        id={element.creator.avatarId}
                    ></UserPreview>
                    <span>{element.creator.nickname}</span>
                    <span style={{ color: "gold" }}>{idx + 1 === 1 ? "THE BEST PROMPT WRITER EVER!!!!!" : ""}</span>
                </div>
                <div className="leaderboard textprompt">
                    {element.content}
                </div>
            </div>)
    }

    function leaderboardDrawingElement(element, idx) {
        return (
            <div key={`${element.textPromptId}` + `${element.creator.userId}`} className="leaderboard elementcontainer">
                <div className="leaderboard user">
                    <span style={{ fontSize: "x-large" }}>{IndexToRank[idx + 1][0]}<sup>{IndexToRank[idx + 1].slice(1, 4)}</sup></span>
                    <UserPreview
                        id={element.creator.avatarId}
                    ></UserPreview>
                    <span>{element.creator.nickname}</span>
                    <span style={{ color: "gold" }}>{idx + 1 === 1 ? "THE BEST ARTIST EVER!!!!!" : ""}</span>
                </div>
                <div className="leaderboard drawing">
                    <img
                        className="presentation drawing"
                        alt={`Drawing from ${element.creator.nickname}`}
                        src={`data:image/png; base64, ${element.encodedImage.replaceAll("\"", "")}`}
                    ></img>
                </div>
            </div>)
    }

    function showTopThree() {
        if (topThreeDrawings === null && topThreeTextPrompts === null) {
            return (<div>
                <p className="leaderboard textprompt">Nothing has been voted on!</p>

                {/* TODO add buttons for new round etc. */}
            </div>)
        }

        if (leaderboardType === LeaderboardType.TEXTPROMPT) {
            return (
                <div className="leaderboard" >
                    {
                        topThreeTextPrompts.map((element, idx) => {
                            return leaderboardTextPromptElement(element, idx);
                        })
                    }

                    <Button width="20%"
                        onClick={() => setLeaderboardType(LeaderboardType.DRAWING)}>
                        SWITCH TO DRAWINGS
                    </Button>
                </div >
            )
        }
        else {
            return (
                <div className="leaderboard">
                    {
                        topThreeDrawings.map((element, idx) => {
                            return leaderboardDrawingElement(element, idx);
                        })
                    }
                    <Button width="20%"
                        onClick={() => setLeaderboardType(LeaderboardType.TEXTPROMPT)}>
                        SWITCH TO TEXT PROMPTS
                    </Button>
                </div>
            )
        }
    }

    return (
        showTopThree()
    )
}

Leaderboard.propTypes = {
    topThreeDrawings: PropTypes.array,
    topThreeTextPrompts: PropTypes.array
}

export default Leaderboard;