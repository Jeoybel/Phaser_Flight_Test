let config = {
    type: Phaser.AUTO,
    width: 900,
    height: 600,
    backgroundColor: '#699ED1',
    parent: 'game',
    pixelArt: true, // prevents blurriness with scaling sprites
    scene: {
        preload: preload,
        create: create,
        update: update,
        extend: {
            playerJump: playerJump,
            setEmitter: setEmitter,
            switchCamera: switchCamera,
            drawLine: drawLine,
            newLine: newLine
        }
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 800
            },
            debug: false
        }
    }
};

let game = new Phaser.Game(config);

function preload() {
    this.load.spritesheet('player', '../../assets/SGG.png', {
        frameWidth: 32,
        frameHeight: 32
    });
    this.load.image('particle', '../../assets/Green_Particle.png');
}

function create() {
    // PLAYER W/ ANIMATIONS
    this.player = this.physics.add.sprite(0, 0, 'player');
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
    this.player.setDepth(1); // set player above other elements
    this.player.setVelocityX(50); // constant horizontal velocity
    this.player.anims.play('player_rise');

    // PARTICLE/EMITTER SETTINGS
    this.particles = this.add.particles('particle');
    this.emitter = this.particles.createEmitter({
        x: this.player.x,
        y: this.player.y + 10,
        lifespan: 0,
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
        blendMode: 'ADD',
        visible: false,
        alpha: 0.18
    });

    // CAMERA SETTINGS
    // MAIN
    this.cameras.main.startFollow(this.player); // follow player with camera
    this.cameras.main.setZoom(0.8);

    // OVERVIEW
    this.overview = this.cameras.add();
    this.overview.setZoom(0.3);
    this.overview.setBounds(0, -(this.sys.scale.height) / this.overview.zoom, 0, 0); // set camera left corner to (0, 0)
    this.overview.setVisible(false);

    // INPUT SETTINGS
    this.mKey = this.input.keyboard.addKey('M');
    this.mKey.on('down', switchCamera, this); // switch camera
    this.space = this.input.keyboard.addKey('space');
    this.space.on('down', playerJump, this); // jump on space

    // GRAPHICS SETTINGS
    this.graphics = this.add.graphics(); // to draw lines
    this.startX = 0;
    this.startY = 0;

    // PHYSICS SETTINGS
    this.physics.pause();
    this.isPaused = true;
    this.wasMovingUp;
    this.wasMovingDown;
}

function update() {
    // PARTICLE TRACKER
    this.particles.x = this.player.x;
    this.particles.y = this.player.y;

    if (this.player.y > 0) {
        this.playerJump();
    }

    // MOVING UP
    if (this.player.body.velocity.y <= 0) {
        this.setEmitter(280, 6); // Enable emitter (final value, step)

        this.drawLine(); // draw line

        // IF PREVIOUSLY MOVING DOWN
        if (this.wasMovingDown) {
            this.wasMovingDown = false;
            this.newLine();
        }
        this.wasMovingUp = true;
    }
    // MOVING DOWN
    else if (this.player.body.velocity.y > 0) {
        this.setEmitter(0, -7);

        this.drawLine();

        // IF PREVIOUSLY MOVING UP
        if (this.wasMovingUp) {
            this.wasMovingUp = false;
            this.newLine();

            // ANIMATION FALL
            this.player.anims.delayedPlay(200, 'player_fall');
        }
        this.wasMovingDown = true;
    }
}

// PLAYER JUMP
function playerJump() {
    const jumpHeight = -550;

    if (this.player.y > -(this.overview.height / this.overview.zoom) + 150) {
        this.player.setVelocityY(jumpHeight);
    }
    // ANIMATION JUMP
    if (this.player.anims.getCurrentKey() !== 'player_jump' &&
        this.player.anims.getCurrentKey() !== 'player_rise') {
        this.player.anims.play('player_jump');
        this.player.anims.chain('player_rise');
    }

    // UNPAUSE GAME
    if (this.isPaused) {
        this.isPaused = false;
        this.physics.resume();
    }
}

// SET EMITTER (Gives transition effect)
function setEmitter(setValue, increment) {
    let lifespan = this.emitter.lifespan;
    if (increment > 0 && (lifespan.propertyValue < setValue)) {
        this.emitter.setVisible(true);
        lifespan.propertyValue += increment;
    } else if (increment < 0 && (lifespan.propertyValue > setValue)) {
        lifespan.propertyValue += increment;
        if (lifespan.propertyValue < 0) {
            this.emitter.setVisible(false);
            lifespan.propertyValue = 0;
        }
    }
}

// SWITCH CAMERA
function switchCamera() {
    if (this.cameras.main.visible === true) {
        this.overview.visible = true;
        this.cameras.main.visible = false;
    } else {
        this.overview.visible = false;
        this.cameras.main.visible = true;
    }
}

// DRAW LINE
function drawLine() {
    this.graphics.clear(); // clear previous line
    this.graphics.lineStyle(5, '0xffffff', 1); // line style (line width, color, alpha)
    this.graphics.beginPath(); // start path
    this.graphics.moveTo(this.startX, this.startY); // move starting point of path
    this.graphics.lineTo(this.player.x, this.player.y); // make line to another point
    this.graphics.closePath(); // finish path
    this.graphics.strokePath(); // draw line on path
}

// PREPARE NEW LINE
function newLine() {
    this.startX = this.player.x; // get player x pos
    this.startY = this.player.y; // get player y pos
    this.graphics = this.add.graphics(); // create new graphics object for new line
}