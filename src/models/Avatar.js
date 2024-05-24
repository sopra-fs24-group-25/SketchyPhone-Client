/**
 * Avatar model
 */
class Avatar {
    constructor(data = {}) {
        this.avatarId = null;
        this.encodedImage = null;
        this.creatorId = null;
        this.creationDateTime = null;

        this.selected = "inactive"; //missing in UML, maybe only important for client side
        Object.assign(this, data);
    }
}

export default Avatar;
