var config = {
    type: Phaser.WEBGL,
    width: 640,
    height: 480,
    backgroundColor: '#bfcc00',
    parent: 'phaser-example',
    physics: {
        default: 'matter',
        matter: {
            gravity: {
                x: 0,
                y: 0
            }
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
};

var game = new Phaser.Game(config);

var localPlayer, onlinePlayer, pointer, cursor;

var Sword = new Phaser.Class({
    initialize: function Sword(x, y, scene, parent) 
    {
        this.slowSpeed = 2;
        this.fastSpeed = 3.5;
        this.currentSpeed = 3.5;
        this.skin = scene.add.triangle(x, y, 0, -15, 40, -15, 20, -105, 0x6666ff);
        this.skin.setStrokeStyle(4, 0x000000);
        this.parent = parent;
        
        this.skin.on('')
    },
    
    setSpeedSlow: function()
    {
        this.currentSpeed = this.slowSpeed;
    },
    
    setSpeedFast: function()
    {
        this.currentSpeed = this.fastSpeed;
    },
    
    update:
    function () {
        this.skin.angle += this.currentSpeed;
        if(this.skin.angle > 360) this.skin.angle -= 360;
    }
    
});


var Player = new Phaser.Class({
    
    initialize:
    function Player(scene, x, y)
    {
        // console.log(scene);
        this.maxSpeed = 5;
        this.accelleration = .2;
        this.turnaround = .1;
        this.currentSpeed = [0, 0]; //[xSpeed, ySpeed]
        this.friction = .1;
        this.sword;
        this.upgrades = [];
        this.skin = scene.add.circle(x, y, 50, 0xff0000);
        this.skin.setStrokeStyle(4, 0x000000);
        this.scene = scene;
        this.sword = new Sword(x, y, scene, this);
    },
    
    update:
    function(time)
    {
        this.sword.update();
        this.move(this.currentSpeed);
    },
    
    setCurrentSpeed: function(speed) 
    {
        this.currentSpeed = speed;
    },
    
    move: function(currentSpeed) 
    {
        this.skin.x += currentSpeed[0];
        this.skin.y += currentSpeed[1];
        
        this.sword.skin.x = this.skin.x;
        this.sword.skin.y = this.skin.y;
    }
    
});

var LocalPlayer = new Phaser.Class({
    Extends: Player,
    
    update:
    function(time)
    {
        
        this.setCurrentSpeed(this.calcSpeedArrows());
        this.setSwordSpeed();
        
        this.move(this.currentSpeed);
        this.sword.update();
    },
    
    setSwordSpeed: 
    function()
    {
        if(cursor.space.isDown) this.sword.setSpeedSlow();
        else this.sword.setSpeedFast();
    },
    
    /*
    After trying this code out, playing the game with the mouse is super awkward. Using Arrow Keys instead.
    calcSpeedPointer: function()
    {
        var xDif = pointer.x - this.skin.x;
        var yDif = pointer.y - this.skin.y;
        
        var total = Math.abs(xDif) + Math.abs(yDif);
        
        
        var xSpeed = xDif*(Math.abs(xDif)/total)*this.accelleration + this.currentSpeed[0];
        var ySpeed = yDif*(Math.abs(yDif)/total)*this.accelleration + this.currentSpeed[1];
        
        var totalSpeed = Math.abs(xSpeed) + Math.abs(ySpeed);
        var xCoef = Math.abs(xSpeed)/totalSpeed;
        var yCoef = Math.abs(ySpeed)/totalSpeed;
        
        xSpeed = Math.max(-this.maxSpeed*xCoef, Math.min(this.maxSpeed*xCoef, xSpeed));
        ySpeed = Math.max(-this.maxSpeed*yCoef, Math.min(this.maxSpeed*yCoef, ySpeed));
        
        return [xSpeed, ySpeed];
    },
    */
                                   
    calcSpeedArrows: function()
    {
        // Default value
        var xAcc = 0;
        var yAcc = 0;
        
        // Set acc based on input
        if(cursor.left.isDown) xAcc = -this.accelleration;
        else if(cursor.right.isDown) xAcc = this.accelleration;
        if(cursor.up.isDown) yAcc = -this.accelleration;
        else if(cursor.down.isDown) yAcc = this.accelleration;
        
        // Get initial new Speed
        var xSpeed = xAcc + this.currentSpeed[0];
        var ySpeed = yAcc + this.currentSpeed[1];
        
        // Cap the speed
        var totalSpeed = Math.sqrt(xSpeed*xSpeed + ySpeed*ySpeed);
        var coef = this.maxSpeed/totalSpeed;
        if(coef < 1) {
            xSpeed *= coef;
            ySpeed *= coef;
        }
        
        // Faster turn around
        if(Math.sign(xAcc) != Math.sign(xSpeed)) xSpeed += this.turnaround * Math.sign(xAcc);
        if(Math.sign(yAcc) != Math.sign(ySpeed)) ySpeed += this.turnaround * Math.sign(yAcc);
        
        // Friction if no input
        if(totalSpeed > 0) {
            var fricCoef = (totalSpeed-this.friction)/totalSpeed;
            fricCoef = Math.max(0, fricCoef);
            if(xAcc == 0 && yAcc == 0) {
                xSpeed *= fricCoef;
                ySpeed *= fricCoef;
            }
            else {
                if(xAcc == 0) xSpeed *= fricCoef;
                if(yAcc == 0) ySpeed *= fricCoef;
            }
        }
        
        return [xSpeed, ySpeed];
        
    },
})

//___________________________________PRELOAD______________________________________________
// handle image loading
function preload()
{
    
}


//___________________________________CREATE______________________________________________
// handel object creation
function create()
{
    pointer = this.input.activePointer;
    cursor = this.input.keyboard.createCursorKeys();
    
    localPlayer = new LocalPlayer(this, 200, 200);
    onlinePlayer = new Player(this, 200, 400);
    
    
}


//___________________________________UPDATE______________________________________________
// handle frame to frame code
function update()
{
    pointer = this.input.activePointer;
    localPlayer.update();
    onlinePlayer.update();
}

