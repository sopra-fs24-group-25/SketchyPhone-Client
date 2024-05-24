import { React, useState } from "react";
import PropTypes from "prop-types";
import UserPreview from "./UserPreview";
import BaseContainer from "components/ui/BaseContainer";
import "../../styles/ui/Leaderboard.scss";
import { Button } from "./Button";
import AudioContextEnum from "../../helpers/audioContextEnum";
import AudioPlayer from "../../helpers/AudioPlayer";

const LeaderboardType = {
    TEXTPROMPT: "TEXTPROMPT",
    DRAWING: "DRAWING"
}

const IndexToRank = {
    1: "1st",
    2: "2nd",
    3: "3rd",
}

// dont want this to change on reloads
let leaderboardSoundPlayed = false;


const Leaderboard = ({ topThreeDrawings, topThreeTextPrompts, onClickNextRound, onClickBackToLobby, onExitGame, user, lowPlayerCount }) => {

    const leaderboardReveal = new AudioPlayer(AudioContextEnum.LEADERBOARD);

    const drawingReveal = new AudioPlayer(AudioContextEnum.LEADERBOARD_DRAWING);
    const textReveal = new AudioPlayer(AudioContextEnum.LEADERBOARD_TEXT);
    textReveal.setVolume(0.15);


    const [leaderboardType, setLeaderboardType] = useState<string>(LeaderboardType.TEXTPROMPT);

    const separator = () => (
        <hr className="leaderboard separator"
            style={{
                background: "black",
                color: "black",
                borderColor: "black",
                height: "2px",
                width: "90%"
            }}
        />
    )

    const leaderboardButtons = (showSwitchButton = true) => {

        return (
            <div className="leaderboard buttonsContainer">
                {showSwitchButton &&
                    <Button width="20%"
                        onClick={() => setLeaderboardType(leaderboardType === LeaderboardType.DRAWING ? LeaderboardType.TEXTPROMPT : LeaderboardType.DRAWING)}>
                        {`Show ${leaderboardType === LeaderboardType.DRAWING ? "PROMPTS" : "DRAWINGS"}`}
                    </Button>
                }
                {/* Only for admin */}
                {user?.role === "admin" && !lowPlayerCount &&
                    <Button width="20%"
                        onClick={() => onClickNextRound()}>
                        New round
                    </Button>
                }
                {user?.role === "admin" &&
                    <Button width="20%"
                        onClick={() => onClickBackToLobby()}>
                        Lobby
                    </Button>
                }
                <Button width="20%"
                    onClick={() => onExitGame()}>
                    Exit game
                </Button>
            </div>)
    }

    function leaderboardTextPromptElement(element, idx) {
        return (
            <div key={`${element.textPromptId}` + `_${element.creator.userId}` + `_${element.content}`} className="leaderboard elementcontainer">
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

        const downloadImage = (ImageBase64, fileName) => {
            const imgDL = document.createElement("a");
            imgDL.href = "data:image/png;base64," + ImageBase64;
            imgDL.download = fileName;
            imgDL.click();
        }

        return (
            <div key={`${element.drawingId}` + `_${element.creator.userId}`} className="leaderboard elementcontainer">
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
                        src={`data:image/png; base64, ${element.encodedImage?.replaceAll("\"", "")}`}
                    ></img>
                    <button
                        className="leaderboard download"
                        onClick={() => downloadImage(element.encodedImage.replaceAll("\"", ""), `SKETCHY_PHONE_${element.creator.nickname + element.drawingId}`)}
                    ></button>
                </div>
                <p>
                    #Votes: {element.numVotes}
                </p>
            </div>)
    }

    function showTopThree() {
        if (topThreeDrawings === null && topThreeTextPrompts === null) {
            return (<div>
                <p className="leaderboard no-votes">Nothing has been voted on!</p>
                {leaderboardButtons(false)}
            </div>)
        }

        if (leaderboardType === LeaderboardType.TEXTPROMPT) {
            // play sound if first time showing leaderboard
            if (!leaderboardSoundPlayed) {
                console.log("playing")
                leaderboardReveal.handlePlay();
                leaderboardSoundPlayed = true;
            }
            else {
                textReveal.handlePlay();
            }


            let textPromptLeaderboardContent;

            if (topThreeTextPrompts === null) {
                textPromptLeaderboardContent = <p className="leaderboard no-votes">No votes have been cast for text prompts!</p>
            }
            else {
                textPromptLeaderboardContent = topThreeTextPrompts.map((element, idx) => {
                    return leaderboardTextPromptElement(element, idx);
                })
            }

            return (
                <div className="leaderboard container">
                    {textPromptLeaderboardContent}
                    {separator()}
                    {leaderboardButtons()}
                </div >
            )
        }
        else if (leaderboardType === LeaderboardType.DRAWING) {
            // play sound
            drawingReveal.handlePlay();

            let drawingLeaderboardContent;

            if (topThreeDrawings === null) {
                drawingLeaderboardContent = <p className="leaderboard no-votes">No votes have been cast for drawings!</p>
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
        <BaseContainer style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            {showTopThree()}
        </BaseContainer>
    )
}

Leaderboard.propTypes = {
    topThreeDrawings: PropTypes.array,
    topThreeTextPrompts: PropTypes.array,
    onClickNextRound: PropTypes.func,
    onClickBackToLobby: PropTypes.func,
    onExitGame: PropTypes.func,
    user: PropTypes.object,
    lowPlayerCount: PropTypes.bool
}

export default Leaderboard;