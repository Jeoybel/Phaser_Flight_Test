let config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    backgroundColor: '#699ED1',
    parent: 'game',
    pixelArt: true, // prevents blurriness with scaling sprites
    scene: { 
        preload: preload,
        create: create,
        update: update,
        extend: {
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
}

function create() {
    this.player = this.physics.add.sprite(0, 0, 'player');
    this.anims.create({
        key: 'player_walk',
        frames: this.anims.generateFrameNumbers('player', {
            start: 1,
            end: 9
        }),
        frameRate: 9,
        repeat: -1
    })
    this.anims.create({
        key: 'player_stand',
        frames: [{
            key: 'player',
            frame: 0
        }],
    })
    this.anims.create({
        key: 'player_jump',
        frames: this.anims.generateFrameNumbers('player', {
            start: 11,
            end: 14
        }),
        frameRate: 9
    })
    this.anims.create({
        key: 'player_rise',
        frames: this.anims.generateFrameNumbers('player', {
            start: 15,
            end: 20
        }),
        frameRate: 9,
        repeat: -1
    })
    this.anims.create({
        key: 'player_fall',
        frames: this.anims.generateFrameNumbers('player', {
            start: 21,
            end: 30
        }),
        frameRate: 9,
        repeat: -1
    })

    this.player.body.setSize(20, 25); // shrink hit box
    this.player.setScale(3); // 3 times bigger
    this.player.setDepth(1); // set player above other elements
    this.player.setVelocityX(50); // constant horizontal velocity
    this.cameras.main.startFollow(this.player); // follow player with camera
    

    this.cursors = this.input.keyboard.createCursorKeys();
    this.space = this.input.keyboard.addKey('space');
    this.space.on('down', () => {
        this.player.setVelocityY(-400);
        this.player.anims.play('player_jump');
    });

    this.graphics = this.add.graphics(); // to draw lines
    this.wasMovingUp;
    this.wasMovingDown;
    this.startX;
    this.startY;
}

function update() {
    if (this.player.body.velocity.y < 0) { // when moving up
        this.player.anims.play('player_rise', true);
        this.drawLine();
        if (this.wasMovingDown) { // if previously moving down create a new line
            this.newLine();
            this.wasMovingDown = false;
        }
        this.wasMovingUp = true;
    } else if (this.player.body.velocity.y > 0 ) { // when moving down
        this.player.anims.play('player_fall', true);  
        this.drawLine();
        if (this.wasMovingUp) { // if previously moving up create a new line
            this.newLine();
            this.wasMovingUp = false;
        }
        this.wasMovingDown = true;
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