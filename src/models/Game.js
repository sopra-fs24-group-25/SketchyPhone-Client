/**
 * Game Model
 */

class Game {
    constructor(data = {}){
        this.gameSessions = null;
        this.gameId = null;
        this.gameCreationDate = null;
        this.gameToken = null;
        this.status = null;
        this.users = null;
        this.admin = null;
        this.gameSettingsId = null;
    }
}

export default Game;