import scribble from "../audio/scribble.mp3";
import upvote from "../audio/upvote.mp3";
import analogRing from "../audio/analogRing.mp3";
import clickPop from "../audio/clickPop.mp3";
import downvote from "../audio/downvote.mp3";

const AudioContextEnum = {
    PRESENTATION_REVEAL_DRAWING: { repr: "PRESENTATION_REVEAL_DRAWING", url: scribble },
    UPVOTE: { repr: "UPVOTE", url: upvote },
    DOWNVOTE: { repr: "DOWNVOTE", url: downvote },
    BUTTON_STANDARD: { repr: "BUTTON_STANDARD", url: "" },
    BUTTON_POP: { repr: "BUTTON_POP", url: clickPop },
    TIMER: { repr: "TIMER", url: analogRing }
}

export default AudioContextEnum;