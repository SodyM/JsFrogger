(function(){
// create cavnas and its drawing surfaces
var canvas = document.querySelector("canvas");
var drawingSurface = canvas.getContext("2d");

//An array to store the sprites and game objects
var sprites = [];
var assetsToLoad = [];

//---------------------------------- Create the background sprite
var background = Object.create(spriteObject);
background.sourceX = 0;
background.sourceY = 0;
background.sourceWidth = 664;
background.sourceHeight = 600;
background.width = 664;
background.height = 600;
background.x = 0;
background.y = 0;
sprites.push(background);

// load tilesheet image
var image = new Image();
image.addEventListener("load", loadHandler, false);
image.src = "images/background.png";
assetsToLoad.push(image);

//-------------------------------- load sounds
var music = document.querySelector('#music');
music.addEventListener("canplaythrough", loadHandler, false);
music.load();
assetsToLoad.push(music);

var hop = document.querySelector('#hop');
hop.addEventListener("canplaythrough", loadHandler, false);
hop.addEventListener("ended", endedHndler, false);
hop.load();
assetsToLoad.push(hop);

var carKill = document.querySelector('#carKill');
carKill.addEventListener("canplaythrough", loadHandler, false);
carKill.load();
assetsToLoad.push(carKill);

var waterKill = document.querySelector('#waterKill');
waterKill.addEventListener("canplaythrough", loadHandler, false);
waterKill.load();
assetsToLoad.push(waterKill);

var score = document.querySelector('#score');
score.addEventListener("canplaythrough", loadHandler, false);
score.load();
assetsToLoad.push(score);

// variable to count the number of assets the game needs to load
var assetsLoaded = 0;

// game states
var LOADING     = 0;
var PLAYING     = 1;
var OVER        = 2;
var gameState   = LOADING;

// arrow key codes
var UP      = 38;
var DOWN    = 40;
var RIGHT   = 39;
var LEFT    = 37;

// directions
var moveUp      = false;
var moveDown    = false;
var moveLeft    = false;
var moveRight   = false;

// player and definition of his movement
var _player;
var _stepUp = 40;
var _stepAside = 30;

// other game objects
var _lifes = 4;
var _score = 0;
var _playerIsInWater = false;

var _movementAllowed = true;
var _lifeSymbols = [];
var _messages = [];
var homeList = [];
var _waterObjects = [];

// create game messages
var scoreDisplay = Object.create(messageObject);
scoreDisplay.font = "normal 20px emulogic";
scoreDisplay.x = 600;
scoreDisplay.y = 560;
scoreDisplay.text = 0;
_messages.push(scoreDisplay);

var gameOver = Object.create(messageObject);
gameOver.font = "normal bold 30px emulogic";
gameOver.x = 25;
gameOver.y = 270;
gameOver.text = "G A M E   O V E R";
gameOver.visible = false;
_messages.push(gameOver);


// add keyboard listeners - key is down
window.addEventListener("keydown", function(event){
    switch(event.keyCode){
        case UP:
            moveUp = true;
            _player.rotation = 0;
            break;
        case DOWN:
            _player.rotation = 180;
            moveDown = true;
            break;
        case LEFT:
            _player.rotation = 270;
            moveLeft = true;
            break;
        case RIGHT:
            _player.rotation = 90;
            moveRight = true;
            break;
    }
}, false);

// key was released
window.addEventListener("keyup", function(event)
{
    switch(event.keyCode)
    {
        case UP:
            moveUp = false;
            break;
        case DOWN:
            moveDown = false;
            break;
        case LEFT:
            moveLeft = false;
            break;
        case RIGHT:
            moveRight = false;
            break;
    }
}, false);

function update(){
    // the animation loop
    requestAnimationFrame(update, canvas);

    // change what the game is doing based on the game state
    switch(gameState){
        case LOADING:
            console.log("loading...");
            break;
        case PLAYING:
            playGame();
            break;
        case OVER:
            endGame();
            break;
    }
    render();
}

function endedHndler(){
    _movementAllowed = true;
}

function loadHandler(){
    assetsLoaded++;
    if (assetsLoaded === assetsToLoad.length){
        // remove the load event listener
        image.removeEventListener("load", loadHandler, false);
        music.removeEventListener("canplaythrough", loadHandler, false);
        hop.removeEventListener("canplaythrough", loadHandler, false);
        carKill.removeEventListener("canplaythrough", loadHandler, false);

        // init game
        initGame();

        // play the music
        music.play();

        // start the game
        gameState = PLAYING;

        // start game animation loop
        update();
    }
}

function initGame(){
    createTruckLine();
    createBulldozer();
    createFormula2();
    createCar();
    createYellowFormula();
    createSmallLog();
    createMiddleLog();
    create3Turtles();
    createBigLog();
    create2Turtles();
    createPlayer();
    createLifes();
    createHomes();
}

function playGame(){
    // left
    if (_movementAllowed && moveLeft && !moveRight && !moveUp && !moveDown){
        if (_player.x > 0){
            _player.x -= _stepAside;
            playHop();
        }
    }
    // right
    if (_movementAllowed && moveRight && !moveLeft && !moveUp && !moveDown){
        if (_player.x < 630){
            _player.x += _stepAside;
            playHop();
        }
    }
    // up
    if (_movementAllowed && moveUp && !moveDown && !moveLeft && !moveRight){
        if (_player.y > 40){
            _player.y -= _stepUp;
            playHop();
        }
    }
    // down
    if (_movementAllowed && moveDown && !moveUp && !moveLeft && !moveRight){
        if (_player.y < 505){
            _player.y += _stepUp;
            playHop();
        }
    }

    moveLeft = false, moveRight = false, moveUp = false, moveDown = false;

    if (_player.y < 260 && _player.y > 64)
        _playerIsInWater = true;
    else
        _playerIsInWater = false;

    if (_playerIsInWater){
        var playerIsOnItem = checkForCollisionOnWater();
        if (!playerIsOnItem){
            killFrogInWater();
        }
    }

    // check for collisions with objects
    if(sprites.length !== 0){
        for(var i = 0; i < sprites.length; i++){
            var sprite = sprites[i];
            if (!sprite.staticObject){
                moveSprites(sprite);
                checkForHome();
                checkForCollision(sprite);
            }
        }
    }
}

function render(){
    drawingSurface.clearRect(0, 0, canvas.width, canvas.height);

    // display sprites
    if (!sprites.length !== 0){
        for(var i = 0; i < sprites.length; i++){
            //Save the current state of the drawing surface before it's rotated
            drawingSurface.save();

            var sprite = sprites[i];
             //Rotate the canvas
             drawingSurface.translate
             (
                 Math.floor(sprite.x + sprite.halfWidth()),
                 Math.floor(sprite.y + sprite.halfHeight())
             );
             drawingSurface.rotate(sprite.rotation * Math.PI / 180);
            drawingSurface.drawImage
                (
                    image,
                    sprite.sourceX, sprite.sourceY,
                    sprite.sourceWidth, sprite.sourceHeight,
                    Math.floor(-sprite.halfWidth()), Math.floor(-sprite.halfHeight()),
                    sprite.width, sprite.height
                );

            //Restore the drawing surface to its state before it was rotated
            drawingSurface.restore();
        }
    }

    // display game messages
    if (_messages.length !== 0){
        for(var i = 0; i < _messages.length; i++){
            var message = _messages[i];
            if (message.visible){
                drawingSurface.font = message.font;
                drawingSurface.fillStyle = message.fillStyle;
                drawingSurface.textBaseline = message.textBaseline;
                drawingSurface.fillText(message.text, message.x, message.y);
            }
        }
    }
}

function endGame(){
    gameOver.visible = true;
    music.pause();
}

function moveSprites(sprite){
    if (!sprite.staticObject){
        if (sprite.leftToRight){
            if (sprite.x < canvas.width)
                sprite.x += 1 + sprite.speed;
            else
                sprite.x = -sprite.width;
        }
        else{
            if(sprite.x > -sprite.sourceWidth)
                sprite.x -= 1 + sprite.speed;
            else
                sprite.x = canvas.width;
        }
    }
}

function checkForHome(){
    for(var i = 0; i < homeList.length; i++){
        var home = homeList[i];
         if (hitTestRectangle(home, _player)){
             if (home.isEmpty){
                 homeList[i].isEmpty = false;
                 setFrogHome(home);
                 _score += 50;
                 scoreDisplay.text = _score
                 resetPlayer();
             }
             else{
                 moveDown = true;
             }
         }
    }
}

function setFrogHome(home){
    var frog = Object.create(spriteObject);
    if (home.index === 0)
        frog.x = home.x + 18;
    else if (home.index === 1)
        frog.x = home.x;
    else if (home.index === 2)
        frog.x = home.x + 12;
    else if (home.index === 3)
        frog.x = home.x + 22;
    else if (home.index === 4)
        frog.x = home.x + 3;

    frog.y = home.y + 18;
    frog.sourceX = _player.sourceX;
    frog.sourceY = _player.sourceY;
    frog.sourceHeight = 30;
    frog.sourceWidth = 36;
    frog.height = 30;
    frog.width = 36;
    frog.rotation = 180;
    frog.homeImage = true;

    score.currentTime = 0;
    score.play();

    sprites.push(frog);
}

function checkForCollisionOnWater(){
    for(var i = 0; i < _waterObjects.length; i++){
        var sprite = _waterObjects[i];
        if (hitTestRectangle(sprite, _player))
            return true;
    }
    return false;
}

function checkForCollision(sprite){
    var collision = hitTestRectangle(sprite, _player);
    if (collision){
        if (!sprite.transportable){
            killFrogOnRoad();
        }
        else{
            if (sprite.leftToRight){
                if (sprite.x < canvas.width)
                    _player.x += 1;
                else
                    killFrogInWater();
            }
            else{
                if(_player.x > -_player.sourceWidth)
                    _player.x -= 1;
                else
                    killFrogInWater();
            }
        }
    }
}

function createPlayer(){
    _player = Object.create(spriteObject);
    _player.x = 30;
    _player.y = 510;
    _player.sourceX = 587;
    _player.sourceY = 601;
    _player.sourceHeight = 30;
    _player.sourceWidth = 36;
    _player.height = 30;
    _player.width = 36;
    sprites.push(_player);
}

function createLifes(){
    var xPosition = 0;
    for (var i = 0; i < _lifes; i++){
        xPosition += 25;
        var life = Object.create(spriteObject);
        life.index = i;
        life.Id = "life" + i;
        life.x = xPosition;
        life.y = 550;
        life.sourceX = 628;
        life.sourceY = 600;
        life.sourceHeight = 18;
        life.sourceWidth = 23;
        life.height = 18;
        life.width = 23;

        sprites.push(life);
        _lifeSymbols.push(life);
    }
}

function createDefaultTruck(){
    var vehicle = Object.create(spriteObject);
    vehicle.staticObject = false;
    vehicle.y = 308 ;
    vehicle.sourceX = 0;
    vehicle.sourceY = 600;
    vehicle.sourceHeight = 30;
    vehicle.sourceWidth = 80;
    vehicle.width = 80;
    vehicle.height = 30;
    vehicle.leftToRight = false;
    vehicle.speed = 0.3;
    return vehicle;
}

function createTruckLine(){
    var vehicle = createDefaultTruck();
    vehicle.x = 490;
    sprites.push(vehicle);

    vehicle = createDefaultTruck();
    vehicle.x = 250;
    sprites.push(vehicle);

    vehicle = createDefaultTruck();
    vehicle.x = 10;
    sprites.push(vehicle);
}

function createFormula2Line(){
    var vehicle = Object.create(spriteObject);
    vehicle.staticObject = false;
    vehicle.y = 342;
    vehicle.sourceX = 130;
    vehicle.sourceY = 600;
    vehicle.sourceHeight = 42;
    vehicle.sourceWidth = 49;
    vehicle.width = 49;
    vehicle.height = 42;
    vehicle.leftToRight = true;
    vehicle.speed = 1.7;
    return vehicle;
}

function createFormula2(){
    var vehicle = createFormula2Line();
    vehicle.x = 0;
    sprites.push(vehicle);

    vehicle = createFormula2Line();
    vehicle.x = 220;
    sprites.push(vehicle);

    vehicle = createFormula2Line();
    vehicle.x = 450;
    sprites.push(vehicle);
}

function createCarLine(){
    var vehicle = Object.create(spriteObject);
    vehicle.staticObject = false;
    vehicle.y = 387;
    vehicle.sourceX = 230;
    vehicle.sourceY = 600;
    vehicle.sourceWidth = 48;
    vehicle.sourceHeight = 35;
    vehicle.width = 48;
    vehicle.height = 35;
    vehicle.leftToRight = false;
    vehicle.speed = 1;
    return vehicle;
}

function createCar(){
    var vehicle = createCarLine();
    vehicle.x = 600;
    sprites.push(vehicle);

    vehicle = createCarLine();
    vehicle.x = 300;
    sprites.push(vehicle);
}

function createBulldozerLine(){
    var vehicle = Object.create(spriteObject);
    vehicle.staticObject = false;
    vehicle.y = 424;
    vehicle.sourceX = 84;
    vehicle.sourceY = 600;
    vehicle.sourceHeight = 38;
    vehicle.sourceWidth = 44;
    vehicle.width = 44;
    vehicle.height = 38;
    vehicle.leftToRight = true;
    return vehicle;
}

function createBulldozer(){
    var vehicle = createBulldozerLine();
    vehicle.x = 0;
    sprites.push(vehicle);

    vehicle = createBulldozerLine();
    vehicle.x = 240;
    sprites.push(vehicle);

    vehicle = createBulldozerLine();
    vehicle.x = 440;
    sprites.push(vehicle);
}

function createYellowFormulaLine(){
    var vehicle = Object.create(spriteObject);
    vehicle.staticObject = false;
    vehicle.y = 465;
    vehicle.sourceX = 180;
    vehicle.sourceY = 600;
    vehicle.sourceWidth = 49;
    vehicle.sourceHeight = 41;
    vehicle.width = 49;
    vehicle.height = 41;
    vehicle.leftToRight = false;
    vehicle.speed = 0.4;
    return vehicle;
}

function createYellowFormula(){
    var vehicle = createYellowFormulaLine();
    vehicle.x = 485;
    sprites.push(vehicle);

    vehicle = createYellowFormulaLine();
    vehicle.x = 285;
    sprites.push(vehicle);

    vehicle = createYellowFormulaLine();
    vehicle.x = 85;
    sprites.push(vehicle);
}

function createMiddleLog(){
    var vehicle = Object.create(spriteObject);
    vehicle.staticObject = false;
    vehicle.x = 0;
    vehicle.y = 108;
    vehicle.sourceX = 405;
    vehicle.sourceY = 600;
    vehicle.sourceHeight = 30;
    vehicle.sourceWidth = 172;
    vehicle.height = 30;
    vehicle.width = 172;
    vehicle.transportable = true;
    sprites.push(vehicle);
    _waterObjects.push(vehicle);
}

function create2TurtleLines(){
    var vehicle = Object.create(spriteObject);
    vehicle.staticObject = false;
    vehicle.y = 70;
    vehicle.sourceX = 407;
    vehicle.sourceY = 645;
    vehicle.sourceHeight = 30;
    vehicle.sourceWidth = 92;
    vehicle.height = 30;
    vehicle.width = 92;
    vehicle.leftToRight = false;
    vehicle.transportable = true;
    return vehicle;
}

function create2Turtles(){
    var vehicle = create2TurtleLines();
    vehicle.x = 0;
    sprites.push(vehicle);
    _waterObjects.push(vehicle);

    vehicle = create2TurtleLines();
    vehicle.x = 260;
    sprites.push(vehicle);
    _waterObjects.push(vehicle);

    vehicle = create2TurtleLines();
    vehicle.x = 500;
    sprites.push(vehicle);
    _waterObjects.push(vehicle);
}

function createBiLogLines(){
    var vehicle = Object.create(spriteObject);
    vehicle.staticObject = false;
    vehicle.y = 150;
    vehicle.sourceX = 0;
    vehicle.sourceY = 645;
    vehicle.sourceHeight = 30;
    vehicle.sourceWidth = 263;
    vehicle.height = 30;
    vehicle.width = 263;
    vehicle.transportable = true;
    vehicle.leftToRight = false;
    return vehicle;
}

function createBigLog(){
    var vehicle = createBiLogLines();
    vehicle.x = 0;
    sprites.push(vehicle);
    _waterObjects.push(vehicle);

    vehicle = createBiLogLines();
    vehicle.x = 450;
    sprites.push(vehicle);
    _waterObjects.push(vehicle);
}

function createSmallLogLines(){
    var vehicle = Object.create(spriteObject);
    vehicle.staticObject = false;
    vehicle.y = 190;
    vehicle.sourceX = 279;
    vehicle.sourceY = 600;
    vehicle.sourceHeight = 30;
    vehicle.sourceWidth = 125;
    vehicle.height = 30;
    vehicle.width = 125;
    vehicle.transportable = true;
    return vehicle;
}

function createSmallLog(){
    var vehicle = createSmallLogLines();
    vehicle.x = 0;
    sprites.push(vehicle);
    _waterObjects.push(vehicle);

    vehicle = createSmallLogLines();
    vehicle.x = 250;
    sprites.push(vehicle);
    _waterObjects.push(vehicle);

    vehicle = createSmallLogLines();
    vehicle.x = 550;
    sprites.push(vehicle);
    _waterObjects.push(vehicle);
}

function create3Turtles(){
    var vehicle = Object.create(spriteObject);
    vehicle.staticObject = false;
    vehicle.x = 0;
    vehicle.y = 227;
    vehicle.sourceX = 265;
    vehicle.sourceY = 645;
    vehicle.sourceHeight = 30;
    vehicle.sourceWidth = 135;
    vehicle.height = 30;
    vehicle.width = 135;
    vehicle.transportable = true;
    vehicle.leftToRight = false;
    sprites.push(vehicle);

    _waterObjects.push(vehicle);
}

function createHomes(){
    var home1 = Object.create(homeObject);
    home1.x = 11;
    home1.y = 15;
    home1.height = 54;
    home1.width = 50;
    home1.sourceWidth = 1;
    home1.sourceHeight = 1;
    home1.index = 0;
    homeList.push(home1);

    var home2 = Object.create(homeObject);
    home2.x = 172;
    home2.width = 50;
    home2.index = 1;
    homeList.push(home2);

    var home3 = Object.create(homeObject);
    home3.x = 300;
    home3.width = 50;
    home3.index = 2;
    homeList.push(home3);

    var home4 = Object.create(homeObject);
    home4.x = 432;
    home4.width = 50;
    home4.index = 3;
    homeList.push(home4);

    var home5 = Object.create(homeObject);
    home5.x = 578;
    home5.width = 60;
    homeList.push(home5);
}


function killFrogInWater(){
    waterKill.currentTime = 0;
    waterKill.play();
    // TODO: show death in the water
    killFrog();
}

function killFrogOnRoad(){
    carKill.currentTime = 0;
    carKill.play();
    // TODO: show death on the road
    killFrog();
}

function killFrog(){
    _lifes -= 1;

    var life = _lifeSymbols[_lifeSymbols.length - 1];
    removeObject(life, _lifeSymbols);
    removeObject(life, sprites);

    resetPlayer();

    if (_lifes === 0){
        removeObject(_player, sprites);
        gameState = OVER;
    }
}

function removeObject(objectToRemove, array){
    var i = array.indexOf(objectToRemove);
    if (i !== -1){
        array.splice(i, 1);
    }
}

function resetPlayer(){
    // set player on start position
    _player.x = 30;
    _player.y = 510;
}

function playHop(){
    hop.currentTime = 0;
    hop.play();
}

}());