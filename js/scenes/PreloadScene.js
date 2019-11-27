export default class PreloadScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'preload',
            active: true
        });
    }

    /*
     * =======================================================
     * PRELOAD
     * =======================================================
     */
    preload() {
        // BACKGROUND
        this.load.image('background', '../../assets/background/night_sky.png');
        this.load.image('clouds1', '../../assets/background/clouds_1.png')
        this.load.image('clouds2', '../../assets/background/clouds_2.png')
        this.load.image('clouds3', '../../assets/background/clouds_3.png')

        // PLAYER
        this.load.spritesheet('player', '../../assets/player/player.png', {
            frameWidth: 75,
            frameHeight: 90
        });
        this.load.image('particle', '../../assets/player/green_particle.png');
        this.load.spritesheet('ring', '../../assets/ring.png', {
            frameWidth: 86,
            frameHeight: 256
        })
        this.load.audio('booster', ['../../assets/audio/booster.mp3',
            '../../assets/audio/booster.ogg'
        ]);
    }

    /*
     * =======================================================
     * CREATE
     * =======================================================
     */
    create() {
        console.log("Loading complete!");
        this.scene.start('easyLevel');
    }
}