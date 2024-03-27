/**
 * Game Room model
 */

class GameRoomDetails {
    constructor(data = {}) {
        this.name = null;
        this.admin = null;
        Object.assign(this, data);
    }
}

export default GameRoomDetails;