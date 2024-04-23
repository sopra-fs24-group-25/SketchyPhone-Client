/**
 * Game Room model
 */

class GameRoom {
    constructor(data = {}) {
        this.id = null;
        this.name = null;
        this.creationDateTime = null;
        this.users = null;
        this.link = null;
        this.token = null;
        this.status = null;
        this.admin = null;
        Object.assign(this, data);
    }
}

export default GameRoom;