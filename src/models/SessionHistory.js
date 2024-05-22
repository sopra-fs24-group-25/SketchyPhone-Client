/**
 * Text prompt model
 */

class SessionHistory {
    constructor(data = {}) {
        this.historyId = null;
        this.userId = null;
        this.gameSessionId = null;
        this.historyName = null;
        Object.assign(this, data);
    }
}

export default SessionHistory;