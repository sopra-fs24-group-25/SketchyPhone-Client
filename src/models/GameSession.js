/**
 * Game Session Model
 */
import Game from "./Game"

class GameSession extends Game {
    constructor(data = {}) {
        super(data);
        this.textPrompts = null;
        this.gameSessionId = null;
        this.creationDate = null;
        this.token = null;
        this.status = null;
        this.usersInSession = null;
        this.roundCounter = null;
        Object.assign(this, data);
    }
}

export default GameSession;
