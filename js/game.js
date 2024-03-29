import PreloadScene from './scenes/PreloadScene.js';
import PauseScene from './scenes/PauseScene.js';
import EasyLevelScene from './scenes/EasyLevelScene.js';

/*
 * =======================================================
 * CONFIG
 * =======================================================
 */
let config = {
    type: Phaser.AUTO,
    width: 900,
    height: 600,
    backgroundColor: '#5FA1DA',
    parent: 'game',
    scene: [PreloadScene, PauseScene, EasyLevelScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 750
            },
            debug: false
        }
    },
    audio: {
        disableWebAudio: true // Enable HTML5 audio
    }
};

let game = new Phaser.Game(config);