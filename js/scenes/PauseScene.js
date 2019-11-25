export default class PauseScene extends Phaser.Scene {
    constructor() {
        super({
            key: 'pause',
            active: true
        });
    }

    create() {
        let isPaused = false;
        let level = this.scene.get('easyLevel');

        level.events.on('paused', () => { // event listener for custom 'paused' event
            level.scene.pause();
            isPaused = true;
        }, this);

        this.input.on('pointerdown', () => {
            if (isPaused) {
                level.scene.restart();
                isPaused = false;
            }
        }, this);
    }
}