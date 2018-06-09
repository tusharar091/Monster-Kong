//creating game window 360*640
var game=new Phaser.Game(360,640,Phaser.AUTO);

//only one state for this game
var GameState={
    
    //used to define game-level settings
    init : function()
    {
        //It utilizes the scale-space but keep the same aspect ratio on devices with different resolution
        this.scale.scaleMode=Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally=true;
        this.scale.pageAlignVertically=true;
        
        //Enabling arcade physics engine globally
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        
        //setting gravity scale value on y direction
        this.game.physics.arcade.gravity.y=1000;
        
        //defining game boundary
        this.game.world.setBounds(0,0,360,700);
        
        //this.cursors represents up,down,left,right keys on keyboard to which access is given by game.input.keyboard
        this.cursors=this.game.input.keyboard.createCursorKeys();
        
        //defining running an jumping speed for the player
        this.RUNNING_SPEED=180;
        this.JUMPING_SPEED=550;
    },
    
    //preloading the assets used to create gameObjects in game
     preload : function()
    {
        this.load.image('actionButton','assets/images/actionButton.png');
        this.load.image('arrowButton','assets/images/arrowButton.png');
        this.load.image('barrel','assets/images/barrel.png');
        this.load.image('gorilla','assets/images/gorilla3.png');
        this.load.image('ground','assets/images/ground.png');
        this.load.image('platform','assets/images/platform.png');
        
        this.load.spritesheet('player','assets/images/player_spritesheet.png',28,30,5,1,1);
        this.load.spritesheet('fire','assets/images/fire_spritesheet.png',20,21,2,1,1);
        
        //loading json file which contains the game-content data such as sprite locations
        this.load.text('levelJSON','assets/data/level.json');
    },
    
    //Used to create gameObjects out of preloaded assets
    create :  function()
    {
        //parsing JSON to extract game-content data
        this.levelData=JSON.parse(this.game.cache.getText('levelJSON'));
        
        //adding ground sprite at the bottom of the game window
        this.ground=this.game.add.sprite(this.levelData.groundPos.x,this.levelData.groundPos.y,'ground');
        
        //enabling physics locally to the ground and disabling gravity on it
        this.game.physics.arcade.enable(this.ground);
        this.ground.body.allowGravity=false;
        
        //making it immovable so that it doesn't move with collision (static rigibody)
        this.ground.body.immovable=true;
            
        //creating group of platform sprites which are similar
        this.platformGroup=this.game.add.group();
        
        //Enabling physics on all the sprites which belong to platformGroup(platform Sprites)
        this.platformGroup.enableBody=true;
        
    
        //Iterating over platform sprite's position given in JSON file(platform Data) to place the sprites in the game window
        this.levelData.platformData.forEach(function(element){
            
            //creating sprites at the position specified and adding them to the platformGroup
            this.platformNew=this.platformGroup.create(element.x,element.y,'platform');
        
        },this);
        
        //Enabling immovabiltiy and disabling gravity at once for all sprites belonging to platformGroup
        this.platformGroup.setAll('body.immovable',true);
        this.platformGroup.setAll('body.allowGravity',false);
        
        //creating group for fire sprite which will be placed at different locations
        this.fires=this.game.add.group();
        
        //enabling physics on all the fire sprites
        this.fires.enableBody=true;
        
        //Iterating over fire sprite's position given in JSON file(fire Data) to place the sprites in the game window
        this.levelData.fireData.forEach(function(element){
            
            //creating sprites at the position specified and adding them to the fireGroup
            this.fire=this.fires.create(element.x,element.y,'fire');
            
            //adding spritesheet animation to fire sprite and playing it on creation
            this.fire.animations.add('fire',[0,1],4,true);
            this.fire.play('fire');
        },this);
        
        //disabling gravity
        this.fires.setAll('body.allowGravity',false);
        
        
        //creating group of barrels (barrel sprites) and enabling physics on it
        this.barrels=this.game.add.group();
        this.barrels.enableBody=true;
        
        //function to create barrel at position specified in JSON file
        this.createBarrel();
        
        //calling createBarrel every five seconds(barrelFrequency) by using timer loop.
        this.barrelCreator=this.game.time.events.loop(Phaser.Timer.SECOND*this.levelData.barrelFrequency,this.createBarrel,this);
        
        //Adding gorrilla as a goal and placing it in game window using JSON file
        this.goal=this.game.add.sprite(this.levelData.goal.x,this.levelData.goal.y,'gorilla');
        
        //enabling physics and disabling gravity
        this.game.physics.arcade.enable(this.goal);
        this.goal.body.allowGravity=false;

        //creating player at position specified in JSON file and setting the inital frame to 3 in spritesheet
        this.player=this.game.add.sprite(this.levelData.playerStart.x,this.levelData.playerStart.y,'player',3);
        this.player.anchor.setTo(0.5);
        
        //adding spritesheet animation which will be played when player moves either left or right
        this.player.animations.add('walking',[0,1,2,1],6,true);
        
        //enabling physics and making it collide with the game boundary so that it doesn't fall out of the game
        this.game.physics.arcade.enable(this.player);
        this.player.body.collideWorldBounds=true;
        
        //customParams will hold info whether the player is moving left, right or up(jumping)
        this.player.customParams={};
        
        //camera is not static and will follow the player
        this.game.camera.follow(this.player);
        
        //creating on screen touch controls
        this.createOnScreenControls();
        
    },
    
    //creating pool of objects(barrels) to avoid memory overflow and use the existing barrels which are out of the game window(recycling)
    createBarrel : function()
    {
        //Get the first barrel which is out of the game window(false), if true it'll return the first barrel created in game window
        var barrel=this.barrels.getFirstExists(false);
        
        //if no barrel is out of the window create new barrels , else use the existing ones given by above statement
        if(!barrel)
            {
                //creating barrels at initial position 0,0 and adding them to barrels group
                barrel=this.barrels.create(0,0,'barrel');
                
            }
        
        //making the barrel colliding with the game  boundary to avoid fall
        barrel.body.collideWorldBounds=true;
        
        //once it touches the game boundary it will bounce back in opposite direction.
        barrel.body.bounce.set(1,0);
        
        //reseting position to the position of goal(gorrila sprite)
        barrel.reset(this.levelData.goal.x,this.levelData.goal.y);
        
        //Giving it initial velocity in x given by barrelSpeed in JSON
        barrel.body.velocity.x=this.levelData.barrelSpeed;
    },
    
    //called every frame
    update : function()
    {
        //enabling collision between player-ground, player-platform
        this.game.physics.arcade.collide(this.player,this.ground);
        this.game.physics.arcade.collide(this.player,this.platformGroup);
        
        //enabling overlapping b/w player-fire, player-barrel and player-goal
        this.game.physics.arcade.overlap(this.player,this.fires,this.killPlayer);
        this.game.physics.arcade.overlap(this.player,this.goal,this.wonGame);
        this.game.physics.arcade.overlap(this.player,this.barrels,this.killPlayer);
        
        //enabling collision b/w barrel-ground and barrel-platform
        this.game.physics.arcade.collide(this.barrels,this.platformGroup,this.landed);
        this.game.physics.arcade.collide(this.barrels,this.ground,this.landed);

        //Player's velocity is zero when no key is being pressed
        this.player.body.velocity.x=0;
        
        //if left key is pressed or onscreen control is moveLeft
        if(this.cursors.left.isDown||this.player.customParams['moveLeft']==true)
            {
                //move the player left by running speed
                this.player.body.velocity.x=-this.RUNNING_SPEED;
                //default sprite direction is left
                this.player.scale.setTo(1,1);
                //playing the animation
                this.player.play('walking');
            }
        //if right key is pressed or on screen control is moveRight
        else if(this.cursors.right.isDown||this.player.customParams['moveRight']==true)
            {
                //move the player right
                this.player.body.velocity.x=this.RUNNING_SPEED
                
                //change the spritesheet direction from left to right
                this.player.scale.setTo(-1,1);
                //playing the animation
                this.player.play('walking');
            }
        //if no key is pressed
        else{
            
            //stopping the animation
            this.player.animations.stop();
            
            //changing back the frame to default frame(3)
            this.player.frame=3;
        }
        //if upArrow is pressed or onScreen control is mustJump
        if((this.cursors.up.isDown||this.player.customParams['mustJump']==true)&&this.player.body.touching.down)
            {
                //moving the player upwards by giving velocity in negative y
                this.player.body.velocity.y= -this.JUMPING_SPEED;
                
            }
        //iterating over each barrel in barrels group 
        this.barrels.forEach(function(element){
            //if barrelPos is out of game bounds 
            if(element.x<this.levelData.barrelBounds.x&&element.y>this.levelData.barrelBounds.y)
                {
                    //kill the barrel so that it can be reused by pool of objects
                    element.kill();
                }
        },this);
    },

    //Restart the game(gameState) once the player is killed
    killPlayer : function(player,fire)
    {
       game.state.start('GameState'); 
    },
    
    //Restart the game if player reaches the goal
    wonGame :  function(player, goal)
    {
        game.state.start('GameState');
    },
    
    //onScreen touch controls
    createOnScreenControls : function()
    {
        //button for left movement
        this.leftArrow=this.game.add.button(this.levelData.left.x,this.levelData.left.y,'arrowButton');
        this.leftArrow.alpha=0.5;
        //set customParam  moveLeft to true when button is clicked
        this.leftArrow.events.onInputDown.add(function(){
            this.player.customParams['moveLeft']=true;
        },this);
        
        //set customParam moveLeft to false when button is not clicked
         this.leftArrow.events.onInputUp.add(function(){
            this.player.customParams['moveLeft']=false;
        },this);
        
        //set customParam  moveLeft to true when button is hovered on
        this.leftArrow.events.onInputOver.add(function(){
            this.player.customParams['moveLeft']=true;
        },this);
        
        //set customParam  moveLeft to false when button is not hovered on
         this.leftArrow.events.onInputOut.add(function(){
            this.player.customParams['moveLeft']=false;
        },this);
        
        //controls buttons doesn't move with camera and are fixed at a position
        this.leftArrow.fixedToCamera=true;
        
        //same as above for right, customParam boolean is moveRight instead of moveLeft
        this.rightArrow=this.game.add.button(this.levelData.right.x,this.levelData.right.y,'arrowButton');
        this.rightArrow.alpha=0.5;
        
        this.rightArrow.events.onInputDown.add(function(){
            this.player.customParams['moveRight']=true;
        },this);
        
         this.rightArrow.events.onInputUp.add(function(){
            this.player.customParams['moveRight']=false;
        },this);
        
        this.rightArrow.events.onInputOver.add(function(){
            this.player.customParams['moveRight']=true;
        },this);
        
         this.rightArrow.events.onInputOut.add(function(){
            this.player.customParams['moveRight']=false;
        },this);
        
        this.rightArrow.fixedToCamera=true;
        
        //up Button , functioning same as above , customParam boolean is mustJump
        this.actionButton=this.game.add.button(this.levelData.up.x,this.levelData.up.y,'actionButton');
        this.actionButton.alpha=0.5;
        
        this.actionButton.events.onInputDown.add(function(){
            this.player.customParams.mustJump=true;
            
        },this);
        
        this.actionButton.events.onInputUp.add(function(){
            this.player.customParams.mustJump=false;
        },this);
        
        this.actionButton.events.onInputOver.add(function(){
            this.player.customParams.mustJump=true;
            
        },this);
        
        this.actionButton.events.onInputOut.add(function(){
            this.player.customParams.mustJump=false;
        },this);
        
        this.actionButton.fixedToCamera=true;
    }
   
}

//adding gameState to game and starting the gameState.
game.state.add('GameState',GameState);
game.state.start('GameState');