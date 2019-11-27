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
        this.LEVEL_SIZE = 0.4; // smaller number is bigger press 'M' to see entire level. (0, 0) at bottom left

        // CAMERA SIZE
        this.MAIN_ZOOM = 0.6; // camera size that follows player

        // LEVEL POSITION CONSTANTS
        this.LEVEL_WIDTH = this.sys.scale.width / this.LEVEL_SIZE; // right most x value
        this.LEVEL_HEIGHT = this.sys.scale.height / this.LEVEL_SIZE; // top most y value
        this.LEVEL_CENTER_WIDTH = this.LEVEL_WIDTH / 2; // horizontal center
        this.LEVEL_CENTER_HEIGHT = this.LEVEL_HEIGHT / 2; // vertical center

        // STARTING PLAYER POSITION
        this.PLAYER_START_X = this.LEVEL_CENTER_WIDTH;
        this.PLAYER_START_Y = -(this.LEVEL_CENTER_HEIGHT);

        // VOLUME
        this.MAX_VOLUME = 0.4; // Between 0-1

        // GAMEPLAY
        //===== PLAYER VELOCITY
        this.PLAYER_VELOCITY = 0;
        //===== LINE VELOCITY
        this.LINE_SPEED = -0.4;
    }

    /*
     * =======================================================
     * CREATE
     * =======================================================
     */
    create() {
        // ADD BACKGROUND
        this.background = this.add.tileSprite(-600, 600, this.LEVEL_WIDTH + 1200, this.LEVEL_HEIGHT + 1200, 'background').setOrigin(0, 1);
        this.clouds1 = this.add.tileSprite(-600, 400, this.LEVEL_WIDTH + 1200, 2048, 'clouds1').setOrigin(0, 1);
        this.clouds2 = this.add.tileSprite(-600, 400, this.LEVEL_WIDTH + 1200, 2048, 'clouds2').setOrigin(0, 1);
        this.clouds3 = this.add.tileSprite(-600, 350, this.LEVEL_WIDTH + 1200, 2048, 'clouds3').setOrigin(0, 1);
        this.clouds4 = this.add.tileSprite(-600, -(this.LEVEL_HEIGHT) + 100, this.LEVEL_WIDTH + 1200, 2048, 'clouds1').setOrigin(0, 1);

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
        this.player.setVelocityX(this.PLAYER_VELOCITY); // constant horizontal velocity
        this.player.anims.play('player_rise');
        this.player.setAngle(8);

        // RING TEST (TEMPORARY)
        this.ring = this.add.sprite(this.LEVEL_CENTER_WIDTH + 100, -(this.LEVEL_CENTER_HEIGHT), 'ring');
        this.anims.create({
            key: 'ring_hover',
            frames: this.anims.generateFrameNumbers('ring'),
            frameRate: 20,
            repeat: -1
        });
        this.ring.anims.play('ring_hover');

        // PHYSICS SETTINGS
        this.physics.pause();
        this.physics.isPaused = true;
        this.wasMovingUp = false;
        this.wasMovingDown = true;

        // INPUT SETTINGS 
        if (!this.mKey) {
            this.mKey = this.input.keyboard.addKey('M');
            this.mKey.on('down', this.switchCamera, this); // M key - switch camera between main and overview
            this.space = this.input.keyboard.addKey('space');
            this.space.on('down', this.resumePhysics, this); // Spacebar - play animation, sound, and unpause
            this.pointer = this.input.activePointer;
            
            //===== TEMP INPUT FOR TESTING
            this.pKey = this.input.keyboard.addKey('P');
            this.pKey.on('down', this.levelComplete, this);
        }
        this.input.on('pointerdown', this.resumePhysics, this);

        
        // CAMERA SETTINGS
        //===== MAIN
        this.cameras.main.visible = true;
        this.cameras.main.startFollow(this.player); // follow player with camera
        this.cameras.main.setZoom(this.MAIN_ZOOM);

        //===== OVERVIEW
        this.overview = this.cameras.add();
        this.overview.setZoom(this.LEVEL_SIZE);
        this.overview.setBounds(0, -(this.LEVEL_HEIGHT), 0, 0); // set camera left corner to (0, 0)
        this.overview.setVisible(false);

        // GRAPHICS SETTINGS
        //===== START DRAWING LINE
        this.allLines = this.add.group();
        this.prepareNewLine();

        //===== PARTICLE/EMITTER SETTINGS
        this.particles = this.add.particles('particle');
        this.emitter = this.particles.createEmitter({
            follow: this.player,
            followOffset: {
                y: 10
            },
            lifespan: {
                min: 50,
                max: 250
            },
            speed: {
                min: 200,
                max: 400
            },
            scale: {
                start: 7,
                end: 0.5
            },
            angle: 108,
            blendMode: 'ADD', // make glow
            alpha: 0.18 // transparent
        });

        //===== DEPTH
        this.particles.setDepth(1);
        this.player.setDepth(4); // set player above other elements
        this.clouds2.setDepth(2);
        this.clouds3.setDepth(5);

        // AUDIO SETTINGS
        this.booster = this.sound.add('booster');
        this.booster.loop = true;
        this.booster.setVolume(this.MAX_VOLUME / 2);
        this.booster.play();
    }

    /*
     * =======================================================
     * UPDATE
     * =======================================================
     */
    update() {
        // BACKGROUND MOVEMENT
        this.moveBackground();

        // LINE MOVEMENT
        this.moveLines();

        // CONTROLS
        this.playerJump();

        // MOVING UP
        if (this.player.body.velocity.y < 0) {
            this.drawLine(); // draw line to player

            // IF PREVIOUSLY MOVING DOWN (Runs once per direction change)
            if (this.wasMovingDown) {
                this.onPlayerMovingUp();
            }
            this.wasMovingDown = false;
            this.wasMovingUp = true;
        }
        // MOVING DOWN
        else if (this.player.body.velocity.y > 0) {
            this.drawLine(); // draw line to player

            // IF PREVIOUSLY MOVING UP
            if (this.wasMovingUp) {
                this.onPlayerMovingDown();
            }
            this.wasMovingDown = true;
            this.wasMovingUp = false;
        }
    }

    /*=================
     * PLAYER MOVEMENT
     */

    playerJump() {
        if (!this.physics.isPaused) {
            if (this.player.y > -25 || ((this.pointer.isDown || this.space.isDown) && (this.player.y > -(this.LEVEL_HEIGHT) + 125))) {
                this.player.setVelocityY(-375);
            }
        }
    }

    // ON PLAYER MOVING UP
    onPlayerMovingUp() {
        this.prepareNewLine(); // create a new line
        this.playRiseAnim(); // player jump animation, emitter, and sound
    }

    // ON PLAYER MOVING DOWN
    onPlayerMovingDown() {
        this.prepareNewLine(); // create a new line
        this.playFallAnim(); // player fall animation, stop emitter, and stop sound
    }

    // PLAYER JUMP
    playRiseAnim() {
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
    }

    // PLAYER FALL
    playFallAnim() {
        // PLAY ANIMATION FALL
        this.player.anims.delayedPlay(200, 'player_fall'); // start player falling animation

        // STOP BOOSTER EMITTER
        this.emitter.stop(); // stop booster emitter

        // STOP BOOSTER SOUND
        this.fadeAudio(this.booster, 0, 300); // fade booster audio to 0
    }

    /*=================
     * DRAWING LINES
     */

    // PREPARE NEW LINE
    prepareNewLine() {
        this.lineStartX = this.player.x; // get player x pos
        this.lineStartY = this.player.y; // get player y pos
        this.graphics = this.add.graphics();
        this.allLines.add(this.graphics);
    }

    // DRAW LINE
    drawLine() {
        this.lineStartX += this.LINE_SPEED; // move line position of line being drawn
        this.graphics.clear(); // clear line to redraw
        this.graphics.lineStyle(8, '0xffffff', 1); // line style (line width, color, alpha)
        this.graphics.beginPath(); // start path
        this.graphics.moveTo(this.lineStartX, this.lineStartY); // move starting point of path
        this.graphics.lineTo(this.player.x, this.player.y); // make line to another point
        this.graphics.closePath(); // finish path
        this.graphics.strokePath(); // draw line on path
    }

    // MOVE LINES
    moveLines() {
        if (this.allLines) {
            let allLines = this.allLines.getChildren();
            for (let i = 0; i < allLines.length - 1; i++) {
                allLines[i].x += this.LINE_SPEED;
                if ((allLines[i].x - allLines[i].w) < -(this.LEVEL_WIDTH)) {
                    allLines[i].destroy(); // destroy line objects when they travel off screen
                }
            }
        }
    }

    /*=================
     * OTHER GAME ELEMENTS
     */

    // MOVE BACKGROUND
    moveBackground() {
        this.background.tilePositionX -= 0.1;
        this.clouds1.tilePositionX += 0.1;
        this.clouds2.tilePositionX += 0.3;
        this.clouds3.tilePositionX += 0.8;
    }

    // LEVEL COMPLETE
    levelComplete() {
        this.physics.pause();
        this.fadeAudio(this.booster, 0, 300);
        if (this.cameras.main.visible === true) {
            this.switchCamera();
        }
        this.tweens.add({
            targets: [this.clouds1, this.clouds2, this.clouds3, this.clouds4],
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

    // RESUME PHYSICS
    resumePhysics() {
        if (this.physics.isPaused) {
            this.physics.resume()
            this.physics.isPaused = false;
        }
    }
}