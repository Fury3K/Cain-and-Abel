// Cain and Abel - A Journey of Unity
// Remastered Version - Final Stable Build

class Particle {
    constructor(x, y, color, type) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.type = type;
        this.size = Math.random() * 3 + 1;
        this.life = 1.0;
        this.decay = Math.random() * 0.03 + 0.01;
        
        if (type === 'dust') {
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 1) * 2;
        } else if (type === 'sparkle') {
            this.vx = (Math.random() - 0.5) * 1;
            this.vy = (Math.random() - 0.5) * 1;
            this.decay = 0.02;
        } else if (type === 'debris') {
            this.vx = (Math.random() - 0.5) * 4;
            this.vy = (Math.random() - 1) * 4;
            this.size = Math.random() * 5 + 2;
        }
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        if (this.type === 'debris') this.vy += 0.2;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}

class Game {
    constructor() {
        console.log("Initializing Game...");
        this.canvas = document.getElementById('game');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        document.getElementById('gameHUD').classList.remove('hidden');

        this.currentLevel = 1;
        this.currentCharacter = 'cain';
        this.gameState = 'playing';
        this.cainOfferings = 0;
        this.abelOfferings = 0;
        this.maxCainOfferings = 1;
        this.maxAbelOfferings = 1;
        
        this.particles = [];
        this.shakeIntensity = 0;
        
        this.characters = {};
        this.platforms = [];
        this.movableObjects = [];
        this.switches = [];
        this.barriers = [];
        this.earthPlatforms = [];
        this.illuminatedAreas = [];
        this.collectibles = [];
        this.hiddenCollectibles = [];
        this.gateBarriers = [];
        this.bridges = [];
        this.exitGate = null;
        this.exitGateSpawned = false;
        
        this.gravity = 0.5;
        this.friction = 0.85;
        this.darkness = 0.85;
        
        this.heartacheMusic = new Audio('Heartache.mp3');
        this.heartacheMusic.volume = 0.6;
        this.ominousBellsMusic = new Audio('Ominous Bells of Doom.mp3');
        this.currentMusic = null;
        
        this.keys = {};
        this.keysPressed = {};
        this.setupEventListeners();
        
        this.initializeCharacters();
        this.loadLevel(this.currentLevel);
        this.gameLoop();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.keys[e.code]) this.keysPressed[e.code] = true;
            this.keys[e.code] = true;
            this.handleKeyPress(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
            this.keysPressed[e.code] = false;
        });
    }
    
    handleKeyPress(e) {
        switch(e.code) {
            case 'KeyP': this.togglePause(); break;
            case 'KeyR': if (e.ctrlKey) this.restartLevel(); break;
            case 'Digit1': this.switchCharacter('cain'); break;
            case 'Digit2': this.switchCharacter('abel'); break;
        }
    }
    
    createParticles(x, y, type, count = 10, color = '#fff') {
        for (let i = 0; i < count; i++) {
            this.particles.push(new Particle(x, y, color, type));
        }
    }
    
    addScreenShake(intensity) {
        this.shakeIntensity = intensity;
    }

    initializeCharacters() {
        this.characters.cain = {
            x: 100, y: 400, width: 30, height: 40,
            vx: 0, vy: 0, onGround: false,
            color: '#8B4513',
            abilities: { canPush: true, canCreatePlatform: true, canBreakBarrier: true },
            pushPower: 3, platformCooldown: 0, breakCooldown: 0, offerings: 0
        };
        
        this.characters.abel = {
            x: 150, y: 400, width: 25, height: 35,
            vx: 0, vy: 0, onGround: false,
            color: '#87CEEB',
            abilities: { canDoubleJump: true, canGlide: true, canIlluminate: true },
            jumpCount: 0, maxJumps: 2, illuminationCooldown: 0, illuminationRadius: 600, offerings: 0
        };
    }
    
    loadLevel(level) {
        console.log("Loading Level:", level);
        this.platforms = [];
        this.movableObjects = [];
        this.switches = [];
        this.barriers = [];
        this.earthPlatforms = [];
        this.illuminatedAreas = [];
        this.collectibles = [];
        this.hiddenCollectibles = [];
        this.gateBarriers = [];
        this.bridges = [];
        this.exitGate = null;
        this.exitGateSpawned = false;
        this.particles = [];
        this.cainOfferings = 0;
        this.abelOfferings = 0;
        
        if (!this.characters.cain) this.initializeCharacters();
        
        switch(level) {
            case 1: this.loadLevel1(); break;
            case 2: this.loadLevel2(); break;
            case 3: this.loadLevel3(); break;
            default: this.loadLevel1(); break;
        }

        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }
        
        try {
            if (level >= 1 && level <= 2) {
                this.currentMusic = this.heartacheMusic;
                this.currentMusic.loop = true;
                this.currentMusic.play().catch(e => console.warn("Audio blocked:", e));
            } else if (level === 3) {
                this.currentMusic = this.ominousBellsMusic;
                this.currentMusic.loop = true;
                this.currentMusic.play().catch(e => console.warn("Audio blocked:", e));
            }
        } catch(e) {
            console.warn("Audio system error:", e);
        }
        
        this.updateUI();
    }
    
    loadLevel1() {
        this.platforms.push(
            {x: 0, y: 500, width: 400, height: 50, type: 'ground'},
            {x: 500, y: 450, width: 200, height: 50, type: 'ground'},
            {x: 800, y: 400, width: 400, height: 50, type: 'ground'}
        );
        this.platforms.push({x: 550, y: 350, width: 100, height: 20, type: 'high'});
        this.switches.push(
            {x: 600, y: 320, width: 25, height: 25, color: '#FFD700', activated: false, type: 'gate', visible: true, character: 'abel'}
        );
        this.collectibles.push(
            {x: 200, y: 450, width: 18, height: 18, color: '#CD853F', type: 'cain_offering', collected: false, character: 'cain'},
            {x: 600, y: 300, width: 18, height: 18, color: '#87CEEB', type: 'abel_offering', collected: false, character: 'abel'}
        );
        this.resetCharPos(50, 450, 100, 450);
    }

    loadLevel2() {
        this.platforms.push(
            {x: 0, y: 500, width: 300, height: 50, type: 'ground'},
            {x: 400, y: 500, width: 400, height: 50, type: 'ground'},
            {x: 900, y: 450, width: 300, height: 50, type: 'ground'}
        );
        this.movableObjects.push(
            {x: 200, y: 450, width: 40, height: 40, color: '#696969', type: 'box', canBePushed: true}
        );
        this.switches.push(
            {x: 600, y: 450, width: 25, height: 25, color: '#FFD700', activated: false, type: 'bridge1', visible: true, character: 'abel'}
        );
        this.switches.push(
            {x: 1000, y: 400, width: 25, height: 25, color: '#FFD700', activated: false, type: 'gate', visible: true, character: 'cain'}
        );
        this.barriers.push({x: 850, y: 350, width: 20, height: 150, color: '#8B4513', type: 'breakable', health: 1});
        this.collectibles.push(
            {x: 150, y: 450, width: 18, height: 18, color: '#CD853F', type: 'cain_offering', collected: false, character: 'cain'},
            {x: 500, y: 300, width: 18, height: 18, color: '#87CEEB', type: 'abel_offering', collected: false, character: 'abel'}
        );
        this.resetCharPos(50, 450, 100, 450);
    }
    
    loadLevel3() {
        this.platforms.push({x: 0, y: 550, width: this.width, height: 50, type: 'ground'});
        if (!this.characters.abel) {
             this.characters.abel = {
                x: 800, y: 500, width: 25, height: 35, vx: 0, vy: 0, onGround: false,
                color: '#87CEEB', abilities: {}, jumpCount: 0, maxJumps: 2, illuminationCooldown: 0, illuminationRadius: 600, offerings: 0
            };
        }
        this.resetCharPos(200, 500, 800, 500);
        this.currentCharacter = 'cain';
        this.exitGate = { x: 1100, y: 470, width: 50, height: 80, type: 'exit_gate' };
        this.exitGateSpawned = true;
        this.showMessage("The Final Confrontation");
    }

    resetCharPos(cx, cy, ax, ay) {
        if (this.characters.cain) {
            this.characters.cain.x = cx; this.characters.cain.y = cy;
            this.characters.cain.vx = 0; this.characters.cain.vy = 0;
            this.characters.cain.onGround = false;
        }
        if (this.characters.abel) {
            this.characters.abel.x = ax; this.characters.abel.y = ay;
            this.characters.abel.vx = 0; this.characters.abel.vy = 0;
            this.characters.abel.onGround = false;
        }
    }

    update() {
        if (this.gameState === 'finalGameComplete') return;
        if (this.gameState !== 'playing' && !(this.currentLevel === 3 && this.gameState === 'gameComplete')) return;

        if (this.shakeIntensity > 0) this.shakeIntensity *= 0.9;
        if (this.shakeIntensity < 0.5) this.shakeIntensity = 0;

        this.updateCharacters();
        this.updatePhysics();
        this.checkCollisions();
        this.updateSwitches();
        this.updateUI();
        
        this.particles = this.particles.filter(p => p.life > 0);
        this.particles.forEach(p => p.update());
    }

    updateCharacters() {
        const cain = this.characters.cain;
        const abel = this.characters.abel;
        
        if (this.currentCharacter === 'cain' && cain) {
            let speed = 1.5;
            if (this.keys['KeyA']) cain.vx = -speed;
            else if (this.keys['KeyD']) cain.vx = speed;
            else cain.vx *= this.friction;
            
            if (this.keysPressed['KeyW'] && cain.onGround) {
                cain.vy = -8;
                cain.onGround = false;
                this.keysPressed['KeyW'] = false;
                this.createParticles(cain.x + cain.width/2, cain.y + cain.height, 'dust');
            }
            if (this.keys['KeyE']) this.handleCainPush();
            if (this.keys['KeyR'] && cain.platformCooldown <= 0) {
                this.createEarthPlatform(cain.x, cain.y + cain.height);
                cain.platformCooldown = 120;
                this.addScreenShake(3); 
            }
            if (this.keys['KeyT'] && cain.breakCooldown <= 0) {
                this.breakBarrier(cain.x, cain.y);
                cain.breakCooldown = 60;
                this.addScreenShake(5); 
            }
        }
        
        if (this.currentCharacter === 'abel' && abel) {
            if (this.keys['KeyJ']) abel.vx = -3;
            else if (this.keys['KeyL']) abel.vx = 3;
            else abel.vx *= this.friction;
            
            if (this.keysPressed['ShiftLeft'] || this.keysPressed['ShiftRight']) {
                if (abel.onGround) {
                    abel.vy = -12;
                    abel.onGround = false;
                    abel.jumpCount = 1;
                    this.createParticles(abel.x + abel.width/2, abel.y + abel.height, 'sparkle', 5, '#87CEEB');
                } else if (abel.jumpCount < abel.maxJumps) {
                    abel.vy = -10;
                    abel.jumpCount++;
                    this.createParticles(abel.x + abel.width/2, abel.y + abel.height, 'sparkle', 8, '#fff');
                }
                this.keysPressed['ShiftLeft'] = false;
                this.keysPressed['ShiftRight'] = false;
            }
            if (this.keys['KeyF'] && abel.illuminationCooldown <= 0) {
                this.illuminateArea(abel.x, abel.y);
                abel.illuminationCooldown = 180;
            }
        }

        if (cain && cain.platformCooldown > 0) cain.platformCooldown--;
        if (cain && cain.breakCooldown > 0) cain.breakCooldown--;
        if (abel && abel.illuminationCooldown > 0) abel.illuminationCooldown--;
    }

    updatePhysics() {
        Object.values(this.characters).forEach(char => {
            char.vy += this.gravity;
            char.x += char.vx;
            char.y += char.vy;
            char.x = Math.max(0, Math.min(this.width - char.width, char.x));
            if (char.y > this.height) {
                this.restartLevel();
                return;
            }
        });
        if (this.characters.abel && this.characters.abel.vy > 0 && !this.characters.abel.onGround) {
            this.characters.abel.vy *= 0.3;
        }
        this.earthPlatforms = this.earthPlatforms.filter(p => p.lifetime-- > 0);
        this.illuminatedAreas = this.illuminatedAreas.filter(a => a.lifetime-- > 0);
    }
    
    handleCainPush() {
        const cain = this.characters.cain;
        const dir = cain.vx > 0 ? 1 : -1;
        this.movableObjects.forEach(obj => {
            if (this.checkCollision(cain, obj) && obj.canBePushed) {
                obj.x += dir * cain.pushPower;
                this.createParticles(obj.x + (dir > 0 ? 0 : obj.width), obj.y + obj.height, 'dust', 1);
            }
        });
    }

    createEarthPlatform(x, y) {
        this.earthPlatforms.push({x: x - 20, y: y, width: 40, height: 10, color: '#8B4513', lifetime: 300, type: 'earth'});
        this.createParticles(x, y, 'debris', 10, '#8B4513');
    }

    breakBarrier(x, y) {
        const checkBreak = (list) => {
            list.forEach((b, i) => {
                if (this.checkCollision({x, y, width: 50, height: 50}, b)) {
                    b.health--;
                    this.createParticles(b.x + b.width/2, b.y + b.height/2, 'debris', 5, b.color);
                    if (b.health <= 0) {
                        list.splice(i, 1);
                        this.createParticles(b.x + b.width/2, b.y + b.height/2, 'debris', 20, b.color);
                        this.showMessage("Barrier Shattered!");
                    }
                }
            });
        };
        checkBreak(this.barriers);
        checkBreak(this.gateBarriers);
    }

    illuminateArea(x, y) {
        const abel = this.characters.abel;
        this.illuminatedAreas.push({
            x: x - abel.illuminationRadius/2, y: y - abel.illuminationRadius/2,
            width: abel.illuminationRadius, height: abel.illuminationRadius,
            lifetime: 180, type: 'illumination'
        });
        this.hiddenCollectibles.forEach(c => {
            if (!c.revealed) {
                const dist = Math.hypot(c.x - x, c.y - y);
                if (dist <= abel.illuminationRadius) {
                    c.revealed = true;
                    this.createParticles(c.x, c.y, 'sparkle', 10, '#00FFFF');
                }
            }
        });
    }

    updateSwitches() {
        this.switches.forEach(s => {
            if (s.character === 'abel' && !s.visible && this.characters.abel) {
                 const dist = Math.hypot(s.x - this.characters.abel.x, s.y - this.characters.abel.y);
                 if (dist <= 600) s.visible = true; 
            }
            const char = this.characters[this.currentCharacter];
            if (s.visible && !s.activated && this.checkCollision(char, s) && char === this.characters[s.character]) {
                s.activated = true;
                this.addScreenShake(2);
                this.createParticles(s.x + s.width/2, s.y, 'sparkle', 10, '#FFD700');
                if (s.type.startsWith('bridge')) {
                    if (s.type === 'bridge1') { 
                        this.bridges.push({x: 300, y: 500, width: 100, height: 50, color: '#8B4513', type: 'bridge'});
                    }
                    this.showMessage("Bridge Formed!");
                } else if (s.type === 'gate') {
                    this.spawnExitGate();
                }
            }
        });
    }

    spawnExitGate() {
        this.exitGateSpawned = true;
        const gy = this.currentLevel === 1 ? 350 : (this.currentLevel === 2 ? 400 : 470);
        const gx = this.currentLevel === 1 ? 1100 : (this.currentLevel === 2 ? 1100 : 1100);
        this.exitGate = { x: gx, y: gy, width: 50, height: 80, type: 'exit_gate' };
        this.showMessage('The Path is Open!');
        this.addScreenShake(10);
    }

    checkCollisions() {
        Object.values(this.characters).forEach(char => {
            char.onGround = false;
            const solids = [...this.platforms, ...this.earthPlatforms, ...this.bridges, ...this.movableObjects, ...this.barriers, ...this.gateBarriers];
            
            solids.forEach(solid => {
                const charHalfW = char.width / 2;
                const charHalfH = char.height / 2;
                const solidHalfW = solid.width / 2;
                const solidHalfH = solid.height / 2;
                const charCenterX = char.x + charHalfW;
                const charCenterY = char.y + charHalfH;
                const solidCenterX = solid.x + solidHalfW;
                const solidCenterY = solid.y + solidHalfH;
                const dx = charCenterX - solidCenterX;
                const dy = charCenterY - solidCenterY;
                const minDistX = charHalfW + solidHalfW;
                const minDistY = charHalfH + solidHalfH;

                if (Math.abs(dx) < minDistX && Math.abs(dy) < minDistY) {
                    const ox = minDistX - Math.abs(dx);
                    const oy = minDistY - Math.abs(dy);
                    if (ox >= oy) {
                        if (dy > 0) {
                            char.y += oy;
                            char.vy = 0;
                        } else {
                            char.y -= oy;
                            char.vy = 0;
                            char.onGround = true;
                            char.jumpCount = 0;
                        }
                    } else {
                        if (dx > 0) {
                            char.x += ox;
                            char.vx = 0;
                        } else {
                            char.x -= ox;
                            char.vx = 0;
                        }
                    }
                }
            });

            [...this.collectibles, ...this.hiddenCollectibles].forEach(c => {
                if (!c.collected && (c.visible !== false || c.revealed) && this.checkCollision(char, c)) {
                    if ((c.character === 'cain' && char === this.characters.cain) || (c.character === 'abel' && char === this.characters.abel)) {
                        c.collected = true;
                        if (c.character === 'cain') this.cainOfferings++; else this.abelOfferings++;
                        this.createParticles(c.x, c.y, 'sparkle', 15, c.color);
                        this.showMessage("Offering Accepted");
                    }
                }
            });
            
            if (this.exitGate && this.checkCollision(char, this.exitGate)) {
                const cain = this.characters.cain;
                const abel = this.characters.abel;
                if (abel && Math.abs(cain.x - this.exitGate.x) < 80 && Math.abs(abel.x - this.exitGate.x) < 80 && this.gateBarriers.length === 0) {
                    this.completeLevel();
                }
            }
            
            if (this.currentLevel === 3 && char === this.characters.cain && this.characters.abel && this.checkCollision(this.characters.cain, this.characters.abel)) {
                 this.gameState = 'gameComplete';
                 this.showMessage('Cain rose up against his brother Abel...', 5000);
                 delete this.characters.abel;
                 this.addScreenShake(20);
                 this.createParticles(this.characters.cain.x, this.characters.cain.y, 'debris', 50, '#8B0000');
                 setTimeout(() => {
                     this.showMessage('And killed him.', 4000);
                     setTimeout(() => this.fadeToBlackAndShowRestart(), 4000);
                 }, 4000);
            }
        });
    }

    checkCollision(r1, r2) {
        return r1.x < r2.x + r2.width && r1.x + r1.width > r2.x &&
               r1.y < r2.y + r2.height && r1.y + r1.height > r2.y;
    }

    switchCharacter(name) {
        this.currentCharacter = name;
        if (this.characters[name]) {
            this.createParticles(this.characters[name].x, this.characters[name].y, 'sparkle', 5, '#fff');
        }
        this.updateUI();
    }

    togglePause() {
        this.gameState = this.gameState === 'playing' ? 'paused' : 'playing';
        this.showMessage(this.gameState === 'paused' ? 'Paused' : 'Resumed');
    }

    restartLevel() {
        this.loadLevel(this.currentLevel);
        this.gameState = 'playing';
        this.showMessage('Restarting Chapter...');
    }

    completeLevel() {
        const prev = this.currentLevel;
        this.currentLevel++;
        if (this.currentLevel > 3) {
             this.gameState = 'gameComplete';
        } else {
             this.gameState = 'levelComplete';
             this.showMessage(`Chapter ${prev} Complete`);
             
             setTimeout(() => {
                 try {
                     this.loadLevel(this.currentLevel);
                     this.gameState = 'playing';
                 } catch (e) {
                     console.error("Critical error in level transition:", e);
                     this.gameState = 'playing';
                 }
             }, 2000);
        }
    }

    updateUI() {
        const hudChar = document.getElementById('currentCharacter');
        const hudLevel = document.getElementById('levelProgress');
        const hudCain = document.getElementById('cainOfferings');
        const hudAbel = document.getElementById('abelOfferings');

        if (hudChar) hudChar.textContent = this.currentCharacter.toUpperCase();
        if (hudLevel) hudLevel.textContent = this.currentLevel;
        if (hudCain) hudCain.textContent = `Cain: ${this.cainOfferings}/${this.maxCainOfferings}`;
        if (hudAbel) hudAbel.textContent = `Abel: ${this.abelOfferings}/${this.maxAbelOfferings}`;
        
        if (this.currentCharacter === 'cain' && hudCain && hudAbel) {
            hudCain.style.opacity = '1'; hudAbel.style.opacity = '0.5';
        } else if (hudCain && hudAbel) {
            hudCain.style.opacity = '0.5'; hudAbel.style.opacity = '1';
        }
    }

    showMessage(text, duration = 3000) {
        const el = document.getElementById('gameMessage');
        const content = document.getElementById('messageContent');
        if (el && content) {
            content.textContent = text;
            el.classList.remove('hidden');
            if (this.msgTimeout) clearTimeout(this.msgTimeout);
            this.msgTimeout = setTimeout(() => el.classList.add('hidden'), duration);
        }
    }

    fadeToBlackAndShowRestart() {
        const el = document.getElementById('startButtonContainer');
        const btn = document.getElementById('startButton');
        if (el && btn) {
            el.classList.remove('hidden');
            btn.textContent = 'Begin Anew';
            btn.onclick = () => location.reload(); 
        }
    }
    
    drawBackground() {
        const g = this.ctx.createLinearGradient(0, 0, 0, this.height);
        if (this.currentLevel === 3) { g.addColorStop(0, '#300'); g.addColorStop(1, '#100'); }
        else { g.addColorStop(0, '#111'); g.addColorStop(1, '#050505'); }
        this.ctx.fillStyle = g;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    applyDarkness() {
        const darkness = this.exitGateSpawned ? 0.3 : this.darkness;
        this.ctx.fillStyle = `rgba(0,0,0,${darkness})`;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.globalCompositeOperation = 'destination-out';
        this.illuminatedAreas.forEach(a => {
            const g = this.ctx.createRadialGradient(a.x + a.width/2, a.y + a.height/2, 0, a.x + a.width/2, a.y + a.height/2, a.width/2);
            g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
            this.ctx.fillStyle = g;
            this.ctx.beginPath();
            this.ctx.arc(a.x + a.width/2, a.y + a.height/2, a.width/2, 0, Math.PI*2);
            this.ctx.fill();
        });
        this.ctx.globalCompositeOperation = 'source-over';
    }

    drawObject(o) {
        let fillStyle = o.color || '#555';
        if (o.type === 'ground') {
             fillStyle = '#3d3d3d'; 
             this.ctx.fillStyle = fillStyle; this.ctx.fillRect(o.x, o.y, o.width, o.height);
             this.ctx.fillStyle = '#2a2a2a'; this.ctx.fillRect(o.x, o.y, o.width, 4);
        } else if (o.type === 'high') {
             fillStyle = '#6a6a6a'; 
             this.ctx.fillStyle = fillStyle; this.ctx.fillRect(o.x, o.y, o.width, o.height);
             this.ctx.fillStyle = '#888'; this.ctx.fillRect(o.x, o.y, o.width, 2);
        } else if (o.type === 'bridge') {
             this.ctx.fillStyle = '#654321'; this.ctx.fillRect(o.x, o.y, o.width, o.height);
             this.ctx.fillStyle = '#5c3a1e'; for(let i=5; i<o.width; i+=15) this.ctx.fillRect(o.x+i, o.y, 2, o.height);
        } else if (o.type === 'box') {
             this.ctx.fillStyle = o.color || '#696969'; this.ctx.fillRect(o.x, o.y, o.width, o.height);
             this.ctx.strokeStyle = '#444'; this.ctx.strokeRect(o.x+5, o.y+5, o.width-10, o.height-10);
        } else {
             this.ctx.fillStyle = fillStyle; this.ctx.fillRect(o.x, o.y, o.width, o.height);
        }
        this.ctx.strokeStyle = 'rgba(0,0,0,0.5)'; this.ctx.lineWidth = 1; this.ctx.strokeRect(o.x, o.y, o.width, o.height);
    }

    drawCollectible(c) {
        this.ctx.fillStyle = c.color; this.ctx.beginPath();
        this.ctx.arc(c.x + c.width/2, c.y + c.height/2, 6, 0, Math.PI*2);
        this.ctx.fill(); this.ctx.shadowColor = c.color; this.ctx.shadowBlur = 10;
        this.ctx.strokeStyle = '#fff'; this.ctx.stroke(); this.ctx.shadowBlur = 0;
    }

    drawCharacter(c, name) {
        this.ctx.fillStyle = c.color; this.ctx.fillRect(c.x, c.y, c.width, c.height);
        this.ctx.fillStyle = '#fff'; const eyeH = c.y + 10;
        if (name === 'cain') { this.ctx.fillRect(c.x + 5, eyeH, 5, 5); this.ctx.fillRect(c.x + 20, eyeH, 5, 5); }
        else { this.ctx.shadowColor = '#87CEEB'; this.ctx.shadowBlur = 15; this.ctx.fillRect(c.x + 5, eyeH, 4, 4); this.ctx.fillRect(c.x + 16, eyeH, 4, 4); this.ctx.shadowBlur = 0; }
    }
    
    drawExitGate(g) {
        this.ctx.fillStyle = '#111'; this.ctx.fillRect(g.x, g.y, g.width, g.height);
        this.ctx.strokeStyle = '#FFD700'; this.ctx.lineWidth = 3; this.ctx.strokeRect(g.x, g.y, g.width, g.height);
        this.ctx.fillStyle = 'rgba(255, 215, 0, 0.2)'; this.ctx.fillRect(g.x + 5, g.y + 5, g.width - 10, g.height - 5);
    }
    
    render() {
        this.ctx.save();
        if (this.shakeIntensity > 0) {
            const dx = (Math.random() - 0.5) * this.shakeIntensity;
            const dy = (Math.random() - 0.5) * this.shakeIntensity;
            this.ctx.translate(dx, dy);
        }

        this.ctx.clearRect(0, 0, this.width, this.height);
        
        this.drawBackground();
        this.applyDarkness();

        [...this.platforms, ...this.earthPlatforms, ...this.bridges, ...this.barriers, ...this.gateBarriers, ...this.movableObjects, ...this.switches].forEach(o => {
            if (o.visible !== false) this.drawObject(o);
        });

        [...this.collectibles, ...this.hiddenCollectibles].forEach(c => {
             if (!c.collected && (c.visible !== false || c.revealed)) this.drawCollectible(c);
        });

        if (this.exitGate) this.drawExitGate(this.exitGate);

        this.particles.forEach(p => p.draw(this.ctx));

        Object.entries(this.characters).forEach(([name, char]) => this.drawCharacter(char, name));
        
        const active = this.characters[this.currentCharacter];
        if (active) {
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(active.x - 2, active.y - 2, active.width + 4, active.height + 4);
        }

        this.ctx.restore();
    }
    
    gameLoop() {
        try {
            this.update();
            this.render();
            requestAnimationFrame(() => this.gameLoop());
        } catch (e) {
            console.error("Game Loop Error:", e);
        }
    }
}

window.addEventListener('load', () => {
    try {
        const btn = document.getElementById('startButton');
        btn.addEventListener('click', () => {
            document.getElementById('startButtonContainer').classList.add('hidden');
            new Game();
        });
    } catch(e) {
        console.error("Initialization Error:", e);
    }
});
