import AudioContextEnum from "./audioContextEnum";
import React from "react";

export default class AudioPlayer{
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
        try {
            if(this.isPlaying){
                this.audio.pause();
            }
            else{
                this.audio.play();
            }
            this.isPlaying = !this.isPlaying;
        } catch (error) {
            console.log(`Error while playing audio with url: ${this.url} `);
        }
    }

    handlePause() {
        try {
            this.audio.pause();
        } catch (error) {
            console.log(`Error while pausing audio with url: ${this.url} `);
        }
    }

    handleAudioContextChange(newAudioContext) {
        try {
            this.audio.src  = AudioContextEnum[newAudioContext].url;
        } catch (error) {
            console.log(`Error while changing AudioContext with url: ${this.url} `);
        }
    }
}