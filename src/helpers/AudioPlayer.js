import AudioContextEnum from "./audioContextEnum";

export default class AudioPlayer {
    constructor(AudioContextInput) {
        // ctx to use
        this.ctx = AudioContextInput;

        // Fetch url
        this.url = AudioContextEnum[this.ctx.repr].url;

        // Audio to use
        this.audio = new Audio(this.url);
        this.audio.volume = 0.3;

        this.isPlaying = false;
    }

    handlePlay() {
        if (this.isPlaying) {
            this.audio.pause();
            this.isPlaying = false;
        } else {
            this.audio.play().then(() => {
                this.isPlaying = true;
            }).catch(error => {
                console.log(`Error while playing audio with url: ${this.url} `, error);
            });
        }
    }

    handlePause() {
        try {
            this.audio.pause();
            this.isPlaying = false;
        } catch (error) {
            console.log(`Error while pausing audio with url: ${this.url} `, error);
        }
    }

    handleAudioContextChange(newAudioContext) {
        try {
            this.audio.src = AudioContextEnum[newAudioContext].url;
        } catch (error) {
            console.log(`Error while changing AudioContext with url: ${this.url} `, error);
        }
    }
}
