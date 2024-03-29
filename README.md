<h1>Untitled Game Project - [WIP]</h1>
<p>Keybinds:<br>
    [Mouse-click, space]: fly up<br>
    [M]: view level<br>
    [P]: pause scene<br>
    [Mouse-click]:restart scene after pause<br>
</p>

<h2>CHANGELOG (11/26/19)</h2>
<ul>
    <li>Added new background, clouds, and ring.</li>
    <li>Made code more readable.</li>
    <li>Locked the player on the x-axis and made the lines move backwards to give the illusion of movement.</li>
    <li>This is to make way for creating patterns with the rings that will come at the player and despawn off screen.</li>
    <li>Fixed: event listeners for keybinds would double on scene restart causing functions to go off twice.</li>
    <li>Fixed: booster sound not going off at start.</li>
    <li>Fixed: booster .ogg file not importing correctly.</li>
</ul>
<h2>TO-DO</h2>
<ul>
    <li>Polish up player animations</li>
    <li>Make the rings detect when player goes through them.</li>
    <li>Create patterns with rings for the player to identify.</li>
    <li>Annotate patterns</li>
    <li>Modularize code further</li>
</ul>
<br><br>
<h2>CHANGELOG (11/24/19)</h2>
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
<h2>TO-DO</h2>
<ul>
    <li>Create ring sprite for the player to go through and guide their movements.</li>
    <li>Create patterns with rings for the player to identify.</li>
    <li>When game is over the screen will zoom out and text will walk the player through the pattern.</li>
</ul>
