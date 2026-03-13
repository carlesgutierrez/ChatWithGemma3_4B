// robot.js — p5.js Robot Animation for GEMA
// Exposes window.setRobotThinking(bool) and window.setRobotSpeaking(bool)

let robotSketch = function(p) {
  // State
  let isThinking = false;
  let isSpeaking = false;
  let idleT = 0;
  let thinkT = 0;
  let eyeBlink = 0;
  let blinkTimer = 0;
  
  // Particle system for thinking
  let particles = [];
  
  // Colors
  const C_CYAN    = [0, 245, 255];
  const C_PURPLE  = [191, 95, 255];
  const C_GREEN   = [57, 255, 20];
  const C_PINK    = [255, 45, 120];
  const C_DARK    = [10, 10, 20];
  const C_DARKER  = [5, 5, 12];

  p.setup = function() {
    let canvas = p.createCanvas(320, 460);
    canvas.parent('robot-canvas-container');
    p.frameRate(60);
    p.textFont('monospace');
    
    // Pre-generate particles
    for (let i = 0; i < 25; i++) {
      particles.push(createParticle());
    }
  };

  function createParticle() {
    return {
      x: p.random(-30, 30),
      y: p.random(-30, 0),
      vx: p.random(-1.2, 1.2),
      vy: p.random(-2, -0.5),
      size: p.random(2, 5),
      life: 1,
      color: p.random() > 0.5 ? C_CYAN : C_PURPLE,
      alpha: p.random(150, 255)
    };
  }

  p.draw = function() {
    p.clear();
    p.background(C_DARKER[0], C_DARKER[1], C_DARKER[2]);
    
    idleT += 0.02;
    if (isThinking) thinkT += 0.04;
    
    // Blink timer
    blinkTimer += 1;
    if (blinkTimer > 180 + p.random(-40, 40)) {
      eyeBlink = 1;
      blinkTimer = 0;
    }
    if (eyeBlink > 0) eyeBlink = Math.max(0, eyeBlink - 0.12);

    p.push();
    p.translate(p.width / 2, p.height / 2 - 20);

    // Idle breathing offset
    let breathY = Math.sin(idleT) * 3;
    let breathX = Math.sin(idleT * 0.7) * 1.5;
    
    // Thinking wobble
    let wobbleX = isThinking ? Math.sin(thinkT * 2.3) * 6 : 0;
    let wobbleY = isThinking ? Math.cos(thinkT * 1.7) * 4 : 0;

    p.translate(breathX + wobbleX, breathY + wobbleY);

    // --- Draw shadow/glow on ground ---
    drawShadow(p, isThinking);

    // --- Arms ---
    drawArms(p, idleT, thinkT, isThinking);

    // --- Neck ---
    drawNeck(p);

    // --- Head ---
    drawHead(p, idleT, thinkT, isThinking, eyeBlink, isSpeaking);
    
    // --- Antenna ---
    drawAntenna(p, idleT, isThinking);

    p.pop();

    // --- Thinking particles ---
    if (isThinking) {
      drawThinkingParticles(p);
    }

    // --- Status hex grid background ---
    drawGridLines(p);
  };

  function drawGridLines(p) {
    p.push();
    p.noFill();
    p.stroke(0, 245, 255, isThinking ? 18 : 8);
    p.strokeWeight(0.5);
    
    let cols = 8;
    let hexSize = p.width / cols;
    for (let x = -hexSize; x < p.width + hexSize; x += hexSize * 0.866 * 2) {
      for (let y = -hexSize; y < p.height + hexSize; y += hexSize * 1.5) {
        drawHexagon(p, x, y, hexSize * 0.5);
        drawHexagon(p, x + hexSize * 0.866, y + hexSize * 0.75, hexSize * 0.5);
      }
    }
    p.pop();
  }

  function drawHexagon(p, cx, cy, r) {
    p.beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = (Math.PI / 3) * i;
      p.vertex(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    }
    p.endShape(p.CLOSE);
  }

  function drawShadow(p, thinking) {
    let shadowA = thinking ? 60 + Math.sin(thinkT * 3) * 20 : 40;
    let shadowSize = thinking ? 90 + Math.sin(thinkT * 2) * 10 : 80;
    p.push();
    p.noStroke();
    // Glow ring
    for (let i = 3; i >= 0; i--) {
      let a = (shadowA / (i + 1)) * 0.5;
      let spread = 1.2 - i * 0.1;
      p.fill(thinking ? C_PURPLE[0] : C_CYAN[0],
             thinking ? C_PURPLE[1] : C_CYAN[1],
             thinking ? C_PURPLE[2] : C_CYAN[2], a);
      p.ellipse(0, 170, shadowSize * spread, 12 * spread);
    }
    p.pop();
  }

  function drawAntenna(p, t, thinking) {
    p.push();
    p.translate(0, -100);
    
    let waveSway = Math.sin(t * 1.5) * (thinking ? 12 : 5);
    let waveY = Math.cos(t * 2) * 3;
    
    // Antenna stem
    p.stroke(C_CYAN[0], C_CYAN[1], C_CYAN[2], 180);
    p.strokeWeight(2);
    p.noFill();
    p.line(0, 0, waveSway * 0.3, -18 + waveY);
    p.line(waveSway * 0.3, -18 + waveY, waveSway, -38 + waveY);

    // Antenna tip glow
    let tipAlpha = 200 + Math.sin(t * 4) * 55;
    p.noStroke();
    
    // Outer glow
    p.fill(thinking ? C_PURPLE[0] : C_CYAN[0],
           thinking ? C_PURPLE[1] : C_CYAN[1],
           thinking ? C_PURPLE[2] : C_CYAN[2], 50);
    p.circle(waveSway, -44 + waveY, 18);
    
    // Inner dot
    p.fill(thinking ? C_PURPLE[0] : C_CYAN[0],
           thinking ? C_PURPLE[1] : C_CYAN[1],
           thinking ? C_PURPLE[2] : C_CYAN[2], tipAlpha);
    p.circle(waveSway, -44 + waveY, 8);
    
    p.pop();
  }

  function drawHead(p, t, thinkT, thinking, blinkAmount, speaking) {
    p.push();
    p.translate(0, -60);

    // Head body
    let headW = 100, headH = 82;
    
    // Outer glow
    p.noFill();
    for (let i = 0; i < 3; i++) {
      let gA = thinking ? 30 + i * 10 : 15 + i * 5;
      p.stroke(C_CYAN[0], C_CYAN[1], C_CYAN[2], gA);
      p.strokeWeight(i * 2 + 1);
      p.rect(-headW/2 - i*2, -headH/2 - i*2, headW + i*4, headH + i*4, 14);
    }
    
    // Head fill
    p.noStroke();
    p.fill(C_DARK[0], C_DARK[1], C_DARK[2]);
    p.rect(-headW/2, -headH/2, headW, headH, 12);
    
    // Head border
    p.noFill();
    p.stroke(C_CYAN[0], C_CYAN[1], C_CYAN[2], 220);
    p.strokeWeight(1.5);
    p.rect(-headW/2, -headH/2, headW, headH, 12);
    
    // Corner accents
    p.stroke(C_CYAN[0], C_CYAN[1], C_CYAN[2], 255);
    p.strokeWeight(2);
    let cSize = 8;
    // TL
    p.line(-headW/2, -headH/2 + cSize, -headW/2, -headH/2);
    p.line(-headW/2, -headH/2, -headW/2 + cSize, -headH/2);
    // TR
    p.line(headW/2 - cSize, -headH/2, headW/2, -headH/2);
    p.line(headW/2, -headH/2, headW/2, -headH/2 + cSize);
    // BL
    p.line(-headW/2, headH/2 - cSize, -headW/2, headH/2);
    p.line(-headW/2, headH/2, -headW/2 + cSize, headH/2);
    // BR
    p.line(headW/2 - cSize, headH/2, headW/2, headH/2);
    p.line(headW/2, headH/2 - cSize, headW/2, headH/2);

    // --- Eyes ---
    let eyeY = -10;
    let eyeSpacing = 26;
    let eyeSize = 18;
    let eyeOpenness = 1 - blinkAmount;
    
    // Pupil movement
    let pupilX = isThinking ? Math.sin(thinkT * 1.3) * 4 : Math.sin(t * 0.8) * 2;
    let pupilY = isThinking ? Math.cos(thinkT * 0.9) * 3 : Math.cos(t * 0.6) * 1;

    for (let side = -1; side <= 1; side += 2) {
      let ex = side * eyeSpacing;

      // Eye outer glow
      p.noStroke();
      p.fill(thinking ? C_PURPLE[0] : C_GREEN[0],
             thinking ? C_PURPLE[1] : C_GREEN[1],
             thinking ? C_PURPLE[2] : C_GREEN[2], 40);
      p.ellipse(ex, eyeY, eyeSize + 8, (eyeSize + 8) * eyeOpenness);
      
      // Eye socket
      p.fill(0, 0, 0);
      p.ellipse(ex, eyeY, eyeSize, eyeSize * eyeOpenness);
      
      // Iris
      p.fill(thinking ? C_PURPLE[0] : C_GREEN[0],
             thinking ? C_PURPLE[1] : C_GREEN[1],
             thinking ? C_PURPLE[2] : C_GREEN[2], 220);
      let irisSize = thinking ? eyeSize - 4 + Math.sin(thinkT * 3) * 3 : eyeSize - 5;
      p.ellipse(ex, eyeY, irisSize, irisSize * eyeOpenness);
      
      // Pupil (dark center)
      p.fill(0, 0, 0);
      p.ellipse(ex + pupilX, eyeY + pupilY, 7, 7 * eyeOpenness);
      
      // Specular highlight
      p.fill(255, 255, 255, 200);
      p.ellipse(ex + pupilX - 2.5, eyeY + pupilY - 2.5, 3, 3 * eyeOpenness);
      
      // Eye outline
      p.noFill();
      p.stroke(thinking ? C_PURPLE[0] : C_GREEN[0],
               thinking ? C_PURPLE[1] : C_GREEN[1],
               thinking ? C_PURPLE[2] : C_GREEN[2], 200);
      p.strokeWeight(1.2);
      p.ellipse(ex, eyeY, eyeSize, eyeSize * eyeOpenness);

      // Thinking scan line effect
      if (thinking) {
        let scanY = ((thinkT * 60 * side) % eyeSize) - eyeSize/2;
        p.stroke(C_PURPLE[0], C_PURPLE[1], C_PURPLE[2], 120);
        p.strokeWeight(1);
        p.line(ex - eyeSize/2 + 2, eyeY + scanY, ex + eyeSize/2 - 2, eyeY + scanY);
      }
    }

    // --- Mouth ---
    let mouthY = 22;
    p.noStroke();
    p.fill(C_DARK[0], C_DARK[1], C_DARK[2]);
    p.rect(-28, mouthY - 5, 56, 14, 4);
    
    p.stroke(C_CYAN[0], C_CYAN[1], C_CYAN[2], 100);
    p.strokeWeight(1);
    p.noFill();
    p.rect(-28, mouthY - 5, 56, 14, 4);
    
    // Mouth LED bars (equalizer style)
    let barCount = 7;
    let barW = 5;
    let barGap = 3;
    let totalW = barCount * (barW + barGap) - barGap;
    let startX = -totalW / 2;
    
    for (let i = 0; i < barCount; i++) {
      let bx = startX + i * (barW + barGap);
      let barH;
      if (speaking) {
        barH = 5 + Math.abs(Math.sin(t * 8 + i * 0.8)) * 7;
      } else if (thinking) {
        barH = 2 + Math.abs(Math.sin(thinkT * 3 + i * 0.5)) * 6;
      } else {
        barH = 2 + Math.abs(Math.sin(t * 1.5 + i * 0.4)) * 4;
      }
      
      let barColor = i < 2 ? C_GREEN : i < 5 ? C_CYAN : C_PINK;
      p.noStroke();
      p.fill(barColor[0], barColor[1], barColor[2], 220);
      p.rect(bx, mouthY + 2 - barH/2, barW, barH, 1);

      // Glow
      p.fill(barColor[0], barColor[1], barColor[2], 60);
      p.rect(bx - 1, mouthY + 2 - barH/2 - 1, barW + 2, barH + 2, 1);
    }

    p.pop();
  }

  function drawNeck(p) {
    p.push();
    p.translate(0, 10);
    
    // Neck tubes
    for (let nx of [-10, 10]) {
      p.noStroke();
      p.fill(C_DARK[0], C_DARK[1], C_DARK[2]);
      p.rect(nx - 4, -10, 8, 28, 3);
      p.stroke(C_CYAN[0], C_CYAN[1], C_CYAN[2], 120);
      p.strokeWeight(1);
      p.noFill();
      p.rect(nx - 4, -10, 8, 28, 3);
      
      // Neck joint lines
      p.stroke(C_CYAN[0], C_CYAN[1], C_CYAN[2], 60);
      p.strokeWeight(0.5);
      for (let j = 0; j < 3; j++) {
        p.line(nx - 4, -4 + j * 8, nx + 4, -4 + j * 8);
      }
    }
    p.pop();
  }

  function drawArms(p, t, thinkT, thinking) {
    p.push();
    p.translate(0, 10);

    for (let side = -1; side <= 1; side += 2) {
      p.push();
      p.scale(side, 1);
      
      // Shoulder position
      let shoulderX = 56;
      let shoulderY = -20;
      
      // Upper arm rotation
      let upperArmAngle;
      let forearmAngle;
      
      if (thinking) {
        // Arms bent up towards head while thinking
        let thinkProgress = Math.min(1, thinkT * 0.15);
        upperArmAngle = p.lerp(0.3, -1.0 + Math.sin(thinkT * 1.5) * 0.3, thinkProgress);
        forearmAngle = p.lerp(0.4, -0.8 + Math.cos(thinkT * 2) * 0.3, thinkProgress);
      } else {
        // Idle swing
        upperArmAngle = 0.3 + Math.sin(t + side * 0.5) * 0.12;
        forearmAngle = 0.35 + Math.cos(t * 1.1 + side * 0.3) * 0.08;
      }
      
      // Shoulder glow
      p.noStroke();
      p.fill(C_CYAN[0], C_CYAN[1], C_CYAN[2], 40);
      p.circle(shoulderX, shoulderY, 22);
      p.fill(C_CYAN[0], C_CYAN[1], C_CYAN[2], 120);
      p.circle(shoulderX, shoulderY, 12);
      
      // Upper arm
      p.push();
      p.translate(shoulderX, shoulderY);
      p.rotate(upperArmAngle);
      
      // Arm segment
      p.noStroke();
      p.fill(C_DARK[0] + 5, C_DARK[1] + 5, C_DARK[2] + 15);
      p.rect(-7, 0, 14, 44, 5);
      p.stroke(C_CYAN[0], C_CYAN[1], C_CYAN[2], 150);
      p.strokeWeight(1);
      p.noFill();
      p.rect(-7, 0, 14, 44, 5);
      
      // Arm detail lines
      p.stroke(C_CYAN[0], C_CYAN[1], C_CYAN[2], 60);
      p.strokeWeight(0.5);
      p.line(-5, 10, 5, 10);
      p.line(-5, 20, 5, 20);
      p.line(-5, 30, 5, 30);
      
      // Elbow joint
      let elbowX = 0;
      let elbowY = 44;
      
      p.noStroke();
      p.fill(C_CYAN[0], C_CYAN[1], C_CYAN[2], 40);
      p.circle(elbowX, elbowY, 18);
      p.fill(C_DARK[0] + 5, C_DARK[1] + 5, C_DARK[2] + 20);
      p.circle(elbowX, elbowY, 12);
      p.stroke(C_CYAN[0], C_CYAN[1], C_CYAN[2], 160);
      p.strokeWeight(1);
      p.noFill();
      p.circle(elbowX, elbowY, 12);
      
      // Forearm
      p.translate(elbowX, elbowY);
      p.rotate(forearmAngle);
      
      p.noStroke();
      p.fill(C_DARK[0] + 5, C_DARK[1] + 5, C_DARK[2] + 15);
      p.rect(-6, 0, 12, 36, 4);
      p.stroke(C_CYAN[0], C_CYAN[1], C_CYAN[2], 130);
      p.strokeWeight(1);
      p.noFill();
      p.rect(-6, 0, 12, 36, 4);
      
      // Wrist/hand
      p.noStroke();
      p.fill(C_CYAN[0], C_CYAN[1], C_CYAN[2], 40);
      p.circle(0, 38, 16);
      p.fill(0, 245, 255, 160);
      p.circle(0, 38, 9);
      
      // Hand gem shape
      if (thinking) {
        p.fill(C_PURPLE[0], C_PURPLE[1], C_PURPLE[2], 200 + Math.sin(thinkT * 4 + side) * 55);
      } else {
        p.fill(C_CYAN[0], C_CYAN[1], C_CYAN[2], 160);
      }
      drawHexSmall(p, 0, 38, 5);
      
      p.pop(); // forearm
      p.pop(); // upper arm context
      p.pop(); // side scale
    }
    p.pop();
  }

  function drawHexSmall(p, cx, cy, r) {
    p.beginShape();
    for (let i = 0; i < 6; i++) {
      let angle = (Math.PI / 3) * i - Math.PI/6;
      p.vertex(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    }
    p.endShape(p.CLOSE);
  }

  function drawThinkingParticles(p) {
    p.push();
    p.translate(p.width / 2, p.height / 2 - 100);
    
    for (let part of particles) {
      part.x += part.vx;
      part.y += part.vy;
      part.life -= 0.012;
      
      if (part.life <= 0) {
        // Respawn
        part.x = p.random(-20, 20);
        part.y = p.random(-10, 5);
        part.vx = p.random(-1.2, 1.2);
        part.vy = p.random(-2.5, -0.8);
        part.size = p.random(2, 5);
        part.life = 1;
        part.color = p.random() > 0.5 ? C_CYAN : C_PURPLE;
      }
      
      p.noStroke();
      p.fill(part.color[0], part.color[1], part.color[2], part.alpha * part.life);
      p.circle(part.x, part.y, part.size * part.life);
    }
    p.pop();
  }

  // Public API
  p.setThinking = function(val) {
    isThinking = val;
    if (!val) thinkT = 0;
  };

  p.setSpeaking = function(val) {
    isSpeaking = val;
  };
};

let robotP5 = new p5(robotSketch);

window.setRobotThinking = function(val) {
  robotP5.setThinking(val);
};

window.setRobotSpeaking = function(val) {
  robotP5.setSpeaking(val);
};
