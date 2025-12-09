// Cain and Abel - A Journey of Unity
// A cooperative puzzle platformer game

class Game {
    constructor() {
        this.canvas = document.getElementById('game');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Game state - Updated for separate offerings
        this.currentLevel = 1;
        this.currentCharacter = 'cain';
        this.gameState = 'playing'; // playing, paused, levelComplete, gameComplete
        this.cainOfferings = 0;
        this.abelOfferings = 0;
        this.maxCainOfferings = 3;
        this.maxAbelOfferings = 3;
        this.exitGate = null;
        this.exitGateSpawned = false;
        
        // Game objects
        this.characters = {};
        this.platforms = [];
        this.movableObjects = [];
        this.switches = [];
        this.barriers = [];
        this.earthPlatforms = [];
        this.illuminatedAreas = [];
        this.collectibles = [];
        this.hiddenCollectibles = []; // New: hidden offerings revealed by illumination
        this.finishArea = null;
        this.gateBarriers = []; // New: barriers protecting the gate
        this.bridges = []; // Bridge system for connecting islands
        this.exitGateSpawned = false; // Reset gate spawn status
        
        // Physics
        this.gravity = 0.5;
        this.friction = 0.85;
        
        // Audio
        this.heartacheMusic = new Audio('Heartache.mp3');
        this.heartacheMusic.volume = 0.8; // Lower volume by 20%
        this.ominousBellsMusic = new Audio('Ominous Bells of Doom.mp3');
        this.currentMusic = null;
        
        // Darkness/visibility system
        this.darkness = 0.85; // How dark the environment is (0 = bright, 1 = completely dark)
        
        // Input handling
        this.keys = {};
        this.keysPressed = {}; // Track key press events
        this.setupEventListeners();
        
        // Initialize game
        this.initializeCharacters();
        this.loadLevel(this.currentLevel);
        this.gameLoop();
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.keys[e.code]) {
                this.keysPressed[e.code] = true;
            }
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
            case 'KeyP':
                this.togglePause();
                break;
            case 'KeyR':
                if (e.ctrlKey) {
                    this.restartLevel();
                }
                break;
            case 'Digit1':
                this.switchCharacter('cain');
                break;
            case 'Digit2':
                this.switchCharacter('abel');
                break;
        }
    }
    
    initializeCharacters() {
        // Cain - Earth-Bound character
        this.characters.cain = {
            x: 100,
            y: 400,
            width: 30,
            height: 40,
            vx: 0,
            vy: 0,
            onGround: false,
            color: '#8B4513', // Brown
            abilities: {
                canPush: true,
                canCreatePlatform: true,
                canBreakBarrier: true
            },
            pushPower: 3,
            platformCooldown: 0,
            breakCooldown: 0,
            offerings: 0
        };
        
        // Abel - Sky-Tender character
        this.characters.abel = {
            x: 150,
            y: 400,
            width: 25,
            height: 35,
            vx: 0,
            vy: 0,
            onGround: false,
            color: '#87CEEB', // Sky blue
            abilities: {
                canDoubleJump: true,
                canGlide: true,
                canIlluminate: true
            },
            jumpCount: 0,
            maxJumps: 2,
            illuminationCooldown: 0,
            illuminationRadius: 600,
            offerings: 0
        };
    }
    
    loadLevel(level) {
        // Clear existing level objects
        this.platforms = [];
        this.movableObjects = [];
        this.switches = [];
        this.barriers = [];
        this.earthPlatforms = [];
        this.illuminatedAreas = [];
        this.collectibles = [];
        this.hiddenCollectibles = [];
        this.finishArea = null;
        this.exitGate = null;
        this.exitGateSpawned = false;
        this.gateBarriers = [];
        this.bridges = []; // Clear bridges
        
        // Level-specific setup
        switch(level) {
            case 1:
                this.loadLevel1();
                break;
            case 2:
                this.loadLevel2();
                break;
            case 3:
                this.loadLevel3();
                break;
            case 4:
                this.loadLevelFinal();
                break;
        }

        // Music logic
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }
        if (level >= 1 && level <= 3) {
            this.currentMusic = this.heartacheMusic;
            this.currentMusic.loop = true;
            this.currentMusic.play();
        } else if (level === 4) {
            this.currentMusic = this.ominousBellsMusic;
            this.currentMusic.loop = true;
            this.currentMusic.play();
        }
        
        this.updateUI();
    }
    
    loadLevel1() {
        // Tutorial Level: "Puzzle Islands" - Bridge Building Adventure
        
        // Longer floating islands with breathing room
        this.platforms.push(
            {x: 0, y: 550, width: 200, height: 50, type: 'ground'},
            {x: 300, y: 500, width: 180, height: 50, type: 'ground'},
            {x: 600, y: 450, width: 160, height: 50, type: 'ground'},
            {x: 900, y: 400, width: 100, height: 50, type: 'ground'},
            {x: 1100, y: 350, width: 100, height: 50, type: 'ground'}
        );
        
        // High platforms for Abel's double jump
        this.platforms.push(
            {x: 350, y: 420, width: 80, height: 20, type: 'high'},
            {x: 650, y: 370, width: 80, height: 20, type: 'high'}
        );
        
        // Movable objects for bridge building
        this.movableObjects.push(
            {
                x: 220,
                y: 520,
                width: 35,
                height: 35,
                color: '#696969',
                type: 'box',
                canBePushed: true
            },
            {
                x: 550,
                y: 400,
                width: 35,
                height: 35,
                color: '#696969',
                type: 'box',
                canBePushed: true
            }
        );
        
        // Bridge switches that create connections between islands (invisible until illuminated)
        this.switches.push(
            {
                x: 380,
                y: 380, // High switch - only Abel can reach
                width: 25,
                height: 25,
                color: '#FFD700',
                activated: false,
                type: 'bridge1',
                visible: false,
                character: 'abel'
            },
            {
                x: 680,
                y: 330, // High switch - only Abel can reach
                width: 25,
                height: 25,
                color: '#FFD700',
                activated: false,
                type: 'bridge2',
                visible: false,
                character: 'abel'
            },
            {
                x: 950,
                y: 360, // High switch - now bridge3, Abel can reach after illumination
                width: 25,
                height: 25,
                color: '#FFD700',
                activated: false,
                type: 'bridge3',
                visible: false,
                character: 'abel'
            },
            {
                x: 1150,
                y: 310, // New gate switch
                width: 25,
                height: 25,
                color: '#FFD700',
                activated: false,
                type: 'gate',
                visible: true,
                character: 'cain'
            }
        );
        
        // Barriers that Cain must break
        this.barriers.push(
            {
                x: 520,
                y: 350,
                width: 25,
                height: 100,
                color: '#8B4513',
                type: 'breakable',
                health: 1
            },
            {
                x: 800,
                y: 300,
                width: 25,
                height: 100,
                color: '#8B4513',
                type: 'breakable',
                health: 1
            }
        );
        
        // Cain's offerings (2 total) - visible and accessible
        this.collectibles.push(
            {
                x: 350,
                y: 480,
                width: 18,
                height: 18,
                color: '#CD853F', // Brown for Cain
                type: 'cain_offering',
                collected: false,
                character: 'cain'
            },
            {
                x: 950,
                y: 380,
                width: 18,
                height: 18,
                color: '#CD853F', // Brown for Cain
                type: 'cain_offering',
                collected: false,
                character: 'cain'
            }
        );
        
        // Abel's offerings (2 total) - 1 visible, 1 hidden
        this.collectibles.push(
            {
                x: 650,
                y: 430,
                width: 18,
                height: 18,
                color: '#87CEEB', // Sky blue for Abel
                type: 'abel_offering',
                collected: false,
                character: 'abel'
            }
        );
        
        // Abel's hidden offering - only visible when illuminated
        this.hiddenCollectibles.push(
            {
                x: 450,
                y: 480,
                width: 16,
                height: 16,
                color: '#87CEEB', // Sky blue for Abel
                type: 'hidden_abel_offering',
                collected: false,
                character: 'abel',
                revealed: false
            },
            {
                x: 700,
                y: 380,
                width: 16,
                height: 16,
                color: '#87CEEB', // Sky blue for Abel
                type: 'hidden_abel_offering',
                collected: false,
                character: 'abel',
                revealed: false
            }
        );
        
        // Gate barriers that trap the exit - Cain must break them
        this.gateBarriers.push(
            {x: 1080, y: 300, width: 20, height: 100, color: '#8B0000', type: 'gate_barrier', health: 2},
            {x: 1120, y: 300, width: 20, height: 100, color: '#8B0000', type: 'gate_barrier', health: 2}
        );
        
        // Reset character positions and velocities
        this.characters.cain.x = 50;
        this.characters.cain.y = 500;
        this.characters.cain.vx = 0;
        this.characters.cain.vy = 0;
        this.characters.cain.onGround = false;
        this.characters.abel.x = 100;
        this.characters.abel.y = 500;
        this.characters.abel.vx = 0;
        this.characters.abel.vy = 0;
        this.characters.abel.onGround = false;
        this.characters.abel.jumpCount = 0;
        this.characters.abel.offerings = 0;
    }
    
    loadLevel2() {
        // Level 2: "Canyon Crossing" - Bridge-centric Puzzle

        // Main ground platforms
        this.platforms.push(
            {x: 0, y: 550, width: 200, height: 50, type: 'ground'},
            {x: 400, y: 500, width: 150, height: 50, type: 'ground'},
            {x: 800, y: 450, width: 100, height: 50, type: 'ground'},
            {x: 1050, y: 400, width: 150, height: 50, type: 'ground'}
        );

        // High platforms for Abel to reach switches
        this.platforms.push(
            {x: 300, y: 420, width: 80, height: 20, type: 'high'},
            {x: 700, y: 370, width: 80, height: 20, type: 'high'}
        );

        // Movable objects for Cain to push onto switches or to reach items
        this.movableObjects.push(
            {x: 150, y: 520, width: 35, height: 35, color: '#696969', type: 'box', canBePushed: true},
            {x: 500, y: 470, width: 35, height: 35, color: '#696969', type: 'box', canBePushed: true}
        );

        // Switches (bridge switches for Abel, gate switch for Cain)
        this.switches.push(
            {x: 330, y: 380, width: 25, height: 25, color: '#FFD700', activated: false, type: 'bridge1', visible: false, character: 'abel'}, // Activates bridge to next platform
            {x: 730, y: 330, width: 25, height: 25, color: '#FFD700', activated: false, type: 'bridge2', visible: false, character: 'abel'}, // Activates bridge to final platform area
            {x: 1100, y: 360, width: 25, height: 25, color: '#FFD700', activated: false, type: 'bridge3', visible: false, character: 'abel'},
            {
                x: 1150,
                y: 360, // New gate switch
                width: 25,
                height: 25,
                color: '#FFD700',
                activated: false,
                type: 'gate',
                visible: true,
                character: 'cain'
            }
        );

        // Barriers that Cain must break
        this.barriers.push(
            {x: 600, y: 400, width: 25, height: 100, color: '#8B4513', type: 'breakable', health: 2}
        );

        // Collectibles
        this.collectibles.push(
            {x: 80, y: 530, width: 18, height: 18, color: '#CD853F', type: 'cain_offering', collected: false, character: 'cain'},
            {x: 450, y: 480, width: 18, height: 18, color: '#CD853F', type: 'cain_offering', collected: false, character: 'cain'},
            {x: 900, y: 430, width: 18, height: 18, color: '#CD853F', type: 'cain_offering', collected: false, character: 'cain'}
        );

        this.collectibles.push(
            {x: 350, y: 400, width: 18, height: 18, color: '#87CEEB', type: 'abel_offering', collected: false, character: 'abel'}
        );

        this.hiddenCollectibles.push(
            {x: 1000, y: 380, width: 16, height: 16, color: '#87CEEB', type: 'hidden_abel_offering', collected: false, character: 'abel', revealed: false},
            {x: 750, y: 350, width: 16, height: 16, color: '#87CEEB', type: 'hidden_abel_offering', collected: false, character: 'abel', revealed: false}
        );

        // Gate barriers
        this.gateBarriers.push(
            {x: 1150, y: 300, width: 20, height: 100, color: '#8B0000', type: 'gate_barrier', health: 3}
        );

        // Character starting positions
        this.characters.cain.x = 50;
        this.characters.cain.y = 500;
        this.characters.cain.vx = 0;
        this.characters.cain.vy = 0;
        this.characters.cain.onGround = false;
        this.characters.cain.offerings = 0;

        this.characters.abel.x = 100;
        this.characters.abel.y = 500;
        this.characters.abel.vx = 0;
        this.characters.abel.vy = 0;
        this.characters.abel.onGround = false;
        this.characters.abel.jumpCount = 0;
        this.characters.abel.offerings = 0;

        this.cainOfferings = 0;
        this.abelOfferings = 0;
    }
    
    loadLevel3() {
        // Final Level: "The Confrontation" - Cain vs. Abel

        // Flat open area
        this.platforms.push(
            {x: 0, y: 550, width: this.width, height: 50, type: 'ground'}
        );

        // Cain's starting position
        this.characters.cain.x = 200;
        this.characters.cain.y = 500;
        this.characters.cain.vx = 0;
        this.characters.cain.vy = 0;
        this.characters.cain.onGround = false;
        this.characters.cain.offerings = 0;

        // Abel's starting position (passive target)
        this.characters.abel.x = 800;
        this.characters.abel.y = 500;
        this.characters.abel.vx = 0;
        this.characters.abel.vy = 0;
        this.characters.abel.onGround = false;
        this.characters.abel.jumpCount = 0;
        this.characters.abel.offerings = 0;
        
        // Ensure Abel is not controllable in this level
        this.currentCharacter = 'cain';

        this.cainOfferings = 0;
        this.abelOfferings = 0;
        
        // No switches, barriers, collectibles, etc. in this level
        this.movableObjects = [];
        this.switches = [];
        this.barriers = [];
        this.earthPlatforms = [];
        this.illuminatedAreas = [];
        this.collectibles = [];
        this.hiddenCollectibles = [];
        this.finishArea = null;
        // Define the exit gate for Level 4
        this.exitGate = {
            x: 1100,
            y: 470, // Position on the ground platform
            width: 50,
            height: 80,
            type: 'exit_gate'
        };
        this.exitGateSpawned = true; // Gate is always spawned in level 4
        this.gateBarriers = [];
    }
    
    loadLevelFinal() {
        // Final Level: "The Confrontation" - Cain vs. Abel

        // Flat open area
        this.platforms.push(
            {x: 0, y: 550, width: this.width, height: 50, type: 'ground'}
        );

        // Cain's starting position
        this.characters.cain.x = 200;
        this.characters.cain.y = 500;
        this.characters.cain.vx = 0;
        this.characters.cain.vy = 0;
        this.characters.cain.onGround = false;
        this.characters.cain.offerings = 0;

        // Abel's starting position (passive target)
        this.characters.abel.x = 800;
        this.characters.abel.y = 500;
        this.characters.abel.vx = 0;
        this.characters.abel.vy = 0;
        this.characters.abel.onGround = false;
        this.characters.abel.jumpCount = 0;
        this.characters.abel.offerings = 0;
        
        // Ensure Abel is not controllable in this level
        this.currentCharacter = 'cain';

        this.cainOfferings = 0;
        this.abelOfferings = 0;
        
        // No switches, barriers, collectibles, etc. in this level
        this.movableObjects = [];
        this.switches = [];
        this.barriers = [];
        this.earthPlatforms = [];
        this.illuminatedAreas = [];
        this.collectibles = [];
        this.hiddenCollectibles = [];
        this.finishArea = null;
        // Define the exit gate for Level 4
        this.exitGate = {
            x: 1100,
            y: 470, // Position on the ground platform
            width: 50,
            height: 80,
            type: 'exit_gate'
        };
        this.exitGateSpawned = true; // Gate is always spawned in level 4
        this.gateBarriers = [];
    }
    
    update() {
        if (this.gameState === 'finalGameComplete') return; // Stop all updates on final game complete
        
        if (this.gameState !== 'playing' && !(this.currentLevel === 4 && this.gameState === 'gameComplete')) return; // Allow movement in gameComplete for Level 4
        
        this.updateCharacters();
        this.updatePhysics();
        this.updateAbilities();
        this.checkCollisions();
        this.updateSwitches();
        this.checkGateSpawn();
        this.updateUI();
        this.checkLevelComplete();
    }
    
    updateCharacters() {
        const cain = this.characters.cain;
        const abel = this.characters.abel;
        
        // Cain controls
        if (this.currentCharacter === 'cain') {
            let cainSpeed = 1.5; // Consistent slower speed for all levels
            let cainJump = -8;   // Consistent lower jump for all levels

            if (this.keys['KeyA']) cain.vx = -cainSpeed;
            else if (this.keys['KeyD']) cain.vx = cainSpeed;
            else cain.vx *= this.friction;
            
            if (this.keysPressed['KeyW'] && cain.onGround) {
                cain.vy = cainJump;
                cain.onGround = false;
                this.keysPressed['KeyW'] = false;
            }
            
            // Cain abilities
            if (this.keys['KeyE']) {
                this.handleCainPush();
            }
            if (this.keys['KeyR'] && cain.platformCooldown <= 0) {
                this.createEarthPlatform(cain.x, cain.y + cain.height);
                cain.platformCooldown = 120; // 2 seconds at 60fps
            }
            if (this.keys['KeyT'] && cain.breakCooldown <= 0) {
                this.breakBarrier(cain.x, cain.y);
                cain.breakCooldown = 60; // 1 second cooldown
            }
        }
        
        // Abel controls
        if (this.currentCharacter === 'abel' && this.currentLevel !== 4) {
            if (this.keys['KeyJ']) abel.vx = -3;
            else if (this.keys['KeyL']) abel.vx = 3;
            else abel.vx *= this.friction;
            
            if (this.keysPressed['ShiftLeft'] || this.keysPressed['ShiftRight']) {
                if (abel.onGround) {
                    abel.vy = -12;
                    abel.onGround = false;
                    abel.jumpCount = 1;
                } else if (abel.jumpCount < abel.maxJumps) {
                    abel.vy = -10;
                    abel.jumpCount++;
                }
                this.keysPressed['ShiftLeft'] = false;
                this.keysPressed['ShiftRight'] = false;
            }
            
            // Abel abilities
            // Abel's gliding is now automatic based on gravity and vy
            if (this.keys['KeyF'] && abel.illuminationCooldown <= 0) {
                this.illuminateArea(abel.x, abel.y);
                abel.illuminationCooldown = 180; // 3 seconds cooldown
            }
        }
        
        // Update cooldowns
        if (cain.platformCooldown > 0) cain.platformCooldown--;
        if (cain.breakCooldown > 0) cain.breakCooldown--;
        if (abel.illuminationCooldown > 0) abel.illuminationCooldown--;
    }
    
    updatePhysics() {
        // Apply gravity and update positions
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
        
        // Update earth platforms (they dissolve over time)
        this.earthPlatforms = this.earthPlatforms.filter(platform => {
            platform.lifetime--;
            return platform.lifetime > 0;
        });
        
        // Update illumination areas
        this.illuminatedAreas = this.illuminatedAreas.filter(area => {
            area.lifetime--;
            return area.lifetime > 0;
        });
    }
    
    updateAbilities() {
        // Handle Abel's automatic gliding
        const abel = this.characters.abel;
        if (abel && abel.vy > 0 && !abel.onGround) {
            abel.vy *= 0.3; // Automatically slow down falling
        }
    }
    
    updateSwitches() {
        // Check switch activations and create bridges
        this.switches.forEach(switch_obj => {
            const currentChar = this.characters[this.currentCharacter];
            
            // Make switches visible when illuminated by Abel
            if (switch_obj.character === 'abel' && !switch_obj.visible) {
                const abel = this.characters.abel;
                const distance = Math.sqrt(
                    Math.pow(switch_obj.x - abel.x, 2) + Math.pow(switch_obj.y - abel.y, 2)
                );
                if (distance <= abel.illuminationRadius) {
                    switch_obj.visible = true;
                }
            }
            
            // Only allow activation if switch is visible and by correct character
            if (switch_obj.visible && this.checkCollision(currentChar, switch_obj) && 
                !switch_obj.activated && currentChar === this.characters[switch_obj.character]) {
                switch_obj.activated = true;
                
                switch(switch_obj.type) {
                    case 'bridge1':
                        if (this.currentLevel === 1) {
                            this.createBridge(200, 500, 100, 20);
                        } else if (this.currentLevel === 2) {
                            this.createBridge(200, 500, 100, 20);
                        } else if (this.currentLevel === 3) {
                            this.createBridge(100, 500, 150, 20);
                        }
                        this.showMessage("Bridge 1 activated!");
                        break;
                    case 'bridge2':
                        if (this.currentLevel === 1) {
                            this.createBridge(480, 450, 120, 20);
                        } else if (this.currentLevel === 2) {
                            this.createBridge(550, 450, 200, 20);
                        } else if (this.currentLevel === 3) {
                            this.createBridge(600, 400, 150, 20);
                        }
                        this.showMessage("Bridge 2 activated!");
                        break;
                    case 'bridge3':
                        if (this.currentLevel === 1) {
                            this.createBridge(1000, 350, 100, 20);
                        } else if (this.currentLevel === 2) {
                            this.createBridge(900, 400, 150, 20);
                        } else if (this.currentLevel === 3) {
                            this.createBridge(580, 300, 120, 20);
                        }
                        this.showMessage("Bridge 3 activated!");
                        break;
                    case 'gate':
                        this.spawnExitGate();
                        this.showMessage("Exit gate revealed!");
                        break;
                }
            }
        });
    }
    
    createBridge(x, y, width, height) {
        this.bridges.push({
            x: x,
            y: y,
            width: width,
            height: height,
            color: '#8B4513',
            type: 'bridge'
        });
    }
    
    
    checkCollisions() {
        Object.values(this.characters).forEach(char => {
            char.onGround = false;
            
            // Platform collisions
            this.platforms.forEach(platform => {
                if (this.checkCollision(char, platform)) {
                    if (char.vy > 0 && char.y < platform.y) {
                        char.y = platform.y - char.height;
                        char.vy = 0;
                        char.onGround = true;
                        char.jumpCount = 0;
                    }
                }
            });
            
            // Earth platform collisions
            this.earthPlatforms.forEach(platform => {
                if (this.checkCollision(char, platform)) {
                    if (char.vy > 0 && char.y < platform.y) {
                        char.y = platform.y - char.height;
                        char.vy = 0;
                        char.onGround = true;
                        char.jumpCount = 0;
                    }
                }
            });
            
            // Bridge collisions
            this.bridges.forEach(bridge => {
                if (this.checkCollision(char, bridge)) {
                    if (char.vy > 0 && char.y < bridge.y) {
                        char.y = bridge.y - char.height;
                        char.vy = 0;
                        char.onGround = true;
                        char.jumpCount = 0;
                    }
                }
            });
            
            // Movable object collisions
            this.movableObjects.forEach(obj => {
                if (this.checkCollision(char, obj)) {
                    // Basic collision response for movable objects
                    if (char.vy > 0 && char.y < obj.y) {
                        char.y = obj.y - char.height;
                        char.vy = 0;
                        char.onGround = true;
                        char.jumpCount = 0;
                    } else if (char.vy < 0 && char.y + char.height > obj.y + obj.height) {
                        char.y = obj.y + obj.height;
                        char.vy = 0;
                    } else if (char.vx > 0 && char.x < obj.x) {
                        char.x = obj.x - char.width;
                        char.vx = 0;
                    } else if (char.vx < 0 && char.x + char.width > obj.x + obj.width) {
                        char.x = obj.x + obj.width;
                        char.vx = 0;
                    }
                }
            });
            
            // Barrier collisions
            this.barriers.forEach(barrier => {
                if (this.checkCollision(char, barrier)) {
                    if (char.vy > 0 && char.y < barrier.y) {
                        char.y = barrier.y - char.height;
                        char.vy = 0;
                        char.onGround = true;
                        char.jumpCount = 0;
                    } else if (char.vy < 0 && char.y + char.height > barrier.y + barrier.height) {
                        char.y = barrier.y + barrier.height;
                        char.vy = 0;
                    } else if (char.vx > 0 && char.x < barrier.x) {
                        char.x = barrier.x - char.width;
                        char.vx = 0;
                    } else if (char.vx < 0 && char.x + char.width > barrier.x + barrier.width) {
                        char.x = barrier.x + barrier.width;
                        char.vx = 0;
                    }
                }
            });

            // Gate barrier collisions
            this.gateBarriers.forEach(barrier => {
                if (this.checkCollision(char, barrier)) {
                    if (char.vy > 0 && char.y < barrier.y) {
                        char.y = barrier.y - char.height;
                        char.vy = 0;
                        char.onGround = true;
                        char.jumpCount = 0;
                    } else if (char.vy < 0 && char.y + char.height > barrier.y + barrier.height) {
                        char.y = barrier.y + barrier.height;
                        char.vy = 0;
                    } else if (char.vx > 0 && char.x < barrier.x) {
                        char.x = barrier.x - char.width;
                        char.vx = 0;
                    } else if (char.vx < 0 && char.x + char.width > barrier.x + barrier.width) {
                        char.x = barrier.x + barrier.width;
                        char.vx = 0;
                    }
                }
            });
            
            // Collectible collisions - character-specific
            this.collectibles.forEach(collectible => {
                if (!collectible.collected && this.checkCollision(char, collectible)) {
                    if (collectible.character === 'cain' && char === this.characters.cain) {
                        collectible.collected = true;
                        this.cainOfferings++;
                        this.showMessage(`Cain's offering collected! (${this.cainOfferings}/${this.maxCainOfferings})`);
                    } else if (collectible.character === 'abel' && char === this.characters.abel) {
                        collectible.collected = true;
                        this.abelOfferings++;
                        this.showMessage(`Abel's offering collected! (${this.abelOfferings}/${this.maxAbelOfferings})`);
                    }
                }
            });
            
            // Hidden collectible collisions - revealed by illumination
            this.hiddenCollectibles.forEach(collectible => {
                if (!collectible.collected && collectible.revealed && this.checkCollision(char, collectible)) {
                    if (collectible.character === 'abel' && char === this.characters.abel) {
                        collectible.collected = true;
                        this.abelOfferings++;
                        this.showMessage(`Hidden offering revealed and collected! (${this.abelOfferings}/2)`);
                    }
                }
            });
            
            // Exit gate collision
            if (this.exitGate && this.checkCollision(char, this.exitGate)) {
                // Check if near exit gate - both characters must be present
                const cain = this.characters.cain;
                const abel = this.characters.abel;
                const gate = this.exitGate;
                
                const cainNearGate = Math.abs(cain.x - gate.x) < 80 && Math.abs(cain.y - gate.y) < 80;
                const abelNearGate = Math.abs(abel.x - gate.x) < 80 && Math.abs(abel.y - gate.y) < 80;
                
                if (cainNearGate && abelNearGate && this.gateBarriers.length === 0) {
                    this.completeLevel();
                }
            }
            
            // Level 4: Cain kills Abel collision or passes through door
            if (this.currentLevel === 4) {
                if (char === this.characters.cain && this.checkCollision(this.characters.cain, this.characters.abel)) {
                    this.gameState = 'gameComplete'; // Abel is killed
                    this.showMessage('Cain rose up against his brother Abel and killed him.', 5000); // 5 seconds
                    delete this.characters.abel; // Remove Abel after he is killed

                    // Show mark of Cain message after a delay
                    setTimeout(() => {
                        this.showMessage('The Lord put a mark on Cain so that no one who found him would kill him. He was doomed to wander the earth.', 5000); // 5 seconds
                        // Fade to black and show restart button after another delay
                        setTimeout(() => {
                            this.fadeToBlackAndShowRestart();
                        }, 5000); // Wait for mark of Cain message to be read
                    }, 5000); // Wait for kill message to be read
                }
                // If Abel is killed, and Cain collides with the exit gate
                if (this.gameState === 'gameComplete' && char === this.characters.cain && this.checkCollision(this.characters.cain, this.exitGate)) {
                    // This branch is now handled by the setTimeout chain above, so we effectively remove it.
                    // However, we still need the exitGate definition to be there for drawing.
                }
            }
        });
    }
    
    checkGateSpawn() {
        if (!this.exitGateSpawned && this.cainOfferings >= 2 && this.abelOfferings >= 3) {
            this.spawnExitGate();
        }
    }
    
    spawnExitGate() {
        this.exitGateSpawned = true;
        this.exitGate = {
            x: 1150,
            y: this.currentLevel === 1 ? 300 : (this.currentLevel === 2 ? 250 : 300),
            width: 50,
            height: 80,
            type: 'exit_gate'
        };
        this.showMessage('Exit gate has appeared! Break the barriers to access it!');
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    handleCainPush() {
        const cain = this.characters.cain;
        const pushDirection = cain.vx > 0 ? 1 : -1;
        
        this.movableObjects.forEach(obj => {
            if (this.checkCollision(cain, obj) && obj.canBePushed) {
                obj.x += pushDirection * cain.pushPower;
                obj.x = Math.max(0, Math.min(this.width - obj.width, obj.x));
            }
        });
    }
    
    createEarthPlatform(x, y) {
        this.earthPlatforms.push({
            x: x - 20,
            y: y,
            width: 40,
            height: 10,
            color: '#8B4513',
            lifetime: 300, // 5 seconds at 60fps
            type: 'earth'
        });
    }
    
    breakBarrier(x, y) {
        // Break regular barriers
        this.barriers.forEach((barrier, index) => {
            if (this.checkCollision({x, y, width: 50, height: 50}, barrier)) {
                barrier.health--;
                if (barrier.health <= 0) {
                    this.barriers.splice(index, 1);
                    this.showMessage("Barrier broken!");
                }
            }
        });
        
        // Break gate barriers
        this.gateBarriers.forEach((barrier, index) => {
            if (this.checkCollision({x, y, width: 50, height: 50}, barrier)) {
                barrier.health--;
                if (barrier.health <= 0) {
                    this.gateBarriers.splice(index, 1);
                    this.showMessage("Gate barrier destroyed!");
                }
            }
        });
    }
    
    illuminateArea(x, y) {
        // Create illumination area with larger radius
        const abel = this.characters.abel;
        this.illuminatedAreas.push({
            x: x - abel.illuminationRadius/2,
            y: y - abel.illuminationRadius/2,
            width: abel.illuminationRadius,
            height: abel.illuminationRadius,
            color: 'rgba(255, 255, 0, 0.4)',
            lifetime: 180, // 3 seconds
            type: 'illumination'
        });
        
        // Reveal hidden collectibles within illumination radius
        this.hiddenCollectibles.forEach(collectible => {
            if (!collectible.revealed) {
                const dx = collectible.x - x;
                const dy = collectible.y - y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= abel.illuminationRadius) {
                    collectible.revealed = true;
                    this.showMessage("Hidden offering revealed by light!");
                }
            }
        });
    }
    
    switchCharacter(character) {
        this.currentCharacter = character;
        this.updateUI();
    }
    
    togglePause() {
        this.gameState = this.gameState === 'playing' ? 'paused' : 'playing';
        this.showMessage(this.gameState === 'paused' ? 'Game Paused' : 'Game Resumed');
    }
    
    restartLevel() {
        this.cainOfferings = 0;
        this.abelOfferings = 0;
        this.exitGateSpawned = false;
        this.bridges = []; // Clear bridges
        this.initializeCharacters(); // Reinitialize characters
        this.loadLevel(this.currentLevel);
        this.gameState = 'playing';
        this.characters.cain.vx = 0;
        this.characters.cain.vy = 0;
        this.characters.abel.vx = 0;
        this.characters.abel.vy = 0;
        this.updateUI(); // Update UI immediately
        this.render();   // Render immediately after reset
        this.showMessage('Level Restarted');
    }
    
    completeLevel() {
        const completedLevel = this.currentLevel; // Store current level before incrementing

        this.currentLevel++;
        if (this.currentLevel > 4) { // Update for new final level
            this.gameState = 'gameComplete';
            this.showMessage('The Lord said to Cain, "Where is your brother Abel?"');
        } else {
            this.gameState = 'levelComplete';
            this.showMessage(`Level ${completedLevel} Complete! Proceeding to Level ${this.currentLevel}`);
            setTimeout(() => {
                this.cainOfferings = 0;
                this.abelOfferings = 0;
                this.exitGateSpawned = false;
                this.loadLevel(this.currentLevel);
                this.gameState = 'playing';
                this.characters.cain.vx = 0;
                this.characters.cain.vy = 0;
                this.characters.abel.vx = 0;
                this.characters.abel.vy = 0;
                // If transitioning to Level 4, show the specific message
                if (this.currentLevel === 4) {
                    this.showMessage('"Am I my brother\'s keeper?"');
                }
            }, 2000);
        }
    }
    
    checkLevelComplete() {
        // This is now handled by completeLevel() method called from collision detection
    }
    
    updateUI() {
        document.getElementById('currentCharacter').textContent = `Current: ${this.currentCharacter.charAt(0).toUpperCase() + this.currentCharacter.slice(1)}`;
        document.getElementById('levelProgress').textContent = `Level: ${this.currentLevel}`;
        document.getElementById('offerings').textContent = `Cain: ${this.cainOfferings}/2 | Abel: ${this.abelOfferings}/3`;
    }
    
    showMessage(text, duration = 3000) {
        const messageEl = document.getElementById('gameMessage');
        const contentEl = document.getElementById('messageContent');
        contentEl.textContent = text;
        messageEl.classList.remove('hidden');
        
        setTimeout(() => {
            messageEl.classList.add('hidden');
        }, duration); // Use provided duration or default
    }

    addRestartButton() {
        const gameUI = document.getElementById('gameUI');
        let restartButton = document.getElementById('restartButton');

        if (!restartButton) {
            restartButton = document.createElement('button');
            restartButton.id = 'restartButton';
            restartButton.textContent = 'Restart Game';
            restartButton.classList.add('restart-button'); // Add a class for styling
            restartButton.addEventListener('click', () => this.restartGame());
            gameUI.appendChild(restartButton);
        }
    }

    restartGame() {
        // Stop and reset current music
        if (this.currentMusic) {
            this.currentMusic.pause();
            this.currentMusic.currentTime = 0;
        }

        // Reset all game state to initial values
        this.currentLevel = 1;
        this.currentCharacter = 'cain';
        this.gameState = 'playing';
        this.cainOfferings = 0;
        this.abelOfferings = 0;
        this.exitGateSpawned = false;

        // Clear game objects
        this.platforms = [];
        this.movableObjects = [];
        this.switches = [];
        this.barriers = [];
        this.earthPlatforms = [];
        this.illuminatedAreas = [];
        this.collectibles = [];
        this.hiddenCollectibles = [];
        this.finishArea = null;
        this.exitGate = null;
        this.gateBarriers = [];
        this.bridges = [];

        // Remove restart button if present
        const restartButton = document.getElementById('restartButton');
        if (restartButton) {
            restartButton.remove();
        }

        // Reinitialize characters and load Level 1
        this.ctx.clearRect(0, 0, this.width, this.height); // Clear canvas on restart
        this.initializeCharacters();
        this.loadLevel(this.currentLevel);
        this.updateUI();
        this.showMessage('Game Restarted!');
    }

    fadeToBlackAndShowRestart() {
        this.gameState = 'finalGameComplete';
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)'; // Start with a slight fade
        let opacity = 0;
        const fadeInterval = setInterval(() => {
            opacity += 0.02; // Increase opacity for fade effect
            this.ctx.fillRect(0, 0, this.width, this.height); // Draw black rectangle
            this.ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
            if (opacity >= 1) {
                clearInterval(fadeInterval);
                this.addRestartButton();
            }
        }, 50); // Fade speed
    }
    
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw dark background
        this.drawDarkBackground();
        
        // Apply darkness overlay (everything except illuminated areas)
        this.applyDarkness();
        
        // Draw game objects in illuminated areas or always visible
        this.drawGameObjects();
        
        // Draw illumination areas (light sources)
        this.illuminatedAreas.forEach(area => this.drawIllumination(area));
        
        // Draw characters (always visible with slight glow)
        Object.entries(this.characters).forEach(([name, char]) => {
            this.drawCharacter(char, name);
        });
        
        // Draw character selection highlight
        const currentChar = this.characters[this.currentCharacter];
        this.ctx.strokeStyle = '#FFD700';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(currentChar.x - 2, currentChar.y - 2, currentChar.width + 4, currentChar.height + 4);
    }
    
    drawDarkBackground() {
        if (this.currentLevel === 4) {
            // Reddish gradient background for Level 4
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(0, '#8B0000'); // Dark Red
            gradient.addColorStop(0.3, '#A52A2A'); // Brownish Red
            gradient.addColorStop(0.7, '#8B0000');
            gradient.addColorStop(1, '#610000'); // Even Darker Red
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        } else if (this.exitGateSpawned) {
            // Shining effect when gate is spawned
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(0, '#FFE4B5');
            gradient.addColorStop(0.3, '#F0E68C');
            gradient.addColorStop(0.6, '#FFD700');
            gradient.addColorStop(1, '#FFA500');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
            
            // Add sparkle effect
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            for (let i = 0; i < 20; i++) {
                const x = Math.random() * this.width;
                const y = Math.random() * this.height;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 2, 0, Math.PI * 2);
                this.ctx.fill();
            }
        } else {
            // Dark gradient background
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
            gradient.addColorStop(0, '#1a1a1a');
            gradient.addColorStop(0.3, '#2d2d2d');
            gradient.addColorStop(0.7, '#1a1a1a');
            gradient.addColorStop(1, '#0d0d0d');
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(0, 0, this.width, this.height);
        }
    }
    
    applyDarkness() {
        // Create darkness overlay - lighter when gate is spawned
        const darknessLevel = this.exitGateSpawned ? 0.2 : this.darkness;
        this.ctx.fillStyle = `rgba(0, 0, 0, ${darknessLevel})`;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Cut out illuminated areas from darkness
        this.illuminatedAreas.forEach(area => {
            this.ctx.globalCompositeOperation = 'destination-out';
            const gradient = this.ctx.createRadialGradient(
                area.x + area.width/2, area.y + area.height/2, 0,
                area.x + area.width/2, area.y + area.height/2, area.width/2
            );
            gradient.addColorStop(0, 'rgba(0, 0, 0, 1)');
            gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.8)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.beginPath();
            this.ctx.arc(area.x + area.width/2, area.y + area.height/2, area.width/2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalCompositeOperation = 'source-over';
        });
    }
    
    drawGameObjects() {
        // Platforms
        this.platforms.forEach(platform => this.drawPlatform(platform));
        
        // Earth platforms
        this.earthPlatforms.forEach(platform => this.drawEarthPlatform(platform));
        
        // Draw bridges
        this.bridges.forEach(bridge => this.drawBridge(bridge));
        
        // Movable objects
        this.movableObjects.forEach(obj => this.drawMovableObject(obj));
        
        // Barriers
        this.barriers.forEach(barrier => this.drawBarrier(barrier));
        
        // Gate barriers
        this.gateBarriers.forEach(barrier => this.drawGateBarrier(barrier));
        
        // Switches (only visible ones)
        this.switches.forEach(switch_obj => {
            if (switch_obj.visible) {
                this.drawSwitch(switch_obj);
            }
        });
        
        // Visible collectibles
        this.collectibles.forEach(collectible => this.drawCollectible(collectible));
        
        // Hidden collectibles (only if revealed)
        this.hiddenCollectibles.forEach(collectible => {
            if (collectible.revealed) {
                this.drawHiddenCollectible(collectible);
            }
        });
        
        // Exit gate
        if (this.exitGate) {
            this.drawExitGate(this.exitGate);
        }
    }
    
    drawPlatform(platform) {
        // Dark platform colors for gritty atmosphere
        switch(platform.type) {
            case 'ground':
                this.ctx.fillStyle = '#3d3d3d';
                this.ctx.strokeStyle = '#2a2a2a';
                break;
            case 'small':
                this.ctx.fillStyle = '#4a4a4a';
                this.ctx.strokeStyle = '#3d3d3d';
                break;
            case 'floating':
                this.ctx.fillStyle = '#5d5d5d';
                this.ctx.strokeStyle = '#4a4a4a';
                break;
            case 'high':
                this.ctx.fillStyle = '#6a6a6a';
                this.ctx.strokeStyle = '#5d5d5d';
                break;
            default:
                this.ctx.fillStyle = '#3d3d3d';
                this.ctx.strokeStyle = '#2a2a2a';
        }
        
        this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    }
    
    drawEarthPlatform(platform) {
        this.ctx.fillStyle = '#654321';
        this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
        this.ctx.strokeStyle = '#4a3018';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
    }
    
    drawBridge(bridge) {
        // Draw bridge with wood texture
        this.ctx.fillStyle = '#8B4513';
        this.ctx.fillRect(bridge.x, bridge.y, bridge.width, bridge.height);
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(bridge.x, bridge.y, bridge.width, bridge.height);
        
        // Add wood planks effect
        this.ctx.strokeStyle = '#654321';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < bridge.width; i += 20) {
            this.ctx.beginPath();
            this.ctx.moveTo(bridge.x + i, bridge.y);
            this.ctx.lineTo(bridge.x + i, bridge.y + bridge.height);
            this.ctx.stroke();
        }
        
        // Add glow effect
        this.ctx.shadowColor = '#FFD700';
        this.ctx.shadowBlur = 5;
        this.ctx.strokeRect(bridge.x, bridge.y, bridge.width, bridge.height);
        this.ctx.shadowBlur = 0;
    }
    
    drawSwitch(switch_obj) {
        // Draw switch with different colors based on activation
        this.ctx.fillStyle = switch_obj.activated ? '#00FF00' : switch_obj.color;
        this.ctx.fillRect(switch_obj.x, switch_obj.y, switch_obj.width, switch_obj.height);
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(switch_obj.x, switch_obj.y, switch_obj.width, switch_obj.height);
        
        // Add glow effect for visible switches
        this.ctx.shadowColor = switch_obj.color;
        this.ctx.shadowBlur = 8;
        this.ctx.strokeRect(switch_obj.x, switch_obj.y, switch_obj.width, switch_obj.height);
        this.ctx.shadowBlur = 0;
    }
    
    drawMovableObject(obj) {
        this.ctx.fillStyle = obj.color;
        this.ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(obj.x, obj.y, obj.width, obj.height);
    }
    
    drawBarrier(barrier) {
        this.ctx.fillStyle = barrier.color;
        this.ctx.fillRect(barrier.x, barrier.y, barrier.width, barrier.height);
        this.ctx.strokeStyle = '#4a2c0a';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(barrier.x, barrier.y, barrier.width, barrier.height);
    }
    
    drawGateBarrier(barrier) {
        this.ctx.fillStyle = barrier.color;
        this.ctx.fillRect(barrier.x, barrier.y, barrier.width, barrier.height);
        this.ctx.strokeStyle = '#660000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(barrier.x, barrier.y, barrier.width, barrier.height);
        
        // Add danger pattern
        this.ctx.strokeStyle = '#ff4444';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < barrier.height; i += 10) {
            this.ctx.beginPath();
            this.ctx.moveTo(barrier.x, barrier.y + i);
            this.ctx.lineTo(barrier.x + barrier.width, barrier.y + i + 5);
            this.ctx.stroke();
        }
    }
    
    drawCollectible(collectible) {
        if (!collectible.collected) {
            this.ctx.fillStyle = collectible.color;
            this.ctx.beginPath();
            this.ctx.arc(collectible.x + collectible.width/2, collectible.y + collectible.height/2, collectible.width/2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Add glow effect
            this.ctx.shadowColor = collectible.color;
            this.ctx.shadowBlur = 8;
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawHiddenCollectible(collectible) {
        if (!collectible.collected && collectible.revealed) {
            this.ctx.fillStyle = collectible.color;
            this.ctx.beginPath();
            this.ctx.arc(collectible.x + collectible.width/2, collectible.y + collectible.height/2, collectible.width/2, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.strokeStyle = '#00FFFF';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Special glow for revealed offerings
            this.ctx.shadowColor = '#00FFFF';
            this.ctx.shadowBlur = 12;
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawIllumination(area) {
        // Draw illumination as radial gradient
        const gradient = this.ctx.createRadialGradient(
            area.x + area.width/2, area.y + area.height/2, 0,
            area.x + area.width/2, area.y + area.height/2, area.width/2
        );
        gradient.addColorStop(0, 'rgba(255, 255, 0, 0.6)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 0, 0.3)');
        gradient.addColorStop(1, 'rgba(255, 255, 0, 0)');
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(area.x + area.width/2, area.y + area.height/2, area.width/2, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawExitGate(gate) {
        if (this.currentLevel === 4 && this.gameState === 'gameComplete') {
            // Draw red gate for final level after Abel is killed
            this.ctx.fillStyle = '#8B0000'; // Dark Red
            this.ctx.strokeStyle = '#DC143C'; // Crimson
            this.ctx.lineWidth = 5;
            this.ctx.fillRect(gate.x, gate.y, gate.width, gate.height);
            this.ctx.strokeRect(gate.x, gate.y, gate.width, gate.height);
            
            // Draw gate symbol (arch) in a darker red
            this.ctx.strokeStyle = '#660000';
            this.ctx.lineWidth = 6;
            this.ctx.lineCap = 'round';
            
            const centerX = gate.x + gate.width / 2;
            const gateTop = gate.y + 10;
            const gateBottom = gate.y + gate.height - 10;
            const archWidth = gate.width - 10;
            
            // Draw arch
            this.ctx.beginPath();
            this.ctx.arc(centerX, gateTop + archWidth/2, archWidth/2, Math.PI, 0);
            this.ctx.stroke();
            
            // Draw pillars
            this.ctx.beginPath();
            this.ctx.moveTo(gate.x + 5, gateTop + archWidth/2);
            this.ctx.lineTo(gate.x + 5, gateBottom);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(gate.x + gate.width - 5, gateTop + archWidth/2);
            this.ctx.lineTo(gate.x + gate.width - 5, gateBottom);
            this.ctx.stroke();
            
            // Add intense glow
            this.ctx.shadowColor = '#DC143C';
            this.ctx.shadowBlur = 20;
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        } else {
            // Existing gate drawing logic for other levels
            // Draw gate background
            this.ctx.fillStyle = '#2F4F4F';
            this.ctx.fillRect(gate.x, gate.y, gate.width, gate.height);
            this.ctx.strokeStyle = '#708090';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(gate.x, gate.y, gate.width, gate.height);
            
            // Draw gate symbol (arch)
            this.ctx.strokeStyle = '#FFD700';
            this.ctx.lineWidth = 4;
            this.ctx.lineCap = 'round';
            
            const centerX = gate.x + gate.width / 2;
            const gateTop = gate.y + 10;
            const gateBottom = gate.y + gate.height - 10;
            const archWidth = gate.width - 10;
            
            // Draw arch
            this.ctx.beginPath();
            this.ctx.arc(centerX, gateTop + archWidth/2, archWidth/2, Math.PI, 0);
            this.ctx.stroke();
            
            // Draw pillars
            this.ctx.beginPath();
            this.ctx.moveTo(gate.x + 5, gateTop + archWidth/2);
            this.ctx.lineTo(gate.x + 5, gateBottom);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(gate.x + gate.width - 5, gateTop + archWidth/2);
            this.ctx.lineTo(gate.x + gate.width - 5, gateBottom);
            this.ctx.stroke();
            
            // Add mystical glow
            this.ctx.shadowColor = '#FFD700';
            this.ctx.shadowBlur = 15;
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawCharacter(char, name) {
        // Add slight glow to characters for visibility
        this.ctx.shadowColor = char.color;
        this.ctx.shadowBlur = 8;
        
        this.ctx.fillStyle = char.color;
        this.ctx.fillRect(char.x, char.y, char.width, char.height);
        
        this.ctx.shadowBlur = 0;
        
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(char.x, char.y, char.width, char.height);
        
        // Draw character name with better visibility
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = '12px Arial';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeText(name.charAt(0).toUpperCase() + name.slice(1), char.x, char.y - 5);
        this.ctx.fillText(name.charAt(0).toUpperCase() + name.slice(1), char.x, char.y - 5);
    }
    
    gameLoop() {
        this.update();
        this.render();
        requestAnimationFrame(() => this.gameLoop());
    }
}

// Initialize game when page loads
window.addEventListener('load', () => {
    const startButton = document.getElementById('startButton');
    const gameCanvas = document.getElementById('gameCanvas');

    // Hide game canvas initially
    gameCanvas.classList.add('hidden');

    startButton.addEventListener('click', () => {
        // Hide start button and show game canvas
        startButton.parentElement.classList.add('hidden');
        gameCanvas.classList.remove('hidden');
        new Game();
    });
});
