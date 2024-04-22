/**
 * Drawing prompt model
 */

class DrawingPrompt {
    constructor(data = {}) {
        this.drawingId = null;
        this.creatorId = null;
        this.encodedImage = null;
        this.creationDateTime = null;
        this.previousTextPromptId = null;
        this.nextTextPromptId = null;
        this.gameSessionId = null;
        this.assignedTo = null;
        this.round = null;
        Object.assign(this, data);
    }
}

export default DrawingPrompt;