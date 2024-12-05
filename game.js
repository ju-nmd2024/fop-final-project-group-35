let gameState = "start"; // Possible states: "start", "game", "end"
let buttonX = 150;
let buttonY = 480;
let buttonWidth = 400;
let buttonHeight = 100;
let x = 500, y = 700; // Initial position of the fairy

let monsterHealth =15; 
let littleMonsters = [];
let lastSpawnTime = 0; // Tracks the last spawn time for little monsters
let spawnInterval = 3500; // Spawn every 5 seconds

let winCondition = false; // Tracks if the player has won

let scaleFactor  =0.5;
let scaledX = x - (246 * scaleFactor);
let scaledY = y + (90 * scaleFactor);

let monsterHitCount = 0; // Track the number of hits on the monster

let lastMoveTime = 0; // Tracks the last time the fairy moved
let maxIdleTime = 5000; // 5 seconds maximum idle time

// Movement flags
let thrustingLeft = false;
let thrustingRight = false;

// Projectiles arrays
let projectiles = [] ; 


//Little monster 
let lilMonsterX = 350, lilMonsterY = 60;
// Monster properties
let monsterX = 350, monsterY = 60;
let monsterHit = false;
let hitTimer = 0; // Timer for the flashing animation
let flashColor = [255, 0, 0]; // Initial monster color (red)





// Reload variables
let canShoot = true; // Flag to check if the fairy can shoot
let reloadTimer = 500; // 0.5 seconds reload time in milliseconds
let lastShotTime = 0; // Last shot time to track reload

function setup() {
    createCanvas(1000, 1100);
}

function draw() {
    if (gameState === "start") {
        startScreen();
    } else if (gameState === "game") {
        gameScreen();
    } else if (gameState === "end") {
        endScreen();
    }
}
window.setup = setup;
function startScreen() {
    background(0, 0, 0);
    fill(255, 255, 255);
    textSize(80);
    text("Fairy the Fighter", 250, 380);
    //instruction text 
    textSize(20);
      text("You should hit the monster for 15 times to win", width / 3.5, height / 1.4);
      text("Use LEFT and RIGHT arrow keys to move", width / 3.5, height / 1.5);
      text("The far you go the wrong distance shotting you have", width / 3.5, height / 1.3);
      

    // Draw a button
    fill(255);
    rect(buttonX + 160, buttonY, buttonWidth, buttonHeight);
    fill(0);
    textSize(50);
    text("Start", buttonX + 320, buttonY + 70);
}

function gameScreen() {
   gameBackground();
    let moved = false; // Flag to check if the fairy moved
    if (thrustingLeft){
        x  -=8;
        moved = true;
    }

    if (thrustingRight){
        x  +=8;
        moved = true;
    }
    if (moved) {
        lastMoveTime = millis();
    }
    if (millis() - lastMoveTime > maxIdleTime) {
        gameState = "end"; // End game if idle for too long
    }
    // **Spawn little monsters periodically**
    if (millis() - lastSpawnTime >= spawnInterval) {
        spawnLittleMonsters();
        lastSpawnTime = millis(); // Reset spawn timer
    }
    
    // **Move and draw little monsters**
    for (let i = littleMonsters.length - 1; i >= 0; i--) {
        let monster = littleMonsters[i];
        moveLittleMonster(monster);
        drawLittleMonster(monster.x, monster.y);
     // **Check collision with the fairy**
     if (dist(monster.x, monster.y, x, y +200) < 1) {
        gameState = "end"; // Game over
        return;
    }
}    
    
    x = constrain(x, 0, width); // Keep fairy within canvas bounds

    drawFairy(x+20, y + 90);
    
    if (monsterHit) {
        flashColor = flashColor[0] === 255 ? [255, 255, 200] : [255, 0, 0]; // Toggle color
        hitTimer--;
        if (hitTimer <= 0) {//dreasing until it 0
            monsterHit = false; // Reset hit state
            flashColor = [255, 0, 0]; // Reset to red
        }
    }

    drawMonster(monsterX, monsterY, flashColor);

    // Draw and update the fairy 's projectiles
    for (let i = projectiles.length -  1; i >= 0; i--) {
        let p = projectiles[i];
        p.y -= 10; // Move the projectile up
        fill(255, 255, 0);
        ellipse(p.x, p.y, 30, 30);
        fill(255, 0, 0);
        ellipse(p.x, p.y, 20, 20);

        // Check for collision with monster
        if (
            p.x > monsterX &&
            p.x < monsterX + 190 && // Width of the monster
            p.y > monsterY &&
            p.y < monsterY + 290 // Height of the monster
        ) {
            monsterHit = true;
            hitTimer = 20; // Show hit effect for 30 frames
            projectiles.splice(i, 1); // Remove projectile
            monsterHitCount++; // Increase the hit count

            if (monsterHitCount >= monsterHealth) {
                winCondition = true;
                gameState = "end";
                return; // Stop the game logic here
            }
        }
       // Check for collision with little monsters
       for (let i = littleMonsters.length - 1; i >= 0; i--) {
        let lilMonster = littleMonsters[i];
        if (
            p.x > lilMonster.x &&
            p.x < lilMonster.x + 40 && // Width of the little monster
            p.y > lilMonster.y &&
            p.y < lilMonster.y + 40 // Height of the little monster
        ) {
            littleMonsters.splice(i, 1); // Remove the little monster
            projectiles.splice(i, 1); // Remove projectile
            break;
        }
    }

        // Remove projectile if it goes off-screen
        if (p.y < 0) {
            projectiles.splice(i, 1);
        }
    }

    // Handle reload mechanic
    if (!canShoot && millis() - lastShotTime >= reloadTimer) {
        canShoot = true; // Reset the reload status
    }
}

function endScreen() {
    background(0);
    fill(255);
    textSize(50);
    if (monsterHitCount >= monsterHealth) {
        winCondition = true; // Set win condition
        text("You Win!", width / 2 - 100, height / 3);
    } else {
        text("Game Over!", width / 2 - 100, height /3);
    }
    // Draw a button
    fill(255);
    rect(buttonX + 200, buttonY, buttonWidth, buttonHeight);
    fill(0);
    textSize(70);
    text("Restart ?", buttonX + 260, buttonY + 70);
    }

// **Move little monsters toward the fairy**
function moveLittleMonster(monster) {
    let speed = 1; // Speed of the little monsters
    let angle = atan2((y+200) - monster.y, x - monster.x); // Direction towards the fairy
    monster.x += cos(angle) * speed;
    monster.y += sin(angle) * speed;
}

// **Draw little monster
function drawLittleMonster(lilMonsterX, lilMonsterY) {
    fill(255, 100, 0);
    ellipse(lilMonsterX, lilMonsterY, 40, 40); // Body
    fill(0);
    ellipse(lilMonsterX - 10, lilMonsterY - 10, 10, 10); // Eye
    ellipse(lilMonsterX+ 10, lilMonsterY - 10, 10, 10); // Eye
    arc(lilMonsterX, lilMonsterY + 10, 20, 10, 0, PI); // Mouth
}

// **Spawn multiple little monsters**
function spawnLittleMonsters() {
    for (let i = 0; i < 3; i++) {
        littleMonsters.push({
            x: random(50, width - 50),
            y: random(50, height / 2), // Spawn from the top half
        });
    }
}
function gameBackground (){
    noStroke();
    push();
    // Sky
    fill(135, 206, 235);
    rect(0, 0, width, 800);
  
    // Grass
    fill(44, 139, 34); 
    rect(0, 800, width, 300);
  
    // Castle
    fill(179, 149, 169);
    rect(450, 600, 200, 200); 
    rect(420, 550, 50, 50);
    rect(630, 550, 50, 50);
    fill(105, 105, 105);
    triangle(420, 550, 445, 500, 470, 550);
    triangle(630, 550, 655, 500, 680, 550);
    triangle(450, 600, 550, 500, 650, 600); 
  
    // Clouds
    fill(255); 
    ellipse(200, 200, 100, 60); 
    ellipse(260, 200, 120, 70); 
    ellipse(220, 170, 100, 60); 
    ellipse(800, 150, 120, 60); 
    ellipse(860, 150, 140, 70);
    ellipse(820, 120, 120, 60);
    pop();
  }

function drawFairy(x, y) {
    push();
 
    translate(x - 246, y - 220);
    scale(0.5);
  
    // Wing One
    noStroke();
    fill(0, 109, 90);
    ellipse(x - 110, y - 40, 70, 260);
    ellipse(x - 45, y - 40, 70, 260);
    fill(86, 169, 160);
    ellipse(x - 110, y - 40, 70, 190);
    ellipse(x - 45, y - 40, 70, 190);
  
    // Wing Two
    fill(0, 109, 90);
    ellipse(x - 100, y + 40, 50, 210);
    ellipse(x - 55, y + 40, 50, 210);
    fill(80, 166, 160);
    ellipse(x - 100, y + 40, 50, 130);
    ellipse(x - 55, y + 40, 50, 130);
  
    // Wing Details
    fill(225, 171, 145);
    ellipse(x - 110, y - 90, 30, 60);
    ellipse(x - 40, y - 90, 30, 60);
    fill(255, 179, 9);
    ellipse(x - 130, y - 30, 15, 60);
    ellipse(x - 23, y - 30, 15, 60);
    fill(2, 119, 0);
    ellipse(x - 110, y - 90, 20, 30);
    ellipse(x - 40, y - 90, 20, 30);
    fill(230, 29, 75);
    ellipse(x - 110, y - 90, 8, 20);
    ellipse(x - 40, y - 90, 8, 20);
  
    // Hair
    fill(168, 126, 50);
    rect(x - 109, y - 90, 70, 260, 50);
  
    // Body
    fill(255, 224, 178);
    rect(x - 100, y - 80, 50, 70, 50);
    // Eyes
    fill(255);
    ellipse(x - 85, y - 49, 15, 15); // Left eye
    ellipse(x - 65, y - 49, 15, 15); // Right eye
    ellipse(x - 85, y - 49, 5, 15); // Left eye
    ellipse(x - 65, y - 49, 5, 15); // Right eye
    fill(0);
    ellipse(x - 85, y - 49, 9, 10); // Left pupil
    ellipse(x - 65, y - 49, 9, 10); // Right pupil
    fill(255);
    ellipse(x - 83, y - 52, 3, 4); // Left eye
    ellipse(x - 63, y - 52, 3, 4); // Right eye
  
    // Bangs for Hair
    fill(168, 126, 50);
    rect(x - 103, y - 80, 60, 28, 10);
  
    fill(255, 224, 178);
    rect(x - 100, y - 17, 50, 130, 50);
    rect(x - 110, y - 12, 70, 20, 50);
    rect(x - 110, y - 12, 20, 90, 50);
    rect(x - 59, y - 12, 20, 90, 50);
    rect(x - 100, y - 17, 50, 180, 50);
    fill(2, 119, 110);
    rect(x - 77, y + 85, 5, 80, 50);
  
    // Outfit
    fill(348, 128, 99);
    rect(x - 100, y, 50, 120, 50);
  
    ellipse(x - 84, y + 10, 30, 30, 50);
    ellipse(x - 68, y + 10, 30, 30, 50);
    fill(255, 224, 178);
    rect(x - 110, y + 40, 70, 20, 50);
  
    // Face
  
    // Nose
    fill(255, 178, 162);
    triangle(x - 75, y - 50, x - 77, y - 45, x - 73, y - 45);
  
    // Mouth
    fill(255, 102, 102);
    arc(x - 75, y - 35, 20, 10, 0, PI);
  
    pop();
  }
// Draw the monster
function drawMonster(x, y, color) {
    push();
    fill(color);
    // Body
    arc(x + 100, y + 100, 190, 290, radians(180), radians(0));
    arc(x + 100, y + 100, 190, 180, radians(0), radians(180));
    // Legs
    fill(0, 0, 0);
    ellipse(x + 50, y + 180, 60);
    ellipse(x + 140, y + 180, 60);
    // Eyes
    fill(255, 255, 0);
    arc(x + 130, y + 20, 50, 60, radians(320), radians(140));
    arc(x + 70, y + 20, 50, 60, radians(40), radians(220));
    fill(0, 0, 0);
    ellipse(x + 70, y + 36, 10, 10);
    ellipse(x + 130, y + 36, 10, 10);
    // Mouth
    strokeWeight(3);
    line(x + 35, y + 105, x + 170, y + 105);
    pop();
}

// Monster shoots bullets in a circular pattern
function shootMonsterBullets() {
    let bulletCount = 11; // Total number of bullets
    let radius = 150; // Radius of the circular arc
    let centerX = monsterX + 95; // Center x-coordinate of the arc
    let centerY = monsterY + 140; // Center y-coordinate of the arc

    for (let i = 0; i < bulletCount; i++) {
        // Distribute the bullets along the semi-circle (from 0 to PI)
        let angle = map(i, 0, bulletCount - 1, 0, PI); // Angle between 0 and PI

        // Calculate the bullet's position along the arc
        let bx = centerX + radius * cos(angle);
        let by = centerY + radius * sin(angle);

        // Add downward motion to follow the arc path
        let vy = 4; // Constant vertical speed (downward)
        let vx = cos(angle) * 2; // Horizontal speed (along the curve)

        // Push the bullet with position and velocity
        monsterBullets.push({ x: bx, y: by, vx, vy });
    }
}

function resetGame() {
    // Reset all variables
    gameState = "game"; // Go back to the game state
    x = 500; // Reset fairy's position
    y = 700;
    littleMonsters = []; // Clear all little monsters
    lastSpawnTime = 0; // Reset spawn timer
    monsterHitCount = 0; // Reset hit count
    projectiles = []; // Clear projectiles
    monsterHit = false; // Reset monster hit state
    flashColor = [255, 0, 0]; // Reset monster color
    winCondition = false; // Reset win condition
    canShoot = true; // Allow shooting
    lastMoveTime = millis(); // Reset last move time
}

function mousePressed() {
    if (gameState === "start" || gameState === "end") {
        if (
            mouseX > buttonX + 160 &&
            mouseX < buttonX + 160 + buttonWidth &&
            mouseY > buttonY &&
            mouseY < buttonY + buttonHeight
        ) {
            gameState = "game";
        }
    }
}
function mousePressed() {
    if (gameState === "start" || gameState === "end") {
        if (
            mouseX > buttonX + 160 &&
            mouseX < buttonX + 160 + buttonWidth &&
            mouseY > buttonY &&
            mouseY < buttonY + buttonHeight
        ) {
            if (gameState === "start") {
                gameState = "game";
            } else if (gameState === "end") {
                resetGame(); // Call reset function on restart
            }
        }
    }
}

function keyPressed() {
    if (keyCode === LEFT_ARROW) thrustingLeft = true;
    if (keyCode === RIGHT_ARROW) thrustingRight = true;

    // Shoot projectile when space key is pressed
    if (key === " " && canShoot) {
        projectiles.push({ x: x-30 , y: y + 200 }); // Add projectile at fairy's position
        canShoot = false; // Disable shooting until reload time is over
        lastShotTime = millis(); // Store the time of the shot
    }
}

function keyReleased() {
    if (keyCode === LEFT_ARROW) thrustingLeft = false;
    if (keyCode === RIGHT_ARROW) thrustingRight = false;
}


// cite

//Ward, M. (2024). Shooter game with p5.js [Code]. YouTube. https://www.youtube.com/watch?v=GusFmfBmJmc&t=512s (3 parts )
