var game=new Phaser.Game(360,640,Phaser.AUTO);

var GameState={
    init : function()
    {
        this.scale.scaleMode=Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally=true;
        this.scale.pageAlignVertically=true;
        
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.arcade.gravity.y=1000;
        this.game.world.setBounds(0,0,360,700);

        this.cursors=this.game.input.keyboard.createCursorKeys();
        
        this.RUNNING_SPEED=180;
        this.JUMPING_SPEED=550;
    },
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
        
        this.load.text('levelJSON','assets/data/level.json');
    },
    
    create :  function()
    {
        this.ground=this.game.add.sprite(0,638,'ground');
        this.game.physics.arcade.enable(this.ground);
        this.ground.body.allowGravity=false;
        this.ground.body.immovable=true;
            
        this.levelData=JSON.parse(this.game.cache.getText('levelJSON'));
        console.log(this.levelData);
        this.platformGroup=this.game.add.group();
        
        this.platformGroup.enableBody=true;
        
    
        
        this.levelData.platformData.forEach(function(element){
            this.platformNew=this.platformGroup.create(element.x,element.y,'platform');
        
        },this);
        
        this.platformGroup.setAll('body.immovable',true);
        this.platformGroup.setAll('body.allowGravity',false);
        
        

        this.player=this.game.add.sprite(this.levelData.playerStart.x,this.levelData.playerStart.y,'player',3);
        this.player.anchor.setTo(0.5);
        this.player.animations.add('walking',[0,1,2,1],6,true);
        this.game.physics.arcade.enable(this.player);
        
        this.player.customParams={};
        
        this.game.camera.follow(this.player);
        
        this.createOnScreenControls();
        
    },
    
    update : function()
    {
        this.game.physics.arcade.collide(this.player,this.ground, this.landed);
        this.game.physics.arcade.collide(this.player,this.platformGroup,this.landed);
        
        this.player.body.velocity.x=0;
        
        if(this.cursors.left.isDown||this.player.customParams['moveLeft']==true)
            {
                this.player.body.velocity.x=-this.RUNNING_SPEED;
            }
        else if(this.cursors.right.isDown||this.player.customParams['moveRight']==true)
            {
                this.player.body.velocity.x=this.RUNNING_SPEED;
            }
        if((this.cursors.up.isDown||this.player.customParams['mustJump']==true)&&this.player.body.touching.down)
            {
                this.player.body.velocity.y= -this.JUMPING_SPEED;
                this.player.customParams['mustJump']=false;
            }
        
    },
    
    landed : function(player, ground)
    {
        console.log('landed');
    },
    
    createOnScreenControls : function()
    {
        this.leftArrow=this.game.add.button(20,535,'arrowButton');
        this.leftArrow.alpha=0.5;
        this.leftArrow.events.onInputDown.add(function(){
            this.player.customParams['moveLeft']=true;
        },this);
        
         this.leftArrow.events.onInputUp.add(function(){
            this.player.customParams['moveLeft']=false;
        },this);
        
        this.leftArrow.events.onInputOver.add(function(){
            this.player.customParams['moveLeft']=true;
        },this);
        
         this.leftArrow.events.onInputOut.add(function(){
            this.player.customParams['moveLeft']=false;
        },this);
        
        this.leftArrow.fixedToCamera=true;
        
        this.rightArrow=this.game.add.button(100,535,'arrowButton');
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
        
        this.actionButton=this.game.add.button(280,535,'actionButton');
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

game.state.add('GameState',GameState);
game.state.start('GameState');