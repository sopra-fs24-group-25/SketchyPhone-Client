/**
 * User model
 */
class User {
    constructor(data = {}) {
        this.textPrompts = null;
        this.userId = null;
        this.nickname = null;
        this.creationDateTime = null;
        this.status = null;
        this.persistent = false;
        this.email = null;
        this.password = null;
        this.avatarId = null;
        this.role = null; 
        this.token = null; 
        this.gameRoom = null;
        Object.assign(this, data);
    }
}

export default User;
