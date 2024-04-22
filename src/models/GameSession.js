/**
 * Game Session Model
 */
class GameSession {
    constructor(data = {}) {
        this.status = null;
        this.gameSessionId = null;
        this.token = null;
        this.usersInSession = null;
        this.roundCounter = null;
        Object.assign(this, data);
    }
}

export default GameSession;
