import scribble from "../audio/scribble.mp3";
import upvote from "../audio/upvote.mp3";
import analogRing from "../audio/analogRing.mp3";
import clickPop from "../audio/clickPop.mp3";
import downvote from "../audio/downvote.mp3";
import clap from "../audio/clap.mp3";
import woohoo from "../audio/woohoo.mp3";
import yay from "../audio/yay.mp3"

const AudioContextEnum = {
    PRESENTATION_REVEAL_DRAWING: { repr: "PRESENTATION_REVEAL_DRAWING", url: scribble },
    UPVOTE: { repr: "UPVOTE", url: upvote },
    DOWNVOTE: { repr: "DOWNVOTE", url: downvote },
    BUTTON_STANDARD: { repr: "BUTTON_STANDARD", url: "" },
    BUTTON_POP: { repr: "BUTTON_POP", url: clickPop },
    TIMER: { repr: "TIMER", url: analogRing },
    LEADERBOARD: {repr: "LEADERBOARD", url: clap},
    LEADERBOARD_DRAWING: {repr: "LEADERBOARD_DRAWING", url: woohoo},
    LEADERBOARD_TEXT: {repr: "LEADERBOARD_TEXT", url: yay}

}

export default AudioContextEnum;