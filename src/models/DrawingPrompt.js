/**
 * Drawing prompt model
 */

class DrawingPrompt {
    constructor(data = {}) {
        this.drawingId = null;
        this.creator = null;
        this.encodedImage = null;
        this.creationDateTime = null;
        this.previousTextPromptId = null;
        this.nextTextPromptId = null;
        this.gameSessionId = null;
        this.assignedTo = null;
        this.round = null;
        this.numVotes = null;

        // This field is for internal use only
        this.hasVoted = false;
        Object.assign(this, data);
    }
}

export default DrawingPrompt;