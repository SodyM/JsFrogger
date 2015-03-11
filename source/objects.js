var animatedObject = {

};

// sprite object
var spriteObject = {
    //The X and Y source position of the sprite's image and its height and width
    sourceX: 0,
    sourceY: 0,
    sourceWidth: 64,
    sourceHeight: 64,

    //The X and Y position of the sprite on the canvas as well as its height
    x: 0,
    y: 0,
    width: 64,
    height: 64,

    // Vector for calculation of collisions
    vx: 0,
    vy: 0,

    // small helper variables
    leftToRight: true,
    staticObject: true,
    transportable: false,
    rotation: 0,
    homeImage: false,
    speed: 0,

    // support for collisions - getters
    centerX: function(){
        return this.x + (this.width / 2);
    },
    centerY: function(){
        return this.y + (this.height / 2);
    },
    halfWidth: function(){
        return this.width / 2;
    },
    halfHeight : function(){
        return this.height / 2;
    }
};

var messageObject = {
    x: 0,
    y: 0,
    visible: true,
    text: "Message",
    font: "normal bold 20px Helvetica",
    fillStyle: "#FFFF00",
    textBaseline: "top"
};

var homeObject = {
    x: 0,
    y: 15,
    height: 54,
    width: 80,
    sourceWidth: 1,
    sourceHeight: 1,
    isEmpty: true,
    index: 0,

    // support for collisions - getters
    centerX: function () {
        return this.x + (this.width / 2);
    },
    centerY: function () {
        return this.y + (this.height / 2);
    },
    halfWidth: function () {
        return this.width / 2;
    },
    halfHeight: function () {
        return this.height / 2;
    }
};