// multiplayer.js - Online 2-player functionality for Bato Lata

class MultiplayerGame {
    constructor() {
        this.socket = null;
        this.roomId = null;
        this.playerId = null;
        this.players = {};
        this.isHost = false;
        this.gameStarted = false;
        this.frameCounter = 0;
        
        this.multiplayerState = {
            can: {
                x: 250,
                y: 270,
                size: 50,
                isHit: false,
                vx: 0,
                vy: 0,
                rotation: 0,
                rotationSpeed: 0
            },
            slippers: {
                player1: { x: 0, y: 0, isHeld: true, vx: 0, vy: 0, rotation: 0 },
                player2: { x: 0, y: 0, isHeld: true, vx: 0, vy: 0, rotation: 0 }
            },
            scores: {
                player1: 0,
                player2: 0
            }
        };
        
        this.init();
    }
    
    init() {
        this.createMultiplayerUI();
        this.setupSocketConnection();
    }
    
    createMultiplayerUI() {
        const overlayCard = document.querySelector('.overlay-card');
        
        const multiplayerHTML = `
            <div id="multiplayer-section" style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.1); border-radius: 8px;">
                <h3 style="font-family: 'Press Start 2P', cursive; font-size: 1em; margin-bottom: 15px; color: #ffeb3b;">Multiplayer</h3>
                <div style="display: flex; flex-direction: column; gap: 10px;">
                    <button id="create-room-btn" style="padding: 10px; border-radius: 8px; border: none; background: #3498db; color: white; cursor: pointer; font-family: 'Press Start 2P', cursive; font-size: 0.7em;">Create Room</button>
                    <div style="display: flex; gap: 5px;">
                        <input type="text" id="room-code-input" placeholder="Room Code" style="flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #ccc; font-family: 'Inter', sans-serif;">
                        <button id="join-room-btn" style="padding: 10px; border-radius: 8px; border: none; background: #2ecc71; color: white; cursor: pointer; font-family: 'Press Start 2P', cursive; font-size: 0.7em;">Join</button>
                    </div>
                </div>
                <div id="room-info" style="display: none; margin-top: 15px; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 5px;">
                    <p style="margin: 5px 0; font-family: 'Press Start 2P', cursive; font-size: 0.6em;">Room: <span id="room-code-display"></span></p>
                    <p style="margin: 5px 0; font-family: 'Press Start 2P', cursive; font-size: 0.6em;">Players: <span id="player-count">1/2</span></p>
                    <button id="start-game-btn" style="padding: 8px 15px; border-radius: 8px; border: none; background: #e74c3c; color: white; cursor: pointer; font-family: 'Press Start 2P', cursive; font-size: 0.7em; margin-top: 10px;">Start Game</button>
                </div>
            </div>
        `;
        
        overlayCard.insertAdjacentHTML('beforeend', multiplayerHTML);
        
        document.getElementById('create-room-btn').addEventListener('click', () => this.createRoom());
        document.getElementById('join-room-btn').addEventListener('click', () => this.joinRoom());
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
        
        const scoreBoard = document.querySelector('.score-board');
        scoreBoard.innerHTML = `
            <div>Player 1: <span id="player1-score">0</span></div>
            <div>Player 2: <span id="player2-score">0</span></div>
        `;
    }
    
    setupSocketConnection() {
        this.socket = io();
        
        this.socket.on('connect', () => {
            console.log('Connected to server');
            this.playerId = this.socket.id;
        });
        
        this.socket.on('room-created', (data) => {
            this.roomId = data.roomId;
            this.isHost = true;
            this.updateRoomUI();
        });
        
        this.socket.on('room-joined', (data) => {
            this.roomId = data.roomId;
            this.isHost = false;
            this.updateRoomUI();
            this.updatePlayerList(data.players);
        });
        
        this.socket.on('player-joined', (data) => {
            this.updatePlayerList(data.players);
        });
        
        this.socket.on('player-left', (data) => {
            this.updatePlayerList(data.players);
        });
        
        this.socket.on('game-started', (data) => {
            this.gameStarted = true;
            this.startMultiplayerGame();
        });
        
        this.socket.on('game-state-update', (data) => {
            this.updateGameState(data);
        });
        
        this.socket.on('player-action', (data) => {
            this.handlePlayerAction(data);
        });
        
        this.socket.on('disconnect', () => {
            this.showMessage('Disconnected from server', 300);
        });
    }
    
    createRoom() {
        this.socket.emit('create-room');
    }
    
    joinRoom() {
        const roomCode = document.getElementById('room-code-input').value;
        if (roomCode) {
            this.socket.emit('join-room', roomCode);
        }
    }
    
    startGame() {
        if (this.isHost) {
            this.socket.emit('start-game', this.roomId);
        }
    }
    
    updateRoomUI() {
        document.getElementById('room-info').style.display = 'block';
        document.getElementById('room-code-display').textContent = this.roomId;
        document.getElementById('multiplayer-section').style.pointerEvents = 'none';
        document.getElementById('multiplayer-section').style.opacity = '0.7';
        
        if (!this.isHost) {
            document.getElementById('start-game-btn').style.display = 'none';
        }
    }
    
    updatePlayerList(players) {
        const playerCountElement = document.getElementById('player-count');
        playerCountElement.textContent = `${Object.keys(players).length}/2`;
        this.players = players;
    }
    
    startMultiplayerGame() {
        document.getElementById('startOverlay').style.display = 'none';
        
        const playerNumber = Object.keys(this.players).indexOf(this.playerId) + 1;
        
        if (playerNumber === 1) {
            playerSprite.src = 'avatar.png';
        } else {
            playerSprite.src = 'avatar2.png';
        }
        
        if (playerNumber === 1) {
            player.x = canvas.width / 3;
        } else {
            player.x = canvas.width * 2 / 3;
        }
        player.y = canvas.height - 25;
        
        this.multiplayerState.slippers.player1.x = canvas.width / 3 + 10;
        this.multiplayerState.slippers.player1.y = canvas.height - 40;
        this.multiplayerState.slippers.player2.x = canvas.width * 2 / 3 + 10;
        this.multiplayerState.slippers.player2.y = canvas.height - 40;
        
        startLoop();
        this.setupMultiplayerInput();
    }
    
    setupMultiplayerInput() {
        const originalThrowSlipper = window.throwSlipperTowardCan;
        
        window.throwSlipperTowardCan = () => {
            if (state.isGameOver || state.isPaused || !this.gameStarted) return;
            if (!slipper.isHeld) return;
            
            const playerNumber = Object.keys(this.players).indexOf(this.playerId) + 1;
            const slipperKey = `player${playerNumber}`;
            
            this.socket.emit('player-action', {
                roomId: this.roomId,
                action: 'throw',
                playerId: this.playerId,
                targetX: can.x,
                targetY: can.y,
                x: player.x,
                y: player.y
            });
            
            this.multiplayerState.slippers[slipperKey].isHeld = false;
            
            const dx = can.x - player.x;
            const dy = can.y - player.y;
            const distance = Math.hypot(dx, dy) || 1;
            
            this.multiplayerState.slippers[slipperKey].vx = (dx / distance) * config.slipperSpeed;
            this.multiplayerState.slippers[slipperKey].vy = (dy / distance) * config.slipperSpeed;
            this.multiplayerState.slippers[slipperKey].rotationSpeed = (Math.random() - 0.5) * 0.5;
        };
        
        const originalUpdatePlayerMovement = window.updatePlayerMovement;
        
        window.updatePlayerMovement = () => {
            originalUpdatePlayerMovement.call(this);
            
            if (this.gameStarted && this.frameCounter % 5 === 0) {
                this.socket.emit('player-action', {
                    roomId: this.roomId,
                    action: 'move',
                    playerId: this.playerId,
                    x: player.x,
                    y: player.y,
                    dir: player.dir,
                    moving: player.moving
                });
            }
            
            this.frameCounter = (this.frameCounter || 0) + 1;
        };
    }
    
    updateGameState(data) {
        this.multiplayerState.can = data.can;
        this.multiplayerState.slippers = data.slippers;
        this.multiplayerState.scores = data.scores;
        
        document.getElementById('player1-score').textContent = data.scores.player1;
        document.getElementById('player2-score').textContent = data.scores.player2;
        
        Object.keys(data.players).forEach(playerId => {
            if (playerId !== this.playerId) {
                this.updateOtherPlayer(data.players[playerId]);
            }
        });
    }
    
    updateOtherPlayer(playerData) {
        // Implementation for other player rendering
    }
    
    handlePlayerAction(data) {
        if (data.playerId === this.playerId) return;
        
        switch (data.action) {
            case 'move':
                this.updateOtherPlayer(data);
                break;
            case 'throw':
                const otherPlayerNumber = Object.keys(this.players).indexOf(data.playerId) + 1;
                const slipperKey = `player${otherPlayerNumber}`;
                
                this.multiplayerState.slippers[slipperKey].isHeld = false;
                this.multiplayerState.slippers[slipperKey].vx = data.vx;
                this.multiplayerState.slippers[slipperKey].vy = data.vy;
                break;
        }
    }
    
    showMessage(message, duration = 180) {
        const messageBox = document.getElementById('messageBox');
        messageBox.innerHTML = message;
        messageBox.style.display = 'block';
        
        if (duration > 0) {
            setTimeout(() => {
                messageBox.style.display = 'none';
            }, duration);
        }
    }
}

window.addEventListener('load', () => {
    window.multiplayerGame = new MultiplayerGame();
});
