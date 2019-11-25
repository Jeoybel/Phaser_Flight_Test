export default class EasyLevelScene extends Phaser.Scene {
    constructor() {
        super('easyLevel');
    }

    /*
     * =======================================================
     * INITIALIZATION
     * =======================================================
     */
    init() {
        // LEVEL SIZE
        this.LEVEL_SIZE = 0.3; // smaller number is bigger press 'M' to see entire level. (0, 0) at bottom left

        // CAMERA SIZE
        this.MAIN_ZOOM = 0.8; // camera size that follows player

        // LEVEL POSITION CONSTANTS
        this.LEVEL_WIDTH = this.sys.scale.width / this.LEVEL_SIZE; // right most x value
        this.LEVEL_HEIGHT = this.sys.scale.height / this.LEVEL_SIZE; // top most y value
        this.LEVEL_CENTER_WIDTH = this.LEVEL_WIDTH / 2; // horizontal center
        this.LEVEL_CENTER_HEIGHT = this.LEVEL_HEIGHT / 2; // vertical center

        // STARTING PLAYER POSITION
        this.PLAYER_START_X = 0;
        this.PLAYER_START_Y = -(this.LEVEL_CENTER_HEIGHT);

        // VOLUME
        this.MAX_VOLUME = 0.4; // Between 0-1
    }

    /*
     * =======================================================
     * CREATE
     * =======================================================
     */
    create() {
        // ADD BACKGROUND
        this.background = this.add.tileSprite(-600, 600, this.LEVEL_WIDTH + 1200, this.LEVEL_HEIGHT + 1200, 'background').setOrigin(0, 1);
        this.clouds1 = this.add.tileSprite(-600, 500, this.LEVEL_WIDTH + 1200, 2048, 'clouds1').setOrigin(0, 1);
        this.clouds2 = this.add.tileSprite(-600, 500, this.LEVEL_WIDTH + 1200, 2048, 'clouds2').setOrigin(0, 1);
        this.clouds3 = this.add.tileSprite(-600, 500, this.LEVEL_WIDTH + 1200, 2048, 'clouds3').setOrigin(0, 1);

        // ADD PLAYER W/ ANIMATIONS
        this.player = this.physics.add.sprite(this.PLAYER_START_X, this.PLAYER_START_Y, 'player');
        this.anims.create({
            key: 'player_stand',
            frames: [{
                key: 'player',
                frame: 0
            }]
        });
        this.anims.create({
            key: 'player_walk',
            frames: this.anims.generateFrameNumbers('player', {
                start: 1,
                end: 9
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'player_jump',
            frames: this.anims.generateFrameNumbers('player', {
                start: 12,
                end: 13
            }),
            frameRate: 10,
            repeat: 0
        });
        this.anims.create({
            key: 'player_rise',
            frames: this.anims.generateFrameNumbers('player', {
                start: 14,
                end: 19
            }),
            frameRate: 10,
            repeat: -1
        });
        this.anims.create({
            key: 'player_fall',
            frames: this.anims.generateFrameNumbers('player', {
                start: 20,
                end: 29
            }),
            frameRate: 10,
            repeat: -1
        });

        // PLAYER SETTINGS
        this.player.body.setSize(20, 25); // shrink hit box
        this.player.setScale(3); // 3 times bigger
        this.player.setVelocityX(50); // constant horizontal velocity
        this.player.anims.play('player_rise');

        // PHYSICS SETTINGS
        this.physics.pause();
        this.isPaused = true;
        this.wasMovingUp;
        this.wasMovingDown;

        // INPUT SETTINGS
        this.mKey = this.input.keyboard.addKey('M');
        this.mKey.on('down', this.switchCamera, this); // M key - switch camera between main and overview
        this.space = this.input.keyboard.addKey('space');
        this.space.on('down', this.playerJump, this); // Spacebar - play animation, sound, and unpause
        this.pointer = this.input.activePointer;
        this.input.on('pointerdown', this.playerJump, this); // Click or touch - play animation, sound, and unpause

        //===== TEMP INPUT FOR TESTING
        this.pKey = this.input.keyboard.addKey('P');
        this.pKey.on('down', this.levelComplete, this);

        // CAMERA SETTINGS
        //===== MAIN
        this.cameras.main.startFollow(this.player); // follow player with camera
        this.cameras.main.setZoom(this.MAIN_ZOOM);

        //===== OVERVIEW
        this.overview = this.cameras.add();
        this.overview.setZoom(this.LEVEL_SIZE);
        this.overview.setBounds(0, -this.LEVEL_HEIGHT, 0, 0); // set camera left corner to (0, 0)
        this.overview.setVisible(false);

        // GRAPHICS SETTINGS
        //===== START DRAWING LINE
        this.newLine();

        //===== PARTICLE/EMITTER SETTINGS
        this.particles = this.add.particles('particle');
        this.emitter = this.particles.createEmitter({
            lifespan: {
                min: 0,
                max: 280,
                step: 6
            },
            speed: {
                min: 200,
                max: 400
            },
            angle: 98,
            gravityY: 300,
            scale: {
                start: 7,
                end: 0.5
            },
            blendMode: 'ADD', // make glow
            //visible: false,
            alpha: 0.18 // transparent
        });
        this.emitter.startFollow(this.player, 0, 10);

        //===== DEPTH
        this.particles.setDepth(1);
        this.player.setDepth(4); // set player above other elements
        this.clouds2.setDepth(2);
        this.clouds3.setDepth(5);

        // AUDIO SETTINGS
        this.booster = this.sound.add('booster');
        this.booster.loop = true;
        this.booster.setVolume(0);
        this.booster.play();
    }

    /*
     * =======================================================
     * UPDATE
     * =======================================================
     */
    update() {
        // MOVING BACKGROUND
        this.background.tilePositionX -= 0.1;
        this.clouds1.tilePositionX += 0.1;
        this.clouds2.tilePositionX += 0.3;
        this.clouds3.tilePositionX += 0.8;

        // CONTROLS
        if (this.player.y > 0) { // don't let player fall below y-coordinate: 0. Aritificial floor.
            this.playerJump();
            this.player.setVelocityY(Phaser.Math.Between(-300, -400) / (this.LEVEL_SIZE * 3)); // scale speed by size of level
        } else if ((this.pointer.isDown || this.space.isDown) && (this.player.y > -(this.LEVEL_HEIGHT) + 150)) { // don't let player jump slightly below LEVEL_HEIGHT. Artificial ceiling
            this.player.setVelocityY(Phaser.Math.Between(-300, -400) / (this.LEVEL_SIZE * 3));
        }

        // MOVING UP
        if (this.player.body.velocity.y <= 0) {
            this.drawLine(); // draw line to player. Previous line is erased before another is drawn.

            // IF PREVIOUSLY MOVING DOWN (Runs once per direction change)
            if (this.wasMovingDown) {
                this.wasMovingDown = false;
                this.newLine(); // new line position
            }
            this.wasMovingUp = true;
        }
        // MOVING DOWN
        else if (this.player.body.velocity.y > 0) {
            this.drawLine(); // draw line to player

            // IF PREVIOUSLY MOVING UP
            if (this.wasMovingUp) {
                this.wasMovingUp = false;
                this.newLine(); // new line position
                this.player.anims.delayedPlay(200, 'player_fall'); // start player falling animation
                this.fadeAudio(this.booster, 0, 300); // fade booster audio to 0
                this.emitter.stop(); // stop booster emitter
            }
            this.wasMovingDown = true;
        }

        // WIN CONDITION (TEMP)
        if (!this.playerWon && (this.player.x > this.LEVEL_WIDTH + 30)) {
            this.playerWon = true;
            this.levelComplete();
        }
    }

    // PLAYER JUMP
    playerJump() {
        // PLAY ANIMATION JUMP
        if (this.player.anims.getCurrentKey() !== 'player_jump' &&
            this.player.anims.getCurrentKey() !== 'player_rise') {
            this.player.anims.play('player_jump');
            this.player.anims.chain('player_rise');
        }

        // START BOOSTER EMITTER
        this.emitter.start();

        // PLAY BOOSTER SOUND
        this.booster.setVolume(0);
        this.booster.play();
        this.fadeAudio(this.booster, this.MAX_VOLUME, 300);

        // UNPAUSE GAME IF PAUSED
        if (this.isPaused) {
            this.isPaused = false;
            this.physics.resume();
        }
    }

    // LEVEL COMPLETE
    levelComplete() {
        this.physics.pause();
        this.fadeAudio(this.booster, 0, 300);
        this.switchCamera();
        this.tweens.add({
            targets: [this.clouds1, this.clouds2, this.clouds3],
            alpha: {
                from: 1,
                to: 0
            },
            ease: 'Linear',
            duration: 1000,
            onComplete: () => {
                this.events.emit('paused');
            }
        });
    }

    // SWITCH CAMERA
    switchCamera() {
        if (this.cameras.main.visible === true) {
            this.overview.visible = true;
            this.cameras.main.visible = false;
        } else {
            this.overview.visible = false;
            this.cameras.main.visible = true;
        }
    }

    // FADE AUDIO
    fadeAudio(target, to, duration) {
        this.tweens.add({
            targets: target,
            volume: {
                from: target.volume,
                to: to
            },
            ease: 'Linear',
            duration: duration,
        });
    }

    // DRAW LINE
    drawLine() {
        this.graphics.clear(); // clear previous line
        this.graphics.lineStyle(8, '0xffffff', 1); // line style (line width, color, alpha)
        this.graphics.beginPath(); // start path
        this.graphics.moveTo(this.startX, this.startY); // move starting point of path
        this.graphics.lineTo(this.player.x, this.player.y); // make line to another point
        this.graphics.closePath(); // finish path
        this.graphics.strokePath(); // draw line on path
    }

    // PREPARE NEW LINE
    newLine() {
        this.startX = this.player.x; // get player x pos
        this.startY = this.player.y; // get player y pos
        this.graphics = this.add.graphics(); // create new graphics object for new line
        this.graphics.setDepth(3);
    }
}