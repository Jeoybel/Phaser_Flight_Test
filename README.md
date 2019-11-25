# Phaser_Flight_Test

!!!WORK IN PROGRESS!!!
========= CHANGELOG (11/24/19) =========
Transitioned to extending the Scene class in separate files for organization. Each scene can represent a new level or menu. These are then imported into the game.js
Moved loading into a separate scene that directly calls the easy level scene when loading is complete.
Added a moving background with clouds.
Alien now has a particle trail as he flies across the sky.
Added sound for alien as he flies.
Changed controls to holding down either spacebar or mouse click.
Created scalable level for the player to fly across with artificial floor and ceiling.
Added a Pause scene that watches for a 'pause' event and allows the player to restart the level when they click.
This pause event occurs when the player 'wins' which, as of now, happens when they either make it to the right edge or press the 'P' key.
This pause scene demonstrates that multiple scenes can be active at once, which is done in the constructor of the extended Scene classes.
The entire level can be viewed at any time by pressing the 'M' key
========= TO-DO =========
Create ring sprite for the player to go through and guide their movements.
Create patterns with rings for the player to identify.
When game is over the screen will zoom out and text will walk the player through the pattern
