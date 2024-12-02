let gameState = "start"; // Possible states: "start", "game", "end"
let buttonX = 150;
let buttonY = 480;
let buttonWidth = 400;
let buttonHeight = 100;
let x = 500, y = 700; // Initial position of the fairy


let winCondition = false; // Tracks if the player has won

let monsterHitCount = 0; // Track the number of hits on the monster

let lastMoveTime = 0; // Tracks the last time the fairy moved
let maxIdleTime = 5000; // 5 seconds maximum idle time

// Movement flags
let thrustingLeft = false;
let thrustingRight = false;

// Projectiles arrays
let projectiles = [];
let monsterBullets = [];

// Monster properties
let monsterX = 350, monsterY = 60;
let monsterHit = false;
let hitTimer = 0; // Timer for the flashing animation
let flashColor = [255, 0, 0]; // Initial monster color (red)

// Monster shooting variables
let monsterShootInterval = 2500; // 2 seconds
let lastMonsterShotTime = 0;

// Reload variables
let canShoot = true; // Flag to check if the fairy can shoot
let reloadTimer = 3000; // 3 seconds reload time in milliseconds
let lastShotTime = 0; // Last shot time to track reload

function setup() {
    createCanvas(1100, 1100);
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

function startScreen() {
    background(0, 0, 0);
    fill(255, 255, 255);
    textSize(80);
    text("Fairy the Fighter", 250, 380);

    // Draw a button
    fill(255);
    rect(buttonX + 160, buttonY, buttonWidth, buttonHeight);
    fill(0);
    textSize(50);
    text("Start", buttonX + 320, buttonY + 70);
}

function gameScreen() {
    background(255, 255, 0); // Background color
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


    

    x = constrain(x, 0, width); // Keep fairy within canvas bounds

    drawFairy(x, y + 90);

    // Handle monster flashing
    if (monsterHit) {
        flashColor = flashColor[0] === 255 ? [255, 255, 255] : [255, 0, 0]; // Toggle color
        hitTimer--;
        if (hitTimer <= 0) {
            monsterHit = false; // Reset hit state
            flashColor = [255, 0, 0]; // Reset to red
        }
    }

    drawMonster(monsterX, monsterY, flashColor);

    // Monster shoots bullets every 2 seconds
    if (millis() - lastMonsterShotTime >= monsterShootInterval) {
        shootMonsterBullets();
        lastMonsterShotTime = millis();
    }

    // Update and draw monster bullets
    for (let i = monsterBullets.length - 1; i >= 0; i--) {
        let bullet = monsterBullets[i];
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;

        fill(0, 255, 0); // Green for monster bullets
        ellipse(bullet.x, bullet.y, 20, 20);

        // Check collision with fairy
        
        
        // Remove bullet if off-screen
        if (bullet.x < 0 || bullet.x > width || bullet.y > height) {
            monsterBullets.splice(i, 1);
        }
    }

    // Draw and update projectiles
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

            if (monsterHitCount >= 5) {
                winCondition = true;
                gameState = "end";
                return; // Stop the game logic here
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
    if (monsterHitCount >= 5) {
        winCondition = true; // Set win condition
        text("You Win!", width / 2 - 100, height / 2);
    } else {
        text("Game Over!", width / 2 - 100, height / 2);
    }
    }


    
function drawFairy(x, y) {
    push();
    background(255, 255, 255);
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
