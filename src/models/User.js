/**
 * User model
 */
class User {
    constructor(data = {}) {
        this.id = null;
        this.name = null;
        this.creationDateTime = null;
        this.loggedIn = null; //should be status instead
        this.persistent = null;
        this.email = null; //probably should be username instead
        this.password = null;
        this.avatar = null;
        this.role = null; //should be isAdmin instead

        //missing in UML
        this.username = null; //should replace email
        this.token = null; //missing completely in UML
        this.status = null; //should replace loggedIn
        this.isAdmin = null; //should replace role
        Object.assign(this, data);
    }
}

export default User;
