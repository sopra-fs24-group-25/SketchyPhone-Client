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

const Leaderboard = ({ topThreeDrawings, topThreeTextPrompts, onClickNextRound, onClickBackToLobby, onExitGame, user }) => {

    const [leaderboardType, setLeaderboardType] = useState<string>(LeaderboardType.TEXTPROMPT);

    const separator = () => (
        <div className="leaderboard separator">
            <hr className="leaderboard separator leftalign"
                style={{
                    background: "black",
                    color: "black",
                    borderColor: "black",
                    height: "2px",
                    width: "40%"
                }}
            />
            <p>{"DONE"}</p>
            <hr className="leaderboard separator rightalign"
                style={{
                    background: "black",
                    color: "black",
                    borderColor: "black",
                    height: "2px",
                    width: "40%"
                }}
            />
        </div>
    )

    const leaderboardButtons = () => {
        
        return (
            <div className="leaderboard buttonsContainer">
                <Button width="20%"
                    className="leaderboard button"
                    onClick={() => setLeaderboardType(leaderboardType === LeaderboardType.DRAWING ? LeaderboardType.TEXTPROMPT : LeaderboardType.DRAWING)}>
                    {`SWITCH TO ${leaderboardType === LeaderboardType.DRAWING ? "TEXTPROMPTS": "DRAWINGS"}`}
                </Button>
                {/* Only for admin */}
                {user?.role === "admin" &&
                    <Button width="20%"
                        className="leaderboard button"
                        onClick={() => onClickNextRound()}>
                        New Round
                    </Button>
                }
                {user?.role === "admin" &&
                    <Button width="20%"
                        className="leaderboard button"
                        onClick={() => onClickBackToLobby()}>
                        Back to Lobby
                    </Button>
                }
                <Button width="20%"
                    className="leaderboard button"
                    onClick={() => onExitGame()}>
                    Exit game
                </Button>
            </div>)
    }

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
                <p>
                    #Votes: {element.numVotes}
                </p>
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
                <p>
                    #Votes: {element.numVotes}
                </p>
            </div>)
    }

    function showTopThree() {
        if (topThreeDrawings === null && topThreeTextPrompts === null) {
            return (<div>
                <p className="leaderboard textprompt">Nothing has been voted on!</p>
                {leaderboardButtons()}
            </div>)
        }

        if (leaderboardType === LeaderboardType.TEXTPROMPT) {
            let textPromptLeaderboardContent;

            if (topThreeTextPrompts === null) {
                textPromptLeaderboardContent = <p>No votes have been cast for text prompts!</p>
            }
            else {
                textPromptLeaderboardContent = topThreeTextPrompts.map((element, idx) => {
                    return leaderboardTextPromptElement(element, idx);
                })
            }

            return (
                <div className="leaderboard container" >
                    {textPromptLeaderboardContent}
                    {separator()}
                    {leaderboardButtons()}
                </div >
            )
        }
        else if (leaderboardType === LeaderboardType.DRAWING) {
            let drawingLeaderboardContent;

            if (topThreeDrawings === null) {
                drawingLeaderboardContent = <p>No votes have been cast for drawings!</p>
            }
            else {
                drawingLeaderboardContent =
                    topThreeDrawings.map((element, idx) => {
                        return leaderboardDrawingElement(element, idx);
                    })

            }

            return (
                <div className="leaderboard container">
                    {drawingLeaderboardContent}

                    {separator()}
                    {leaderboardButtons()}
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
    topThreeTextPrompts: PropTypes.array,
    onClickNextRound: PropTypes.func,
    onClickBackToLobby: PropTypes.func,
    onExitGame: PropTypes.func,
    user: PropTypes.object
}

export default Leaderboard;