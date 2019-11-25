# Phaser_Flight_Test

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Practice</title>
    <script src="js/phaser.js"></script>
    <script src="js/game.js" type="module"></script>
    <style>
        div.a {
            font-size: 130%;
        }
    </style>
</head>
<body>
    <h1>Flying Alien</h1>
    <div id="game"></div>
    <h2>!!!WORK IN PROGRESS!!!</h2>
    <h2>========= CHANGELOG (11/24/19) =========</h2>
    <div class="a">
        <ul>
            <li>Transitioned to extending the Scene class in separate files for organization. Each scene can represent a new level or menu. These are then imported into the game.js</li>
            <li>Moved loading into a separate scene that directly calls the easy level scene when loading is complete.</li>
            <li>Added a moving background with clouds.</li>
            <li>Alien now has a particle trail as he flies across the sky.</li>
            <li>Added sound for alien as he flies.</li>
            <li>Changed controls to holding down either spacebar or mouse click.</li>
            <li>Created scalable level for the player to fly across with artificial floor and ceiling.</li>
            <li>Added a Pause scene that watches for a 'pause' event and allows the player to restart the level when they click.</li>
            <li>This pause event occurs when the player 'wins' which, as of now, happens when they either make it to the right edge or press the 'P' key.</li>
            <li>This pause scene demonstrates that multiple scenes can be active at once, which is done in the constructor of the extended Scene classes.</li>
            <li>The entire level can be viewed at any time by pressing the 'M' key</li>
        </ul>
    </div>
    <h2>========= TO-DO =========</h2>
    <div class="a">
        <ul>
            <li>Create ring sprite for the player to go through and guide their movements.</li>
            <li>Create patterns with rings for the player to identify.</li>
            <li>When game is over the screen will zoom out and text will walk the player through the pattern.</li>
        </ul>
    </div>
</body>
</html>
