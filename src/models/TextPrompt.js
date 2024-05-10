/**
 * Text prompt model
 */

class TextPrompt {
    constructor(data = {}) {
        this.textPromptId = null;
        this.creator = null;
        this.gameSession = null;
        this.content = null;
        this.assignedTo = null;
        this.previousDrawingId = null;
        this.nextDrawingId = null;
        this.round = null;
        this.votes = null;

        // This field is for internal use only
        this.hasVoted = false;
        Object.assign(this, data);
    }
}

export default TextPrompt;