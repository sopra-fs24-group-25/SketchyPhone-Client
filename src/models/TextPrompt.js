/**
 * Text prompt model
 */

class TextPrompt {
    constructor(data = {}) {
        this.creator = null;
        this.gameSession = null;
        this.content = null;
        this.assignedTo = null;
        this.previousDrawingId = null;
        this.nextDrawingId = null;
        this.round = null;
        Object.assign(this, data);
    }
}

export default TextPrompt;