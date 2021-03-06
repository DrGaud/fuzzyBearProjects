'use strict'//Enable Global strict mode 

//Setting up the global variables


/**
 * @constant canvas
 * @type {HTMLCanvasElement}
 * @description Canvas Object from the DOM
 */
const canvas = document.getElementById('gameCanvas');

/**
 * @constant ctx
 * @type {CanvasRenderingContext2D} 
 * @description Canvas Rendering Engine
 */
const ctx = canvas.getContext('2d');

/**
 * @constant gameContainer  
 * @type {HTMLBodyElement}
 * @description Game Container DOM Element 
 */
const gameContainer = document.querySelector('.gameLayer');
/**
 * @constant outputDisplay 
 * @type {HTMLBodyElement}
 * @description JS Output Container DOM Element
 */
const outputDisplay = document.querySelector('.js-output')
/**
 * @constant highScoresTable 
 * @type {HTMLBodyElement}
 * @description  Creating a Order List Element on the Dom to Store the High Scores
 */
const highScoresTable = document.createElement('ol')
// Applying a class to the Element
highScoresTable.classList.add('highScoresTable') 

/**
 * @constant scoreDisplay  
 * @type {HTMLBodyElement}
 * @description Displays the Score on the DOM
 */
const scoreDisplay = document.getElementById('score');
/**
 * @constant currentHighScoreDisplay
 * @type {HTMLBodyElement}
 * @description Displays the Current High Score on the DOM
 */
const currentHighScoreDisplay = document.getElementById('highScore');
/**
 * @constant livesDisplay 
 * @type {HTMLBodyElement}
 * @description Displays the Lives Counter on the DOM
 */
const livesDisplay = document.getElementById('lives');

/**
 * @constant titleImg
 * @type {SVGImageElement}
 * @description Holds the Asteroid Title Img in memory for use in the script
 */
const titleImg = new Image();
titleImg.src = './assets/graphics/asteroids-arcade-game-logo-sticker.svg'


// Global Functions

/**
 * @function RandomNumber - Random Number Generator 
 * @param {Number} min -Lowest Number in Range
 * @param {Number} max  - Highest Number in Range
 * @returns Random Whole Number (Integers) between the range of min - max
 */
function randomNumber(min,max){
    return Math.floor(Math.random()*Math.floor(max-min) + min)
}

/**
 * @function randomNumberDecimal - Random Decimal Generator
 * @returns Random Decimal (Floating Point) number fixed to 4 decimal places. 
 */
function randomNumberDecimal(){
    return +Math.random().toPrecision(4)
}
/**
 * @function convertRadians
 * @param {Number} degrees in decimal
 * @returns Degrees in Radians
 */
function convertRadians(degrees){
    return +(degrees / 180 * Math.PI)
}
/**
 * @function distanceBetweenPoints
 * @description
 * Takes the cartesian distance between two points A(x,y) and B(x,y) 
 * 
 * @param {Number} x1 - X - Co-ordinate of the Primary Object
 * @param {Number} y1 - Y - Co-ordinate of the Primary Object
 * @param {Number} x2 - X - Co-ordinate of the Secondary Object
 * @param {Number} y2 - Y - Co-ordinate of the Secondary Object
 * @returns Distance in Pixels
 * 
 */
function distanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1)** 2 + (y2 - y1)**2)
}

/**
 * @function distanceBetweenCircles
 * @param {Number} x1 - X - Co-ordinate of the Primary Object
 * @param {Number} y1 - Y - Co-ordinate of the Primary Object
 * @param {Number} r2 - R - Size of the radius of the Primary Object 
 * @param {Number} x2 - X - Co-ordinate of the Secondary Object
 * @param {Number} y2 - Y - Co-ordinate of the Secondary Object
 * @param {Number} r2 - R - Size of the radius of the second Object 
 * @returns 
 * Returns the distance between the center of two circles 
 */   
function distanceBetweenCircles(x1,y1,r1,x2,y2,r2){
    return Math.ceil(Math.sqrt((x2 - x1)**2 + (y2-y1)**2) - (r2+r1))
}
/**
 * @function getImgSize
 * Applies a scaling ratio to the image height and width to work with the canvas.
 */
function getImgSize(){
    let scale = Math.min(model.width/titleImg.width, model.height/titleImg.height)*devicePixelRatio
    titleImg.width = titleImg.width/scale
    titleImg.height = titleImg.height/scale
}





/**
 * @class GameModel 
 * @classdesc Game Settings and methods are defined within the scope of this class. Here we place the primitive values that would be referenced throughout the game. 
 */
class GameModel{
    constructor(){
        /**@this this.FPS - Frames per Second */
        this.FPS = Number(60)
      
        /**@this this.AsteroidArray - Array which would contain the asteroids in the asteroid field */
        this.asteroidField = []

        /**@this this.currentScore - Keeps track of the score */
        this.currentScore = Number(0)
        
        /**@this this.highScoresFromStorage - Obtains the HighScores from the LocalStorage API, if present would return an array of object's each containing a record of the highscores, if not the it would present null */
        this.highScoresFromStorage = (localStorage.getItem('highScores'))?[...JSON.parse(localStorage.getItem('highScores'))] : null
       
        /**@this this.previousHighScore - Takes the previous games highest score if available, else it would return 0 */
        this.previousHighScore = (this.highScoresFromStorage) ? this.highScoresFromStorage[0].score : 0 
       
        /**@this this.shipExploding - Registers a flag if the ship is exploding */
        this.shipExploding = false
        
        /**@this this.lives -**PRIVATE** Number of game lives*/
        this._lives = Number(3)

        /**@this this._playerName - **PRIVATE** stores the players name */
        this._playerName = String()

        /**
        * @this this._width - **PRIVATE** width variable that would store the size of the window width
        */
        this._width = Number();
       
        /**
         * @this this._height - **PRIVATE** Height variable that would store the height of the window
         */
        this._height= Number();
        
        /**@this this.userSettingsFromStorage - Obtains saved User Settings from localStorage. It would return an object containing the user preferred settings */
        this.userSettingsFromStorage = localStorage.getItem('userSettings')? JSON.parse(localStorage.getItem('userSettings')) : null
        
        /**@this this.spaceship_thrust - Uses either the User Thrust value or a default value for the spaceship in the game */
        this.spaceship_thrust =this.userSettingsFromStorage ? this.userSettingsFromStorage.thrust : Number(2)

        /**@this this.spaceship_colorStroke - Uses either the User Color Value for the Spaceship Stroke Colour of the default value of White */
        this.spaceship_colorStroke =this.userSettingsFromStorage ? this.userSettingsFromStorage.colorStroke : String('#FFFFFF')
        
        /**@this this.spaceship_colorFill - Uses either the User Color Value for the Spaceship Fill Colour of the default value of White */
        this.spaceship_colorFill =this.userSettingsFromStorage ? this.userSettingsFromStorage.colorFill : String('#FFFFFF')
        
        /**@this this.spaceship_colorLaser - Uses either the User Color Value for the Spaceship Laser Colour of the default value of Red */
        this.spaceship_colorLaser =this.userSettingsFromStorage ? this.userSettingsFromStorage.colorLaser : String('#FF0000')

        //Getting the Width and Height as soon as the Window loads
        window.addEventListener('load',()=>{
            this.getCanvasDimensions()
        })
        this.getCanvasDimensions();//Just to make sure
       
        //As the window is resized we are getting the new Canvas Dimensions
        window.addEventListener('resize',()=>{
            this.getCanvasDimensions();
        })
       
    }
    //Getters

    /**
     * @this this.width - Returns the width of the canvas
     */
    get width(){
        //This sets the width to the private _width value
        return this._width
    }

    /**
     * @this this.height - Returns the height of the canvas
     */
    get height(){
        //This sets the height to the private _height value
        return this._height
    }

    /**
     * @this this.gameLives - returns a rounded number of the game lives. 
     */
    get gameLives(){
        return +this._lives.toFixed(0)
    }

    /**@this this.get_spaceshipThrust - returns the Thrust value for the Spaceship */
    get get_spaceshipThrust(){
        return +this.spaceship_thrust
    }

    /**@this this.get_shipColorStroke - Returns the SpaceShip Stroke Color */
    get get_shipColorStroke(){
        return this.spaceship_colorStroke
    }

    /**@this this.get_shipColorFill - Returns the Spaceship Fill Color */
    get get_shipColorFill(){
        return this.spaceship_colorFill
    }

    /**@this this.get_shipColorLaser - Returns the Spaceship Laser Color */
    get get_shipColorLaser(){
        return this.spaceship_colorLaser
    }

    // Setters

    /**@this this.set_shipThrust - Sets the Thrust value for the Spaceship*/
    set set_shipThrust(speed){
        return this.spaceship_thrust = Number(speed)
    }

    /**@this this.set_shipColorStroke - Sets the Stroke Color Value for the Spaceship */
    set set_shipColorStroke(color){
        return this.spaceship_colorStroke = String(color)
    }

    /**@this this.set_shipColorFill - Sets the Stroke Color Value for the Spaceship */
    set set_shipColorFill(color){
        return this.spaceship_colorFill = String(color)
    }

    /**@this this.set_shipColorLaser - Sets the Laser Color Value for the Spaceship */
    set set_shipColorLaser(color){
        return this.spaceship_colorLaser = String(color)
    }

    //Methods

    /**
     * @method saveUserSettings
     * @description Stores the Users defined settings to the localStorage API
     */
    saveUserSettings(){
        //Object containing the User Settings
        let settings = {
            colorStroke: this.get_shipColorStroke,
            colorFill: this.get_shipColorFill,
            colorLaser: this.get_shipColorLaser,
            thrust: this.get_spaceshipThrust
        }
        //Converts the Object to a string, then Saves it to LocalStorage
        localStorage.setItem('userSettings',JSON.stringify(settings))
    }

    /**
     * @method resetGameData
     * @description Resets the game of the User data, this includes High Scores and User Settings from localStorage API
     */
    resetGameData(){
        if(confirm('Are you sure you wish to delete all the GAME DATA from memory. This includes all the HighScores and your User Settings from memory?')){
            // Clear the HighScores
            this.highScoresFromStorage = null
            this.previousHighScore = 0
            // Clear the User Settings
            this.userSettingsFromStorage = null
            // Clear the Local Storage
            localStorage.clear()
        }

    }

    /**
     * @method checkScore 
     * @description Checks if the current score is greater than the previous score, Switching the *view.newHighScore* to true
     */
    checkScore(){
        if(this.currentScore > this.previousHighScore){
            view.newHighScore = true
        }
    }
    
    /**
     * @method addScore
     * @description Creates a record of the new high score and captures the players name as well. It then sorts and stores it to the LocalStorage, repopulating the High Score Table with the new values
     */
    addScore(){

        let storageArray = (this.highScoresFromStorage) ? [...this.highScoresFromStorage]:[]
        
        let record = {
            name: this._playerName,
            score: this.currentScore
        }
        storageArray.push(record)
        storageArray.sort(function(a,b){
            return  b.score - a.score
        })
        if(storageArray.length > 5){
            storageArray.pop()
        }
        localStorage.setItem('highScores',JSON.stringify(storageArray))
        this.populateHighScoresList(storageArray,highScoresTable)

    }

    /**
     * @method playerName
     * @description captures the playerName as the input value changes
     */
    playerName(){

       return this._playerName = document.querySelector("#input-playerName").value
    }

    /**
     * @method populateHighScoresList 
     * @param {Array} scoresArray 
     * @param {HTMLOListElement} DOMList 
     * @description Maps a record of the scores as HTML List item's to the HTML Ordered List Element 
     */
    populateHighScoresList(scoresArray = [], DOMList){
        DOMList.innerHTML = scoresArray.map((record)=>{
            return `
            
            <li class="scoreEntry">
            <span class="scoreEntry-Name">${record.name} </span><span class="scoreEntry-Score">${record.score} </span>
            </li>
            
            `
        }).join('');
        //😎
    }
    /**
     * @method getCanvasDimensions
     * @description Obtains the Width and Height of the canvas respective to the viewport and the device's own pixel density. This is to provide accurate values for rendering the elements ont he canvas
     */
    getCanvasDimensions() {
        // Width is determined by the css value for the viewport width this is then respected by the device pixel ratio. This is then used to set the canvas.width value
        this._width = Math.round((Number(getComputedStyle(canvas).getPropertyValue('width').slice(0,-2))/devicePixelRatio) * devicePixelRatio);
        //Setting the canvas width 
        canvas.width = this._width
        
        // height is determined by the css value for the viewport height this is then respected by the device pixel ratio. This is then used to set the canvas.height value
        this._height = Math.round((Number(getComputedStyle(canvas).getPropertyValue('height').slice(0,-2))/devicePixelRatio) * devicePixelRatio);
        //Setting the canvas height
        canvas.height = this._height
        
    }
    /**
     * @method createNewSpaceShip
     * @description Creates a new Spaceship 🚀 object 
     */
    createNewSpaceShip(){
        if(spaceship){
            //Delete the existing spaceship from the global reference
            spaceship = null;
            
        }
        let size = (controller.isMobile)?15:30
        // Create a new Spaceship
        let newSpaceship = new ShipObject(
            model.width /2,
            model.height/2,
            size,
            90,
            360,
            false,
            {x:0,y:0}
        )
         //Making the New Ship immune to Being Exploded
         newSpaceship.immune = true
         //Stop the Explosion
         model.shipExploding = false
         //Make it so the ship is stationary on reload
         newSpaceship.thrusting =false
        //  Replace the Spaceship with the newly created object
        return spaceship = newSpaceship;
    }

    /**
     * @method createAsteroidField 
     * @param {Number} numberOfAsteroids 
     * @description Create the asteroid field based on the number of asteroids requested, by populating the asteroid array with objects of asteroids containing their respective geometries, position and vectors.
     */
    createAsteroidField(numberOfAsteroids){
        
        //clear the existing array
        this.asteroidField = null;
        //Create a new array
        this.asteroidField = new Array();
        //creating place holders
        let x,y,r,i

        for(let index = 0; index< numberOfAsteroids; index++){
            x = randomNumber(0,this.width)
            y = randomNumber(0,this.height)
            r = (controller.isMobile)?randomNumber(30,50): randomNumber(60, 100);
            //Registering the asteroids Index - done purely for debugging reasons
            i = index

            //Creating a buffer zone around the ship to prevent the asteroids randomly spawning on the ship - if the spaceship exists
    
            if(spaceship){
                if(distanceBetweenPoints(spaceship.x,spaceship.y,x,y) <= spaceship.r * 5 + spaceship.r){
                x = randomNumber(0,this.width) + (spaceship.x + spaceship.r + 20);
                y = randomNumber(0,this.height) + (spaceship.y + spaceship.r + 20);
                }
            }
            this.asteroidField.push(this.createNewAsteroid(x,y,r,i))
        }
        return this.asteroidField
    }
    /**
     * @method createAsteroidField
     * @param {Number} x 
     * @param {Number} y 
     * @param {Number} r 
     * @param {Number} asteroidIndex 
     * @description Creates a new Asteroid polygon, and its geometric shape
     */
    createNewAsteroid(x,y,r,asteroidIndex){
        let asteroid = new AsteroidObject(x,y,r,asteroidIndex);
        //Setting the values for the asteroids polygons
        for(let offset = 0; offset < asteroid.vertices; offset++ ){
            asteroid.offsets.push(
               Math.random() * asteroid.jaggedness * 2 + 1 - asteroid.jaggedness
            )
        }
        return asteroid 
    }
    /**
     * @method destroyAsteroid
     * @param {Number} index 
     * @description Destroys the asteroid and spawns two more smaller in its place. It also adds values respective to the size of the asteroid to the current score. 
     */
    destroyAsteroid(index){
        //Getting Asteroid Properties
        let x = this.asteroidField[index].x;
        let y = this.asteroidField[index].y;
        let r = this.asteroidField[index].r;
    
        //split the larger asteroid into two when shot at
       if( r > 50 && r <= 100 ){
           //For Large Asteroids we would be adding 20 pts to the score
           this.currentScore += 20
           //Remove the asteroid that is shot at
           this.asteroidField.splice(index,1)
           //Create the smaller asteroid debris 
           this.asteroidField.push(this.createNewAsteroid(x,y,r/2,index + 1))
           this.asteroidField.push(this.createNewAsteroid(x,y,r/2,index + 2))
        }
        if( r > 25  && r < 50){
            // Medium Sized Asteroids we would add 50 pts to the score
            this.currentScore += 50
            //Remove the asteroid that is shot at
            this.asteroidField.splice(index,1)
            //Create the smaller asteroid debris 
            this.asteroidField.push(this.createNewAsteroid(x,y,r/2,index + 1))
            this.asteroidField.push(this.createNewAsteroid(x,y,r/2,index + 2))
            
       }
       if( r <= 25){
            // The Smallest Asteroids  carry a score of 100 pts
           this.currentScore += 100
           //Remove the smallest asteroid 
           this.asteroidField.splice(index,1)
       }
       
    }
    /**
     * @method screenEdges
     * @param {Object} obj 
     * @description Handles the edges of the screen as objects pass from one end and it would cause them to appear in the opposite side of the frame relative to their entry point. 
     */
    screenEdges(obj){
        if(obj.x < 0 - obj.r){
            obj.x = this.width + obj.r
        }
        else if(obj.x > this.width + obj.r){
            obj.x = 0 - obj.r
        }
        if(obj.y < 0 - obj.r){
            obj.y = this.height + obj.r
        }
        else if(obj.y > this.height + obj.r){
            obj.y = 0 - obj.r
        }
    }
}


//creating a shared object class between asteroids and spaceship

/**
 * @class Basic Object
 * @classdesc a shared object class between ship and asteroid, 
 */
class BasicObject{
    /**
     * 
     * @param {Number} x - Position of Object on X - Axis 
     * @param {Number} y - Position of Object on Y - Axis
     * @param {Number} r - Radius of the Object
     * @param {Number} a - Angle of the Object (in deg)
     */
    constructor(x,y,r,a){
        /**
         * @this this.x -  Position of the Object on the X - Axis
         */
        this.x = Number(x);
        /**
         * @this this.y -  Position of the Object on the Y - Axis
         */
        this.y = Number(y);
        /**
         * @this this.r -  Radius of the Object
         */
        this.r = Number(r);
        /**
         * @this this.a - Angle of the Object - converted to Radians
         */
        this.a = convertRadians(a); //Converted to Radians

    }
}

/**
 * @class ShipObject @extends BasicObject
 * @classdesc 🚀 Object literal containing the values and methods that pertains to the model of the Spaceship 
 */
class ShipObject extends BasicObject{
    /**
     * @constructor
     * @param {Number} x - Position of Object on X - Axis 
     * @param {Number} y - Position of Object on Y - Axis
     * @param {Number} r - Radius of the Object
     * @param {Number} a - Angle of the Object (in deg)
     * @param {Number} rot - 360/deg of turning
     * @param {Boolean} thrusting - Flag- Registers if the ship is thrusting is active
     * @param {Object} thrust - Object contains the thrust vectors for the Ship
     */
    constructor(x,y,r,a,rot,thrusting,thrust){
        /**@extends BasicObject */
        super(x,y,r,a)
     
        /**
         * @this this.rot - spaceship can only rotate around 360deg of a circle  converted to Radians
         */
        this.rot = convertRadians(rot);//Converted it into Radians
     
        /** 
         * @this this.thrust - Provides a vector for the spaceship when travelling
         */
        this.thrust = {...thrust};

        //Ship Flags
        /**
         * @this this.thrusting - Boolean Flag! True when the spaceship trust is active
         */
        this.thrusting = Boolean(thrusting);
        
        /**@this this.immune - Immunity from Explosions Flag */
        this.immune = Boolean(false)
       
        /**@this this.laserStatus - Flag - Registers if the laser is active shooting ON or OFF  */
        this.laserStatus = Boolean(true);
        
        // Laser Properties

        /**@this this.laserArray - Array Element that would store each laser object as they are fired */
        this.laserArray = Array();
        
        /**@this this.laserDistance - Distance the Laser would travel in respects to the screen width; 0 < laserDistance < 1(width) */
        this.laserDistance = 0.5 
        
        // ShipObject's Constants

        /**
         * @this this.SHIP_SIZE 
         * @description CONSTANT: Height of the spaceship in px's - Same as the Radius
         */
        this.SHIP_SIZE = Number(r);
     
        /**
         * @this this.Friction 
         * @description CONSTANT: Adds a Friction co-efficient to the movement of the spaceship:Friction in Space (0 = no friction,x=0.5/50%, 1 = 100% friction)
         */
        this.FRICTION = Number(0.5); 
        
        /**
         * @this this.SHIP_THRUST 
         * @description CONSTANT: Acceleration of the spaceship, 2px/sec^2
         * Getting the ship thrust from user settings
         */
        this.SHIP_THRUST = model.get_spaceshipThrust; // acceleration of the spaceship, px/sec^2
     
        /**
         * @this this.TURN_DEG
         * @description CONSTANT: This is the turning angle of the ship in 360deg/sec. 
         */
        this.TURN_DEG = Number(360); // Turns in deg/sec


    }
    //Methods

    /**
     * @method draw 🎨
     * @description Contains the instructions to draw the 🚀 on the canvas
     */
    draw(){
        if(this.immune){
            //Make the Spaceship golden 
            ctx.strokeStyle = "gold"
            ctx.fillStyle = "gold"
        }else{
            //Giving it some Normal Colors
            ctx.strokeStyle = model.get_shipColorStroke
            ctx.fillStyle = model.get_shipColorFill
        }
       //The outer Triangle
       ctx.beginPath();
       ctx.moveTo(
           //Nose of the spaceship

            this.x + 4 / 3 * this.r * Math.cos(this.a),
            this.y - 4 / 3 * this.r * Math.sin(this.a)
        );
        ctx.lineTo( // rear left
            this.x - this.r * (2 / 3 * Math.cos(this.a) + Math.sin(this.a)),
            this.y + this.r * (2 / 3 * Math.sin(this.a) - Math.cos(this.a))
        );
        ctx.lineTo( // rear right
            this.x - this.r * (2 / 3 * Math.cos(this.a) - Math.sin(this.a)),
            this.y + this.r * (2 / 3 * Math.sin(this.a) + Math.cos(this.a))
        );
        // ctx.fill()
        ctx.closePath();//Finishes of the Outer Triangle
        ctx.stroke();

        //Drawing the Cockpit -inner triangle
        ctx.beginPath();
        ctx.lineWidth = 2;
        
        ctx.moveTo( // top of the cockpit
            this.x - (1 / 5 * this.r - this.SHIP_SIZE) * Math.cos(this.a),
            this.y + (1 / 5 * this.r - this.SHIP_SIZE) * Math.sin(this.a)
        );
        ctx.lineTo( // rear left of the cockpit
            this.x - this.r * (2 / 3 * Math.cos(this.a) +  0.75 * Math.sin(this.a)),
            this.y + this.r * (2 / 3 * Math.sin(this.a) - 0.75 * Math.cos(this.a))
        );
        ctx.lineTo( // rear right of the cockpit
            this.x - this.r * (2 / 3 * Math.cos(this.a) -  0.75 * Math.sin(this.a)),
            this.y + this.r * (2 / 3 * Math.sin(this.a) + 0.75 * Math.cos(this.a))
        );
        ctx.fill();//Fill in the Shape
        ctx.closePath();//Finishes of the Triangle
        ctx.stroke();//Draws it out on the canvas

        if(this.thrusting){
            //Add Thrust vectors 
            this.thrust.x += this.SHIP_THRUST * Math.cos(this.a) / model.FPS **1/2;
            this.thrust.y -= this.SHIP_THRUST * Math.sin(this.a) / model.FPS **1/2 ;
            //Draw thrust animation
            ctx.beginPath();
            ctx.strokeStyle = "yellow";
            ctx.fillStyle = "red"
            ctx.lineWidth = 2;
            ctx.moveTo( // rear center behind the spaceship
                this.x - 5/3 * this.r * Math.cos(this.a),
                this.y + 5/3 * this.r * Math.sin(this.a)
            );
            ctx.lineTo( // rear left
                this.x - this.r * (2 / 3 * Math.cos(this.a) +  0.75 * Math.sin(this.a)),
                this.y + this.r * (2 / 3 * Math.sin(this.a) - 0.75 * Math.cos(this.a))
            );
            ctx.lineTo( // rear right
                this.x - this.r * (2 / 3 * Math.cos(this.a) -  0.75 * Math.sin(this.a)),
                this.y + this.r * (2 / 3 * Math.sin(this.a) + 0.75 * Math.cos(this.a))
            );
            ctx.fill();//Fill in the Shape
            ctx.closePath();//Finishes of the Triangle
            ctx.stroke();
        }
        
        //Applying Friction to slow down the spaceship when Not thrusting
        if(!this.thrusting){
            this.thrust.x -= this.FRICTION * this.thrust.x / model.FPS
            this.thrust.y -= this.FRICTION * this.thrust.y / model.FPS
            
        }
        //Laser 
        this.drawLasers()

        //Rotate spaceship
        this.a += this.rot

        //Move the spaceship
        this.x += this.thrust.x;
        this.y += this.thrust.y;

        //handle screen edges
        model.screenEdges(this)
        
    }
    /**
     * @method explodeShip 💣
     * @description Contains the instructions to draw the explosion of the ship on the canvas, It also instructs to reduce the lives counter upon impact
     */
    explodeShip(){
        //Prevent the ship from moving
       if(!this.immune){ 
           this.thrust = {
                x:0,
                y:0
            }
        }
        //Stop the ship from shooting when exploding
        this.laserStatus = false

        //Drawing the Explosion
        ctx.beginPath();
        //Outermost circle - Dark Orange
        ctx.strokeStyle = '#db4200';
        ctx.fillStyle='#db4200'
        ctx.arc(this.x,this.y, this.r +10, 0, Math.PI * 2, false);
        ctx.fill()
        ctx.stroke();
        // n-1 circle - Orange
        ctx.beginPath();
        ctx.strokeStyle = '#f26900';
        ctx.fillStyle='#f26900'
        ctx.arc(this.x,this.y, this.r + 5, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.stroke()
        // n-2 circle - Yellow
        ctx.beginPath();
        ctx.strokeStyle = '#f29d00';
        ctx.fillStyle='#f29d00'
        ctx.arc(this.x,this.y, this.r + 2, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.stroke();
        //Reduce the Life 💀
        model._lives -= (1/model.FPS)
    }
    /**
     * @method drawLaser 🎨
     * @description contains the instructions to draw the laser on the canvas
     */
    drawLasers(){

        //Applying the lasers
        //Looping backwards through the laser array
        for(let laserIndex = this.laserArray.length-1 ; laserIndex >= 0; laserIndex-- ){
            //Calculate the distance travelled
            this.laserArray[laserIndex].distanceTravelled += 
                Math.sqrt(this.laserArray[laserIndex].vX**2 + this.laserArray[laserIndex].vY**2);
            // Desktop Displays
            if(!controller.isMobile && this.laserArray[laserIndex].distanceTravelled > 
                    this.laserDistance * model.width){
                        this.laserArray.splice(laserIndex,1)
                    }
            // Making Adjustments if the device is in portrait mode - we take the distance from the height of the viewport
            if(controller.isMobile && window.innerHeight > window.innerWidth && this.laserArray[laserIndex].distanceTravelled > this.laserDistance * model.height){
                this.laserArray.splice(laserIndex,1)
            }
            // Making Adjustments if the device is in landscape mode - we take the distance from the height of the viewport
            if(controller.isMobile && window.innerWidth > window.innerHeight && this.laserArray[laserIndex].distanceTravelled > this.laserDistance * model.width){
                this.laserArray.splice(laserIndex,1)
            }
        }
        
        //Draw each laser
        this.laserArray.forEach((laser,index) => {

            ctx.fillStyle = model.get_shipColorLaser
            ctx.beginPath();
            ctx.arc(laser.x,laser.y,this.SHIP_SIZE/8,0,Math.PI*2,false);
            ctx.fill();
            ctx.closePath();
            
            //move the laser
            laser.x += laser.vX
            laser.y += laser.vY

            //Handling the edge of screen adjustments for the laser
            //Slightly different to the model.screenEdges function
            
            if(laser.x < 0 || 
                laser.x > model.width || 
                laser.y < 0 || 
                laser.y > model.height){
                //Removing the Laser as goes off the screen as suggested by bb8
                this.laserArray.splice(index,1)
            }
            
           
        })
    }
    /**
     * @method shootLasers 🌠
     * @description Provides the instruction on creating each individual laser as it is shot from the ship
     */
    shootLasers(){
        //create the laser object
        /**@constant LASER_SPEED - Speed of the Laser in px/sec*/
        const LASER_SPEED = 300
        /**@constant LASER_MAX - Maximum number of laser objects that can be created */
        const LASER_MAX = 25 
        
        if(this.laserStatus && this.laserArray.length < LASER_MAX){
            //Creating a laser object 
            this.laserArray.push({
                //Shooting from the nose of the ship;
                x:this.x + 4 / 3 * this.r * Math.cos(this.a),
                y:this.y - 4 / 3 * this.r * Math.sin(this.a),
                //Applying the velocity
                vX: LASER_SPEED * Math.cos(this.a) / model.FPS,
                vY: -LASER_SPEED * Math.sin(this.a) / model.FPS,
                distanceTravelled:0//Tracks the distance of the laser travelling
            })
           
        }
        //Last Laser fired
        if(this.laserArray.length >= LASER_MAX){
            this.laserArray.push({
                //Fire one last laser object 
                x:this.x + 4 / 3 * this.r * Math.cos(this.a),
                y:this.y - 4 / 3 * this.r * Math.sin(this.a),
                vX: LASER_SPEED * Math.cos(this.a) / model.FPS,
                vY: -LASER_SPEED * Math.sin(this.a) / model.FPS,
                distanceTravelled:0
            })
            //Resetting the array 
            this.laserArray = []
        }
    
        //Asteroid 2 Laser Collision Detection
        model.asteroidField.forEach((asteroid,asteroidIndex)=>{

            this.laserArray.forEach((laser,laserIndex)=>{
                
                if(distanceBetweenPoints(laser.x,laser.y,asteroid.x,asteroid.y) < (Math.PI/2) * asteroid.r){
                
                    //destroy asteroid
                    model.destroyAsteroid(asteroidIndex)
                    //remove the laser
                    this.laserArray.splice(laserIndex,1)
                }
            })
        })
    }
}


/**
 * @class AsteroidObject  @extends BasicObject
 * @classdesc Object literal containing the values and methods that pertains to the model for each  Asteroid object 🌚
 */
class AsteroidObject extends BasicObject {
    /**
     * @constructor
     * @param {Number} x - Position of the Object on the X-Axis 
     * @param {Number} y - Position of the Object on the Y-Axis
     * @param {Number} r - Radius/Size of the Object
     * @param {Number} asteroidIndex - Index of the Object
     */
    constructor(x,y,r,asteroidIndex){
        super(x,y,r)
        /**@this this.a - returns a random angle in radians */
        this.a = Math.random() * Math.PI * 2
        /**@this this.vX - random Velocity on the x-axis  */
        this.vX =randomNumber(5,10)/model.FPS * (randomNumberDecimal() <0.5 ? 1 : -1)
        /**@this this.vY - random Velocity on the y-axis  */
        this.vY = randomNumber(5,10)/model.FPS * (randomNumberDecimal() <0.5 ? 1 : -1)
        /**@this this.vertices - Random number of vertices for the polygon to be generated */
        this.vertices =Math.floor(randomNumber(2,8) + randomNumber(2,8)),//Each asteroid has a random number of vertices
        /**@this this.jaggedness - random determination on the amount of jaggedness on the asteroid */
        this.jaggedness = randomNumberDecimal(), // 0 = none 1 = 100
        /**@this this.offsets - Array of positions for the dimensions of the polygon */
        this.offsets = []
        /**@this this.asteroidIndex - Asteroid Index position in the Array */
        this.asteroidIndex = Number(asteroidIndex);
    }
    /**
     * @method draw 🎨
     * @description Contains the instructions to draw the 🌚 on the canvas
     */
    draw(){
        //Draw Asteroids
        ctx.strokeStyle = '#BADA55';
        ctx.lineWidth = 2;
        ctx.fillStyle = 'transparent';
        //draw a path
        ctx.beginPath();
            ctx.moveTo(
        this.x + (this.offsets[0]  * this.r) * Math.cos(this.a),
        this.y + (this.offsets[0]  * this.r) * Math.sin(this.a)
        )
        //draw the polygon and jaggedness to each asteroid
        for(let polygon = 1; polygon < this.vertices; polygon++){
            ctx.lineTo(
                this.x + (this.offsets[polygon] * this.r) *  Math.cos(this.a + polygon * Math.PI * 2 / this.vertices),
                this.y + (this.offsets[polygon] * this.r)*  Math.sin(this.a + polygon * Math.PI * 2 / this.vertices)
                )
            }
        ctx.fill();
        ctx.closePath();
        ctx.stroke();
        
        //Handle collision Detection - only if the spaceship exists else ignore collision detection
        this.asteroid2asteroidCollision()
        if(spaceship){
            this.asteroid2shipCollision()    

        }
        
        //move asteroid
        this.x += this.vX
        this.y += this.vY
        
        //handle edge of screen
        model.screenEdges(this)

        
    }
    /**
     * @method asteroid2asteroidCollision 🌒↔🌚*🌚↔🌘
     * @description Preforms a form of soft ricochet between each asteroid if they happen to collide with each others radial distance from its center. 
     */
    asteroid2asteroidCollision(){
        let currentAsteroid = this;
        model.asteroidField.forEach((otherAsteroid)=>{
            if(currentAsteroid != otherAsteroid){
                if(distanceBetweenCircles(currentAsteroid.x,currentAsteroid.y,currentAsteroid.r,otherAsteroid.x,otherAsteroid.y,otherAsteroid.r) < currentAsteroid.r + currentAsteroid.x){
                    //Make the asteroids 'softly' ricochet off each other
                    //There has been many different attempts at getting this right, this is by far the best attempt at getting the asteroids to move off and change direction and their velocity that produces the least amount of Janking

                    currentAsteroid.vX = currentAsteroid.vX/( (model.FPS / 2))  + Math.sin(-currentAsteroid.a) 
                    otherAsteroid.vX = otherAsteroid.vX/ (model.FPS / 2)  + Math.sin(-otherAsteroid.a) 

                    currentAsteroid.vY = currentAsteroid.vY/ (model.FPS / 2)  + Math.cos(-currentAsteroid.a)  
                    otherAsteroid.vY = otherAsteroid.vY/ (model.FPS / 2)  + Math.cos(-otherAsteroid.a)

                }
            }
        })
    }
    /**
     * @method asteroid2asteroidCollision 
     * @description Registers that the 🚀 has collided with the 🌑 
     */
    asteroid2shipCollision(){
        if(distanceBetweenPoints(this.x,this.y,spaceship.x,spaceship.y) < spaceship.r + this.r && !spaceship.immune){
            // register that the ship is exploding 
            model.shipExploding = true
        }

    }
    
}



class GameView{
    constructor(){

        /**
         * @this this.newHighScore - Flag for if a new high Score is set to record a view change from winners text to game over display
         */
        this.newHighScore = false
       
       //RequestAnimationFrames reference numbers
       /**@this this.startRaF - Registers the RequestAnimationFrame number for the start screen */ 
       this.startRaF
       /**@this this.settingsRaF - Registers the RequestAnimationFrame number for the settings screen */ 
       this.settingsRaF
       /**@this this.gameRaF - Registers the RequestAnimationFrame number for the game screen*/ 
       this.gameRaF    
       /**@this this.endRaF - Registers the RequestAnimationFrame number  for the end screen*/ 
       this.endRaF
    
    }
    //Methods
    /**
     * @method startScreen
     * @description Contains the contextual information for the visual information to be displayed on the screen
     */
    startScreen(){

        //Block scope
        // Clearing the Output Display
        outputDisplay.innerHTML=""
        //Creating an asteroid Field
        if(model.asteroidField.length == 0){

            if(controller.isMobile) {
                //Reducing the number of asteroids to prevent screen clutter on lower sizes and mobile devices
                model.createAsteroidField(randomNumber(2,6))
            }else{
                model.createAsteroidField(randomNumber(5,13))
            }
        }

        
        // Getting the Title screen Image
        
        document.addEventListener('resize',getImgSize) // This is to keep Image responsive to the viewport being resized.
        
        //Setting a value for the Blinker duration
        let blinkDuration = 360;

        // Creating a HTML Button Element on the DOM for mobiles
        let btnStartGame = document.createElement('button')
        // Applying CSS class
        btnStartGame.classList.add('btn-start')
        // Setting Button Name Attribute
        btnStartGame.setAttribute('name','Start Game')
        // Setting Button ARIA Label
        btnStartGame.setAttribute('aria-label','Start Game')
        // Applying Event Listener to the button
        btnStartGame.addEventListener('click',()=>{
            this.gameScreen()
        })
        
        // Creating a HTML Button Element on the DOM for Settings Page
        let btnSettings = document.createElement('button')
        // Applying CSS class
        btnSettings.classList.add('btn-settings')
        // Setting Button Name Attribute
        btnSettings.setAttribute('name','Game Settings')
        // Setting Button ARIA Label
        btnSettings.setAttribute('aria-label','Game Settings')
        // Applying Event Listener to the button
        btnSettings.addEventListener('click',()=>{
            // Loads Settings Screen
            this.settingsScreen()
        })
        // Game Creator Credits
        let credits = document.createElement('h2')
        credits.classList.add('credits')
        credits.innerText = "created by aFuzzyBear - 2020"
        
        // If Mobile Append the btnStartGame to the DOM, else ignore
        controller.isMobile ? outputDisplay.append(btnStartGame,btnSettings,credits) : outputDisplay.append(btnSettings,credits)
        
        

        
 


        /**
         * @function startAnimationLoop
         * The Animation loop for the Start Screen
         */


        function startAnimationLoop(){
            // Cancelling all previous StartScreen Animation Frame
            cancelAnimationFrame(view.startRaF)
            cancelAnimationFrame(view.settingsRaF)
            cancelAnimationFrame(view.gameRaF)
            cancelAnimationFrame(view.endRaF)
            // Clears the Display
            ctx.clearRect(0,0,model.width,model.height);
            // Cover the Canvas with a square
            ctx.fillRect(0,0,model.width,model.height);
            // Painting it black
            ctx.fillStyle = 'black'
    
            //Drawing each asteroid on the screen
            model.asteroidField.forEach((asteroid)=>{
                asteroid.draw()
            })
            // Making the Title Image responsive to the width of the canvas: 500px 
            if(model.width < 500){
    
                ctx.drawImage(titleImg, model.width/2 - titleImg.width/6,50,titleImg.width/3,titleImg.height/3)
            }else{
                
                ctx.drawImage(titleImg, model.width/2 - titleImg.width/4,50,titleImg.width/2,titleImg.height/2)
            }
    
            // Making the Player Start Text blink
            if(blinkDuration % 30 != 0){
                ctx.strokeStyle = 'gold'
                ctx.lineWidth = 1
                ctx.font = '2.5rem hyperspace'
                ctx.strokeText('1 PLAYER', model.width/2-50 ,model.height - 150)
                if(controller.isMobile){
                    ctx.strokeText('TAP TO START', model.width/2 -70 ,model.height - 100)
                }else{
                    ctx.strokeText('ENTER TO START', model.width/2 -95 ,model.height - 100)
                }
            }

            // Reset the blink timer on the Outer Block scope
            if(blinkDuration == 0){
                blinkDuration = 360
            }

            //Decrease the Blinker
            setInterval(()=>{
                blinkDuration -- 
            },model.FPS)
            
            
            // Screen Specific Event Handler
           
                window.addEventListener('keydown',controller.startGame)

        
            //Assigning the value of the requestAnimationFrame to a variable
           view.startRaF= requestAnimationFrame(startAnimationLoop)
    
        }

      
        //Requesting Animation Loop for the Start Screen
        startAnimationLoop()
    }
    settingsScreen(){
        //Block Scope
        // Get the btnSettings from the DOM
        let btnSettings = document.querySelector("body > div > div.container-arcade > div.panel-center > div > div.js-output > button")
        
        // Remove the btnSettings from the Screen by hiding it
        if(btnSettings) btnSettings.classList.add('hide')

        // Keep the title logo
        document.addEventListener('resize',getImgSize) 

        // Wrapper - Title
        let wrapper_settingsTitle=document.createElement('div')
        wrapper_settingsTitle.classList.add('wrapper-title')
        // Title
        let title = document.createElement('h2')
        title.innerText = 'Settings'.toUpperCase()
        // Appending the element to the wrapper
        wrapper_settingsTitle.append(title)

        // Wrapper - Input Stroke Colour
        let wrapper_inputSpaceshipColorStroke=document.createElement('div')
        wrapper_inputSpaceshipColorStroke.classList.add('wrapper' ,'inputColorStroke')
        // Input Stroke Colour
        let input_spaceshipColorStroke = document.createElement('input')
        // Assigning Attributes
        Object.assign(input_spaceshipColorStroke,{
            type:'color',
            id:'input_spaceshipColorStroke',
            name: 'input_spaceshipColorStroke',
            value: `${model.get_shipColorStroke}`,
        })
        input_spaceshipColorStroke.classList.add('input-color')
        input_spaceshipColorStroke.addEventListener('input',controller.inputShipStokeColor)
        // Label for Input Stroke Colour
        let label_spaceshipColorStroke = document.createElement('label')
        label_spaceshipColorStroke.setAttribute('for','input_spaceshipColorStroke')
        label_spaceshipColorStroke.classList.add('label')
        label_spaceshipColorStroke.innerText = "Spaceship Primary Color"
        // Appending children to its parent
        wrapper_inputSpaceshipColorStroke.append(label_spaceshipColorStroke,input_spaceshipColorStroke)
        
        // Wrapper - Input Fill Colour
        let wrapper_inputSpaceshipColorFill=document.createElement('div')
        wrapper_inputSpaceshipColorFill.classList.add('wrapper','inputColorFill')
        // Input Fill Colour
        let input_spaceshipColorFill = document.createElement('input')
        Object.assign(input_spaceshipColorFill,{
            type:'color',
            id:'input_spaceshipColorFill',
            name: 'input_spaceshipColorFill',
            value: `${model.get_shipColorFill}`
        })
        input_spaceshipColorFill.classList.add('input-color')
        input_spaceshipColorFill.addEventListener('input',controller.inputShipFillColor)
        // Label  for Input Fill Colour
        let label_spaceshipColorFill = document.createElement('label')
        label_spaceshipColorFill.setAttribute('for','input_spaceshipColorFill')
        label_spaceshipColorFill.classList.add('label')
        label_spaceshipColorFill.innerText = "Spaceship Secondary Color"
        // Appending children to its parent
        wrapper_inputSpaceshipColorFill.append(label_spaceshipColorFill,input_spaceshipColorFill)
        
        
        // Wrapper - Input Laser Colour
        let wrapper_inputSpaceshipColorLaser=document.createElement('div')
        wrapper_inputSpaceshipColorLaser.classList.add('wrapper','inputColorLaser')
        // Input Laser Colour
        let input_spaceshipColorLaser = document.createElement('input')
        // Assigning Attributes
        Object.assign(input_spaceshipColorLaser,{
            type:'color',
            id:'input_spaceshipColorLaser',
            name: 'input_spaceshipColorLaser',
            value:`${model.get_shipColorLaser}`
        })
        input_spaceshipColorLaser.classList.add('input-color')
        input_spaceshipColorLaser.addEventListener('input',controller.inputShipLaserColor)
        
        // Label for Input Laser Colour
        let label_spaceshipColorLaser = document.createElement('label')
        label_spaceshipColorLaser.setAttribute('for','input_spaceshipColorLaser')
        label_spaceshipColorLaser.classList.add('label')
        label_spaceshipColorLaser.innerText="Spaceship Laser Color"
        // Appending children to its parent
        wrapper_inputSpaceshipColorLaser.append(label_spaceshipColorLaser,input_spaceshipColorLaser)
        
        // Wrapper - Input Ship Thrust
        let wrapper_inputSpaceshipThrust=document.createElement('div')
        wrapper_inputSpaceshipThrust.classList.add('wrapper','inputThrust')
        // Input Ship Thrust
        let input_spaceshipThrust = document.createElement('input')
        Object.assign(input_spaceshipThrust,{
            type:'range',
            id:'input_spaceshipThrust',
            name: 'input_spaceshipThrust',
            min:'1',
            max:'3',
            value:`${model.get_spaceshipThrust}`,
            step:'0.1'
        })
        input_spaceshipThrust.classList.add('input-range')
        input_spaceshipThrust.addEventListener('input',controller.inputShipThrust)
        
        // Label for Input Ship Thrust
        let label_spaceshipThrust = document.createElement('label')
        label_spaceshipThrust.setAttribute('for','input_spaceshipThrust')
        label_spaceshipThrust.classList.add('label')
        label_spaceshipThrust.innerText = "Spaceship Speed"
        // Appending children to its parent
        wrapper_inputSpaceshipThrust.append(label_spaceshipThrust,input_spaceshipThrust)
        
        // Wrapper - Button Reset
        let wrapper_btnReset=document.createElement('div')
        wrapper_btnReset.classList.add('wrapper_btnReset')
        //  Button - Reset Memory
        let btn_clearMemory = document.createElement('button')
        btn_clearMemory.classList.add('btn-reset')
        btn_clearMemory.setAttribute('aria-label','Clear All Game Data')
        btn_clearMemory.innerText = 'Reset Game Data'
        btn_clearMemory.addEventListener('click',controller.clearMemory)
        // Appending children to its Parent
        wrapper_btnReset.append(btn_clearMemory)
        
        // Wrapper - Button Close Settings
        let wrapper_btnClose=document.createElement('div')
        wrapper_btnClose.classList.add('wrapper_btnClose')
        // Button Close Settings
        let btn_closeSettings = document.createElement('button')
        btn_closeSettings.classList.add('btn-close')
        btn_closeSettings.setAttribute('aria-label','Close Settings Page')
        btn_closeSettings.innerText = 'Close'
        btn_closeSettings.addEventListener('click',()=>{
            view.startScreen()
        })
        // Appending children to its Parent
        wrapper_btnClose.append(btn_closeSettings)
        
        // Wrapper - Parent Container for all the children
        let container_settings = document.createElement('div')
        container_settings.classList.add('container-settings')
        // Wrapper - Container for all the settings Inputs
        let container_spaceshipSettings = document.createElement('div')
        container_spaceshipSettings.classList.add('container-spaceshipSettings')
        // Appending All the Children in order to the Settings Wrapper
        container_spaceshipSettings.append(wrapper_inputSpaceshipColorStroke,wrapper_inputSpaceshipColorFill,wrapper_inputSpaceshipColorLaser,wrapper_inputSpaceshipThrust)

        // Appending the rest of the children to the Parent wrapper
        container_settings.append(wrapper_settingsTitle,wrapper_btnClose,container_spaceshipSettings,wrapper_btnReset)
        // Appending this to the DOM 
        outputDisplay.append(container_settings)       

        /**
         * @function settingsAnimationLoop
         * @description Uses RequestAnimationFrame to load the content of the screen
         */
        function settingsAnimationLoop(){

             // Cancelling any previous StartScreen Animation Frame
             cancelAnimationFrame(view.startRaF)
             cancelAnimationFrame(view.settingsRaF)
             cancelAnimationFrame(view.gameRaF)
             cancelAnimationFrame(view.endRaF)
             // Clears the Display
             ctx.clearRect(0,0,model.width,model.height);
             // Painting it black
             ctx.fillStyle = 'black'
             ctx.fillRect(0,0,model.width,model.height);
     
             //Drawing each asteroid on the screen
             model.asteroidField.forEach((asteroid)=>{
                 asteroid.draw()
             })
             // Removing the title Img from the smaller displays,  
             if(model.width > 500){

                ctx.drawImage(titleImg, model.width/2 - titleImg.width/4,50,titleImg.width/2,titleImg.height/2)
             }
             
             // Repopulating the Asteroid Field once they have all been cleared
            if(model.asteroidField.length === 0) {
                if(controller.isMobile) {
                    // Reducing the number of asteroids to prevent screen clutter on lower sizes
                    model.createAsteroidField(randomNumber(2,6))
                }else{
                    model.createAsteroidField(randomNumber(5,10))
                }
            }
            view.settingsRaF = requestAnimationFrame(settingsAnimationLoop)
        }

        // Calling the Settings Animation Loop
        settingsAnimationLoop()
    }
    /**
     * @method gameScreen
     * @description Contains the contextual information for visual rendering of the game screen
     */
    gameScreen(){


        //Games Block Scope
        let shipSize
        
        if(controller.isMobile){
            shipSize = 15
            model.createAsteroidField(2,6)
        }else{
            shipSize = 30
            model.createAsteroidField(5,10)
        }
       
        // Create a New Ship object on the block scope
        spaceship = new ShipObject(
        model.width /2,
        model.height/2,
        shipSize,
        90,
        360,
        false,
        {x:0,y:0}
        );
        
        
        // Clearing the outputDisplay
        outputDisplay.innerHTML=""
        
        //  Creating Controller GUI for mobile displays
        
        if(controller.isMobile){
            // Creating a Container Div for th GUI elements to be contained in
            let mobileGUI = document.createElement('div')
           
            // Button - Rotate Left
            let btn_rotateLeft = document.createElement('button')
            btn_rotateLeft.setAttribute('aria-label','Rotate Spaceship Counter Clockwise')
            btn_rotateLeft.classList.add('btn-rotateLeft')
            
            // Button - Rotate Right
            let btn_rotateRight = document.createElement('button')
            btn_rotateRight.setAttribute('aria-label','Rotate Spaceship Clockwise')
            btn_rotateRight.classList.add('btn-rotateRight')
            
            // Wrapper
            let btn_column = document.createElement('div')
            btn_column.classList.add('btn-column')
            
            // Button - Thrust
            let btn_thrust = document.createElement('button')
            btn_thrust.setAttribute('aria-label','Engage Thrusters')
            btn_thrust.classList.add('btn-thrust')
            
            // Button - Laser
            let btn_laser = document.createElement('button')
            btn_thrust.setAttribute('aria-label','Fire Lasers!')
            btn_laser.classList.add('btn-laser')

             // Applying CSS Class
             mobileGUI.classList.add('container-rotateButtons')
             // Appending it to the DOM
             btn_column.append(btn_laser,btn_thrust)
             mobileGUI.append(btn_rotateLeft,btn_column,btn_rotateRight)
             outputDisplay.appendChild(mobileGUI)
             

        }
        
        // Requesting Animation Loop for the Game Screen
         this.gameAnimationLoop()
        
    }
    /**
     * @method gameAnimationLoop
     * @description Demonstrating another way of calling a request Animation Loop outwith the internal closure of a function. Plus this way I can ensure that the game would run independent of anything else, (there was a bug that caused this outcome)
     */
    gameAnimationLoop(){
        // Cancelling all previous versions of Request Animation Frames that might still persist on the window
       
       cancelAnimationFrame(view.startRaF)
       cancelAnimationFrame(view.settingsRaF)
       cancelAnimationFrame(view.gameRaF)
       cancelAnimationFrame(view.endRaF)
       // Clearing the Previous Render
       ctx.clearRect(0,0,model.width,model.height)
       // Create a new Frame
       ctx.fillRect(0,0,model.width,model.height);
       // Paint it Black - No colours any more
       ctx.fillStyle = 'black'

       // If the spaceship exists 
      if(spaceship){ 
          if(!model.shipExploding) {
           // Draw the 🚀
           spaceship.draw()  
           }else{
               //  Explode the ship💥
               spaceship.explodeShip();

               // Timeout's to carry out these functions after a certain period of time.        
               setTimeout(model.createNewSpaceShip,1000)
               
               setTimeout(()=>{
               // Removing the ships immunity after 5 secs
                   spaceship.immune = false
               
               },5000)

           } 
       }
       // Repopulating the Asteroid Field once they have all been cleared
       if(model.asteroidField.length === 0) {
           if(controller.isMobile) {
               // Reducing the number of asteroids to prevent screen clutter on lower sizes
               model.createAsteroidField(randomNumber(2,6))
           }else{
               model.createAsteroidField(randomNumber(5,10))
           }
       }


       // Drawing each asteroid on the screen
       model.asteroidField.forEach((asteroid)=>{
           asteroid.draw()
       })

       // Display the Lives Counter on the Screen
       livesDisplay.innerText = `LIVES\n ${model.gameLives}`
       
       // Display the Highest Score from the previous Game on the Screen
       currentHighScoreDisplay.innerText = `HIGH SCORE\n ${(model.currentScore > model.previousHighScore) ?'NEW HIGH SCORE': model.previousHighScore}`

       // Display the Score on the Screen
       scoreDisplay.innerText = `SCORE\n ${model.currentScore}`

       // Game Over 
       if(model.gameLives == 0){
           view.endScreen()
       }

       // Remove Event Listeners from the previous Screen

       outputDisplay.removeEventListener('click',controller.startGame)
       window.removeEventListener('keydown',controller.startGame)

       // Apply the event Listeners
       if(controller.isMobile){
           window.addEventListener('pointerdown',controller.pointerDown) 
           window.addEventListener('pointerup',controller.pointerUp) 
       }
       else{
           window.addEventListener('keydown',controller.keyDown)
           window.addEventListener('keyup',controller.keyUp)
       }

       // Assigning the requestAnimationFrame to a variable
       view.gameRaF = requestAnimationFrame(view.gameAnimationLoop)
   }

    /**
     * @method endScreen
     * @description contains the contextual information for the rendering the contents on the End Screen
     */
    endScreen(){

        
        // Making FireWorks
        /**
         * I wanted to display fireworks at the end when the User earns a new HighScore. I found the following algorithm and applied it to fit the game.
         * @tutorial https://slicker.me/javascript/fireworks.htm
         */
        /**@constant max_fireworks - Max number of Fireworks to be generated */
        const max_fireworks = controller.isMobile ? 4 : 8
        /**@constant max_sparks - Max number of sparks that is made from each firework */
        const max_sparks = controller.isMobile ? 10 : 25;
        /**@let - fireworksArray - Array storing the Firework Objects as they are made */
        let fireworksArray = []
        // For-loop to generate the individual firework objects
        for(let firework = 0; firework < max_fireworks; firework++){
            // Each firework has an array of where each sparkler effect is stored in
            let firework = {
                sparks:[]
            }
            for(let index = 0; index < max_sparks; index++){
                // Generating the sparkler
                let sparkler = {
                    vX: randomNumber(15,30)/model.FPS * (randomNumberDecimal() <0.5 ? 1 : -1),
                    vY: randomNumber(15,30)/model.FPS * (randomNumberDecimal() <0.5 ? 1 : -1),
                    weight: randomNumber(1,4), //size of the sparkles
                    color: `rgb(${randomNumber(0,255)},${randomNumber(0,255)},${randomNumber(0,255)})`
                }
                firework.sparks.push(sparkler)
                
            }
            fireworksArray.push(firework)
            // providing some extra de-facto information to the firework
            resetFirework(firework)
        }
        /**
         * @function resetFirework
         * @param {Object} firework 
         * Provides reset and default values for the fireworks
         */
        function resetFirework(firework){
            // Random Position on the X-axis
            firework.x = randomNumberDecimal()* model.width
            // Bottom of the screen
            firework.y = model.height;
            // Keeps track of the time the firework exists for
            firework.age = 0;
            // Applies the Flying 'phase' of the firework
            firework.status = 'fly'
        }
    
        function explodeFirework(){
            // Clear the screen after each explosion
            ctx.clearRect(0,0, model.width,model.height);
            // Looping through the firework Array
            fireworksArray.forEach((firework,index)=>{
                // Checks the status of the firework
                if(firework.status == 'explode'){
                    // While the firework is exploding Draw the sparklers
                    firework.sparks.forEach(spark =>{
                        for(let index = 0; index < 4; index++){
                            // Defining some properties
                            let trailAge = firework.age * index 
                            let x = firework.x + spark.vX * trailAge * randomNumberDecimal()**2
                            let y = firework.y + spark.vY * trailAge * randomNumberDecimal()**2
                            let fade = randomNumberDecimal()
                            let color = `rgb(${randomNumber(0,255)*fade},${randomNumber(0,255)*fade},${randomNumber(0,255)*fade},1)`
                            // Draw the sparklers
                            ctx.beginPath();
                            ctx.fillStyle = color;
                            ctx.arc(x,y,spark.weight,0,2*Math.PI)
                            ctx.fill()
                        }
                    });
                    // Increase the Age of the firework
                    firework.age++
                    // Make the firework reset if it gets to old or just by pure randomness
                    if(firework.age > model.FPS*1.5 && randomNumberDecimal() < 0.5){
                        resetFirework(firework)
                    }
                }
                else{
                    firework.y = firework.y - 10
                    // This draws the firework tail on the canvas
                    for(let spark = 0; spark < 10; spark++){
                        ctx.beginPath()
                        ctx.fillStyle= `rgba(${index * 50}, ${spark * 17}, 0,${randomNumberDecimal()})`
                        ctx.rect(firework.x , firework.y + spark*5, 4,4)
                        ctx.fill()
                    }
                }
                // Sets the conditions when the firework would explode
                if(randomNumberDecimal() < 0.01 || firework.y < randomNumber(25,150)) firework.status = 'explode'
                
            })
        }
        // End of Fireworks

        // Check the Score - If the current Game is higher than the previous game then it would return and change the view.newHighScore to true
        model.checkScore()
        
        // Bring back the JS-Output overlay
        outputDisplay.classList.remove('credits')
        outputDisplay.classList.remove('hide')
        
        // Create a DOM element to display the List of Previous High Scores
        let highScoresOutput = document.createElement('div')
        // Apply a CSS class to the element
        highScoresOutput.classList.add('highScoresDisplay')
        // Append to the DOM
        highScoresOutput.append(highScoresTable)
        //This is the author credits that would be sent to the DOM
        outputDisplay.innerHTML=
        `
            <h2 class='credits'>
            created by aFuzzyBear - 2020
            </h2>
        `
        // Create a DOM Element to display the winner's Screen text
        let winnersText = document.createElement('div')
        // Apply a CSS class to the element
        winnersText.classList.add('newHighScore')
        // Defining the inner HTML that would be rendered on the DOM

        let title_wrapper = document.createElement('div')
        title_wrapper.classList.add="title-wrapper"
        let title = document.createElement('h2')    
        title.innerText = "Congratulations on Setting a New High Score"
        
        let form = document.createElement('div')
        form.classList.add("form-wrapper")
        let inputPlayerName = document.createElement('input')
        inputPlayerName.classList.add('form-input')
        // Assigning the input properties 
        Object.assign(inputPlayerName,{
            type: 'text',
            name:'playerName',
            id:'input-playerName',
            placeholder:'Enter Name',
            inputmode:'text',
            autocomplete:'name'
        })
        // Applying Event Listener
        inputPlayerName.addEventListener('change',()=>{
            // Capturing the Players name
            model.playerName()
        })

        let btnAddScore = document.createElement('button')
        btnAddScore.classList.add('btnAddScore')
        btnAddScore.setAttribute('type','submit')
        btnAddScore.setAttribute('aria-label','submit score')
        btnAddScore.innerText='Submit'
        // btnAddScore.setAttribute('onclick',"model.addScore()")
        btnAddScore.addEventListener('click',()=>{
            model.addScore()
        })
        form.append(inputPlayerName,btnAddScore)
        title_wrapper.append(title,form)
        winnersText.append(title_wrapper)


        // Creating a DOM Button Element as a  Reset Button
        let btnRestart = document.createElement('button');
        // Apply a CSS Class to the Element
        btnRestart.classList.add('btn-restart')
        btnRestart.setAttribute('aria-label','Restart Game')
        // Placing the Text inside the button
        btnRestart.innerText = 'Restart Game'

        // If there is a new High Score 
        if(this.newHighScore){
            // Winners Screen
            outputDisplay.appendChild(highScoresOutput)
            outputDisplay.append(winnersText)
            outputDisplay.append(btnRestart)            
        }
        else{
            //Game over Text
            outputDisplay.appendChild(highScoresOutput)
            outputDisplay.append(btnRestart)            

        }

        // Populate the HighScores List
        model.populateHighScoresList((model.highScoresFromStorage) ? [...model.highScoresFromStorage]:[],highScoresTable)
       
        // Apply an event listener to the button
        btnRestart.addEventListener('click',()=>{
            //Reload the window to reset the game 
            controller.restart()
        })

        
        function endAnimationLoop(){
            // Another Demonstration of CancelAnimation Frame this time within a requestAnimation recursive Loop
            cancelAnimationFrame(view.startRaF)
            cancelAnimationFrame(view.settingsRaF)
            cancelAnimationFrame(view.gameRaF)
            cancelAnimationFrame(view.endRaF)
            // Clear the Previous Screen
            ctx.clearRect(0,0,model.width,model.height)
            // Draw a new Screen
            ctx.fillRect(0,0,model.width,model.height)
            // I wanna see it painted, painted black
            // Black as night, black as coal
            ctx.fillStyle = 'black'
            
            // Determine which output to display
            if(view.newHighScore){
                //Winners Screen has Fireworks exploding
                explodeFirework()
            }else{
                // Game-Over Screen 
                //Drawing each asteroid on the screen
                model.asteroidField.forEach((asteroid)=>{
                asteroid.draw()
                })
            }
             // Remove the PreventDefault from Bubbling through the DOM
            // window.removeEventListener('mousedown',controller.removeDefault)
            // window.removeEventListener('keydown',controller.removeDefault)
            // Assigning requestAnimationFrame value to a variable
            view.endRaF = requestAnimationFrame(endAnimationLoop)
        }


        // Request the AnimationLoop
        endAnimationLoop()
    }

}   

/**
 * @class GameController
 * @classdesc Defines the Event Handlers and controls the interactions between the User, the game model and its objects with the game view. 
 */
class GameController{
    constructor(){}
    /**
     * @this this.isMobile - Tests if the platform is a Mobile device or not
     */
    get isMobile(){
        // credit to Timothy Huang for this regex test: 
        // https://dev.to/timhuang/a-simple-way-to-detect-if-browser-is-on-a-mobile-device-with-javascript-44j3
        // if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
            // credit to @max_ganiev
            if(window.matchMedia("(pointer: coarse)").matches){
            return true
       }
       else{
            return false
       }
    } 

    // Methods for User Settings
    /**
     * @method inputShipFillColor
     * @param {InputEvent} event 
     * @description Saves the Spaceship Fill Colour
     */
    inputShipFillColor(event){
        model.set_shipColorFill = event.target.value
        model.saveUserSettings()
    }
    
    /**
     * @method inputShipFillColor
     * @param {InputEvent} event 
     * @description Saves the Spaceship Stroke Colour
     */
    inputShipStokeColor(event){
        model.set_shipColorStroke = event.target.value
        model.saveUserSettings()
    }
    
    /**
     * @method inputShipLaserColor
     * @param {InputEvent} event 
     * @description Saves the Spaceship Laser Colour
     */
    inputShipLaserColor(event){
        model.set_shipColorLaser = event.target.value
        model.saveUserSettings()
    }
    
    /**
     * @method inputShipThrust
     * @param {InputEvent} event 
     * @description Saves the Spaceship Thrust Value
     */
    inputShipThrust(event){
        model.set_shipThrust = event.target.value
        model.saveUserSettings()
    }


    // Methods to move the ship
    /**
     * @method spaceshipRotateClockwise
     * @description Rotate The Ship Clockwise
     */
    spaceshipRotateClockwise(){
        return spaceship.rot = convertRadians(spaceship.TURN_DEG) / model.FPS
    }

    /**
     * @method spaceshipRotateAntiClockwise
     * @description Rotate the Spaceship AntiClockwise
     */
    spaceshipRotateAntiClockwise(){
        return spaceship.rot = -convertRadians(spaceship.TURN_DEG) / model.FPS
    }

    /**
     * @method spaceshipRotateStop
     * @description Stops the ship from rotating
     */
    spaceshipRotateStop(){
        // Stop the Ship from rotating
        return spaceship.rot = 0
    }
    /**
     * @method spaceshipThrusting
     * @param {Boolean} trueOrFalse
     * @description Switches the Spaceship Thrusting Flag to True if the thrust is Active, False if the Thrust is Deactivated
     *  
     */
    spaceshipThrusting(trueOrFalse){
        // Move the Ship True is Thrusting False is not Thrusting
        return spaceship.thrusting = trueOrFalse
    }
    /**
     * @method spaceshipShootLaser
     * @description Fires the laser
     */
    spaceshipShootLaser(){
        // Fire the Lasers
        return spaceship.shootLasers();
    }
    
    //Methods that control the  Game Views
    
    /**
     * @method startGame
     * @param {PointerEvent} click
     * @param {KeyboardEvent} Enter 
     * @description Instructs the game to start 
     */
    startGame(event){
        switch(event.type){
            case 'click':
                view.gameScreen()
                break
        }
        switch(event.code){
            case 'Enter':
                view.gameScreen()
                break
        }
    }
    /**
     * @method restart
     * @description Clears the previous game model and data then returns a new instance of the game
     */
    restart(){
        // Clearing the previous game data
        model = null
        // clearing the values from the score displays
        livesDisplay.innerText = ''
        scoreDisplay.innerText = ''
        currentHighScoreDisplay.innerText = ''
        
        //re-instantiating the game model 
        model = new GameModel()
        
        //Display the start screen
        view.startScreen()
    }
    /**
     * @method clearMemory
     * @description Clears the LocalStorage API of all previous game data, re-instantiate a new game model
     */
    clearMemory(){
        if(confirm('Are you sure you want to do this, ALL GAME DATA WOULD BE ERASED')){
            // Clear LocalStorage from all previous Game Data
            localStorage.clear()
            // Clearing the previous game data
            model = null
            // clearing the values from the score displays
            livesDisplay.innerText = ''
            scoreDisplay.innerText = ''
            currentHighScoreDisplay.innerText = ''
            
            //re-instantiating the game model 
            model = new GameModel()

        }
    }
    // When the document loads we wish to start the game
    onLoad(){
        // Instantiating a new Game Model
        model = new GameModel()
        
        // Display the Start Screen
        return view.startScreen()
    }
    /**
     * @method openSettingsScreen
     * @description Switches the view to the Settings Screen
     */
    openSettingsScreen(){
        view.settingsScreen()
    }
    /**
     * @method closeSettingsScreen
     * @description Switches the view to the Start Screen
     */
    closeSettingsScreen(){
        view.startScreen()
    }
    // Event Handlers

    /**
     * @method keyDown
     * @param {KeyboardEvent} event 
     * Applies the relevant Handler application when the keys are pressed 
     */
    keyDown(event){
        // Applying EventHandlers when keys are pressed
        switch(event.code){
            case "ArrowUp":
                // Remove the default behaviour of the event to move the page about
                event.preventDefault()
                controller.spaceshipThrusting(true)
                break
            case "KeyW":
                //Start Ship Thrusting
                controller.spaceshipThrusting(true)
                break
            case "ArrowRight":
                event.preventDefault()
                controller.spaceshipRotateAntiClockwise()
                break
            case "KeyD":
                //Rotate Ship Anti-Clockwise
                controller.spaceshipRotateAntiClockwise()
                break
            case "ArrowLeft":
                event.preventDefault()
                controller.spaceshipRotateClockwise()
                break
            case "KeyA":
                //Rotate Ship Clockwise
                controller.spaceshipRotateClockwise()
                break
            case "Space":
                //shoot laser
                event.preventDefault()
                controller.spaceshipShootLaser()
                break
        }

    }
   
    /**
     * @method keyUp
     * @param {KeyboardEvent} event 
     * Removes the relevant Handler application when the keys are released 
     */
    keyUp(event){
        switch(event.code){
            case "ArrowUp":
                //Stop Thrusting
                event.preventDefault()
                controller.spaceshipThrusting(false)
                break
            case "KeyW":
                //Stop Thrusting
                controller.spaceshipThrusting(false)
                break
            case "ArrowRight":
                //Rotate 
                event.preventDefault()
                controller.spaceshipRotateStop()
                break
            case "KeyD":
                //Rotate 
                controller.spaceshipRotateStop()
                break
            case "ArrowLeft":
                event.preventDefault()
                //Start Thrusting
                controller.spaceshipRotateStop()
                break
            case "KeyA":
                //Start Thrusting
                controller.spaceshipRotateStop()
                break
        }    
    }

   /**
    * @method pointerDown
    * @param {PointerEvent} event 
    * @description Applies the relevant Handler application when the buttons are pressed on the mobileGUI
    */
    pointerDown(event){
        event.preventDefault()
        
        switch (event.target.className) {
            case 'btn-rotateLeft':
                controller.spaceshipRotateClockwise()
                break;
            case 'btn-rotateRight':
                controller.spaceshipRotateAntiClockwise()
                break;
            case 'btn-thrust':
                controller.spaceshipThrusting(true)
                break;
            case 'btn-laser':
                controller.spaceshipShootLaser()
                break
        }
    }
    /**
    * @method pointerUp
    * @param {PointerEvent} event 
    * @description Removes the relevant Handler application when the buttons are pressed on the mobileGUI
    */
    pointerUp(event){
        event.preventDefault()
        switch (event.target.className) {
            case 'btn-rotateLeft':
                controller.spaceshipRotateStop()
                break;
                
            case 'btn-rotateRight':
                controller.spaceshipRotateStop()
                break;
        
            case 'btn-thrust':
                controller.spaceshipThrusting(false)
                break;
        }
    }
}
//Global Scope
let spaceship,model
// Instantiating the Game View
let view = new GameView()
// Instantiating the Game Controller
let controller = new GameController()
// Making the Game Load when the DOM contents have finished Loading
window.addEventListener('load',controller.onLoad())


// Registering Service Worker
// https://developers.google.com/web/fundamentals/primers/service-workers
if('serviceWorker' in navigator){
    window.addEventListener('load',()=>{
        navigator.serviceWorker.register('./sw.js')
        .then((registration)=>{
            // Successful Registration of the Service Worker
            console.log('Service Worker was successfully Registered to the Scope: ', registration.scope)
        }).catch(error=>{
            // Failed Registration of the Service Worker
            console.log('Service Worker registration failed: ', error)
        })
    })
}