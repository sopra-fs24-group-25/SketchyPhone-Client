/**
 * Avatar model
 */
class Avatar {
    constructor(data = {}) {
        this.id = null;
        this.encodedImage = null;
        this.creator = null;
        this.creationDateTime = null;
        this.selected = "inactive";
        Object.assign(this, data);
    }
}

export default Avatar;
