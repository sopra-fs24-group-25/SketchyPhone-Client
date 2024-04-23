/**
 * Game Settings model
 */

class GameSettings {
    constructor(data = {}) {
        this.gameSettingsId = null;
        this.gameSpeed = null;
        this.numCycles = null;
        this.enableTextToSpeech = null;
        Object.assign(this, data);
    }
}

export default GameSettings;