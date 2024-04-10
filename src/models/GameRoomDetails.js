/**
 * Game Room model
 */

class GameRoomDetails {
    constructor(data = {}) {
        this.admin = null;
        this.gameId = null;
        this.gamePin = null;
        this.gameToken = null;
        this.status = null;
        Object.assign(this, data);
    }
}

export default GameRoomDetails;