(function () {
  $(document).ready(function () {
   var game = {};

   game.contextPlayer = document.getElementById("playerCanvas").getContext("2d");
   game.contextEnemy = document.getElementById("enemyCanvas").getContext("2d");
   game.contextScore = document.getElementById("scoreCanvas").getContext("2d");
   game.contextStars = document.getElementById("starsCanvas").getContext("2d");

   game.width = 800;
   game.height = 600;
   game.score = 0;

   game.images = [];
   game.doneImages = 0;
   game.requiredImages = 0;

   game.enemies = [];
   game.enemySpawnRate = 2500;
   game.lastSpawn = 1;
   game.enemySpawnSpeed = 2;

   game.stars = [];
   game.starSpawnRate = 2000;
   game.starSpawnSpeed = 2;
   game.lastSpawnStar = 1;

   game.pickSound = new Audio("sounds/pickUp.mp3");
   game.enemySound = new Audio("sounds/ahhh.mp3");
   game.startSound = new Audio("sounds/hallow.mp3");
  //save the starting time(used to calc elapsed time)
   game.startTime = Date.now();
   game.time = 0;
   game.gameOver = false;
   game.gameWon = false;

   game.player = {
      x: game.width / 2 - 250,
      y: game.height - 250,
      width: 70,
      height: 100,
      speed: 3,
      rendered: false,
      velX: 0,
      velY: 0,
      jumping: false
   };
     game.keys = [];
     game.friction = 0.8;
     game.gravity = 0.2;

   $(document).keydown(function(e) {
       //alert(e.keyCode);
       game.keys[e.keyCode ? e.keyCode : e.which] = true;
   });
   $(document).keyup(function(e){
       delete game.keys[e.keyCode ? e.keyCode : e.which];
   });
  
  function spawnRandomEnemy() {
     if (Math.random() < 0.50) {
         game.enemies.push({
              x: 800,
              y: 420,
              width: 40,
              height: 40,
              image: 1,
              spawn: false
          });
       }
     }

  function addStarGroup() {
	if(Math.random() < 0.50) {
	   for(y = 0; y < 2; y++) {
       for(x = 0; x < 4; x++) {
          game.stars.push({
             x: (x*20) + 750 + (10*x),
             y: (y*20) + 270 + (10*y),
             width: 15,
             height: 15,
             image: 3,
             dead: false,
             deadTime: 10
          });
         }
      }
   }
 }
   
  function init() {
      game.startSound.play();
      spawnRandomEnemy();
      addStarGroup();
      loop();
  }  

  function update() {
     stopSound();
    // left arrow and 'a' key
     if(game.keys[37] || game.keys[65]) {     
        if(game.player.x > 0) {
            game.player.x -= game.player.speed;
            game.player.rendered = false;
         }
     }
     //right arrow amd 'd' key
     if(game.keys[39] || game.keys[68]) {
        if(game.player.x <= game.width - game.player.width) {
            game.player.x += game.player.speed;
            game.player.rendered = false;
        }
     }
      // space key
     if(game.keys[32]) {
        if(!game.player.jumping) {
            game.player.jumping = true;
            game.player.velY = -game.player.speed*2;
            game.player.rendered = false;
        }
     }
    // player jump     
      game.player.velX *= game.friction;
      game.player.velY += game.gravity;
      game.player.x += game.player.velX;
      game.player.y += game.player.velY;
    // limit player move  
     if(game.player.x >= game.width - game.player.width) {
         game.player.x = game.width - game.player.width;
      }else if(game.player.x <= 0) {
         game.player.x = 0;
     }
    //grounding player
    if(game.player.y >= (game.height - 150) - game.player.height) {
        game.player.y = (game.height - 150) - game.player.height;
        game.player.jumping = false;
     }
   // spawn pumkins 
     var time = Date.now();
     if(time >(game.lastSpawn + game.enemySpawnRate)) {
         game.lastSpawn = time;
         spawnRandomEnemy();
     } 
  //spawn stars
     if(time >(game.lastSpawnStar + game.starSpawnRate)) {
         game.lastSpawnStar = time;
         addStarGroup();
     }

  // collision pumpkins
     for(m in game.enemies) {
       if(collision(game.enemies[m], game.player)) {
	         game.player.dead = true;
           game.enemySound.play();
           game.gameOver = true; 
       // console.log("collision");
	      } else if(game.score >= 500) {
	          game.gameWon = true;
	    } 
     }
    
     for(i in game.enemies) {
          game.enemies[i].x -= 1;
      if(game.enemies[i].x <= -game.enemies[i].width) {
            game.enemies.splice(i,1);
          }
     }
   //collision stars/player
     for(c in game.stars) {
       if(collision(game.stars[c], game.player)) {
	        game.stars[c].dead = true;
          game.score ++;
	        game.pickSound.play();
	        game.contextStars.clearRect(game.stars[c].x,game.stars[c].y,game.stars[c].width,game.stars[c].heigth);
	      }
     }
     for(i in game.stars) {
       if(game.stars[i].dead) {
	        game.stars[i].deadTime--;
        }
       if(game.stars[i].dead && game.stars[i].deadTime <=0) {
          game.contextStars.clearRect(game.stars[i].x,game.stars[i].y,game.stars[i].width,game.stars[i].height);
          game.stars.splice(i,1);
       }
    } 
}

 //function RENDER clear canvas and draw new image
  function render() {

    if(!game.player.rendered) {
       game.contextPlayer.clearRect(game.player.x-3, game.player.y,game.player.width+6, game.player.height);
       game.contextPlayer.drawImage(game.images[0],game.player.x, game.player.y, game.player.width, game.player.height);
       game.player.rendered = true;
    }

    if(game.player.jumping) {
       game.contextPlayer.clearRect(game.player.x, game.player.y-50,game.player.width, game.player.height+100);
       game.contextPlayer.drawImage(game.images[2],game.player.x, game.player.y, game.player.width, game.player.height);
       game.player.rendered = true;
    }

    if(!game.player.jumping) {
       game.contextPlayer.clearRect(game.player.x, game.player.y-50,game.player.width, game.player.height+100);
       game.contextPlayer.drawImage(game.images[0],game.player.x, game.player.y, game.player.width, game.player.height);
       game.player.rendered = true;
    }

    for(i in game.enemies) {
        var enemy= game.enemies[i]; 
        enemy.x -= game.enemySpawnSpeed;
        game.contextEnemy.clearRect(enemy.x, enemy.y, enemy.width+4, enemy.height);
        game.contextEnemy.drawImage(game.images[enemy.image], enemy.x, enemy.y, enemy.width, enemy.height);
     }

    for(i in game.stars) {
	      var star = game.stars[i];
        star.x -= game.starSpawnSpeed;
        game.contextStars.clearRect(star.x, star.y, star.width+2, star.height);
	      game.contextStars.drawImage(game.images[star.image], star.x, star.y, star.width, star.height);
     }

     if(game.gameOver) {
        game.contextEnemy.clearRect(0, 0, game.width, game.height);
        game.contextStars.clearRect(0, 0, game.width, game.height);
        game.contextPlayer.clearRect(0, 0, game.width, game.height);

        game.contextPlayer.font = "bold 50px monaco";
        game.contextPlayer.fillStyle= "black";
        game.contextPlayer.fillText("Game Over", game.width /2 - 120,game.height/2);
     }

     if(game.gameWon) {
        game.contextEnemy.clearRect(0, 0, game.width, game.height);
        game.contextStars.clearRect(0, 0, game.width, game.height);
        game.contextPlayer.clearRect(0, 0, game.width, game.height);

        game.contextPlayer.font = "bold 50px monaco";
        game.contextPlayer.fillStyle= "black";
        game.contextPlayer.fillText("You Win!", game.width /2 - 120,game.height/2);
     }

     game.contextScore.clearRect(0, 0, game.width, game.height); 
     game.contextScore.fillStyle ="black";
     game.contextScore.font ="bold 30px helvetica";
     game.contextScore.fillText("Score: ", 50,50); 
     game.contextScore.fillText(game.score,150,50);
  }

  function stopSound(){
    if(game.gameOver){ 
      game.enemySound = new Audio();
     }
  }
   
  function loop() {
     requestAnimFrame(function(){
      loop();
     });
     update();
     render();
  } 

  function collision(first,second) {
	  return !(first.x > second.x + second.width ||
		     first.x + first.width <second.x ||
			   first.y >second.y + second.height ||
			   first.y + first.height < second.y);		
	}

  function initImages(paths) {
    game.requiredImages = paths.length;
    for(i in paths) {
        var img = new Image();
        img.src = paths[i];
        game.images[i] = img;
        game.images[i].onload = function() {
        game.doneImages++;
       }
     }
  }

  function checkImages(){
    if(game.doneImages >= game.requiredImages) {
       init();
     }else {
       setTimeout(function(){
         checkImages();
         }, 1);
      }
  }
    
  initImages(["images/brian.png", "images/pumpkin.png", "images/brianJump.png", "images/star.png", "images/background.png"]);
  checkImages();
 });
})();

//Cross-browser support for requestAnimationFrame
  window.requestAnimFrame = (function () {
    return  window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function (callback) {
              window.setTimeout(callback, 1000 / 60);
            };
})();
