/**
 * User model
 */
class User {
    constructor(data = {}) {
        this.id = null;
        this.name = null;
        this.token = null;
        this.status = null;
        this.isAdmin = null;
        Object.assign(this, data);
    }
}

export default User;
