import ANSI from "./utils/ANSI.mjs";
import { readMapFile, readRecordFile } from "./utils/fileHelpers.mjs";
import { START_LEVEL_ID, LEVEL_LISTING_FILE } from "./utils/constants.mjs";
import KeyBoardManager from "./utils/keyboardManager.mjs"; // Corrected import path

const startingLevel = START_LEVEL_ID;
const levels = loadLevelListings();

function loadLevelListings(source = LEVEL_LISTING_FILE) {
    let data = readRecordFile(source);
    let levels = {};
    for (const item of data) {
        let keyValue = item.split(":");
        if (keyValue.length >= 2) {
            let key = keyValue[0];
            let value = keyValue[1];
            levels[key] = value;
        }
    }
    return levels;
}

let levelData = readMapFile(levels[startingLevel]);
let level = levelData;

let pallet = {
    "█": ANSI.COLOR.LIGHT_GRAY,
    "H": ANSI.COLOR.RED,
    "$": ANSI.COLOR.YELLOW,
    "B": ANSI.COLOR.GREEN,
    "X": ANSI.COLOR.BLUE,
};

let isDirty = true;

let playerPos = {
    row: null,
    col: null,
};

const NPC = "X";
const EMPTY = " ";
const HERO = "H";
const LOOT = "$";
const DOOR = "►";
const TELEPORT = "♨︎";

let direction = -1;

const playerStats = {
    hp: 10,
    chash: 0,
};

class Labyrinth {
    constructor() {
        this.roomStack = [];
        this.npcPositions = [];
        this.loadLevel(startingLevel);
    }

    loadLevel(levelName, returnPosition = null) {
        if (playerPos.row !== null && playerPos.col !== null) {
            this.roomStack.push({ levelName: this.currentLevel, position: { row: playerPos.row, col: playerPos.col } });
        }
        this.currentLevel = levelName;
        levelData = readMapFile(levels[levelName]);
        level = levelData;
        playerPos.row = returnPosition ? returnPosition.row : null;
        playerPos.col = returnPosition ? returnPosition.col : null;
        isDirty = true;
        this.findPlayerPosition();
        this.findNPCPositions();
    }

    findPlayerPosition() {
        if (playerPos.row !== null && playerPos.col !== null) return;
        for (let row = 0; row < level.length; row++) {
            for (let col = 0; col < level[row].length; col++) {
                if (level[row][col] == "H") {
                    playerPos.row = row;
                    playerPos.col = col;
                    return;
                }
            }
        }
    }

    findNPCPositions() {
        this.npcPositions = [];
        for (let row = 0; row < level.length; row++) {
            for (let col = 0; col < level[row].length; col++) {
                if (level[row][col] == "X") {
                    this.npcPositions.push({ row, col, direction: 1 });
                }
            }
        }
    }

    update() {
        let moved = false;
        if (KeyBoardManager.isUpPressed()) {
            this.movePlayer(-1, 0);
            moved = true;
        } else if (KeyBoardManager.isDownPressed()) {
            this.movePlayer(1, 0);
            moved = true;
        } else if (KeyBoardManager.isLeftPressed()) {
            this.movePlayer(0, -1);
            moved = true;
        } else if (KeyBoardManager.isRightPressed()) {
            this.movePlayer(0, 1);
            moved = true;
        }

        if (moved) {
            isDirty = true;
        }

        this.updateNPCs();
        this.checkCollisions();
        KeyBoardManager.resetKeyStates();
    }

    movePlayer(dRow, dCol) {
        let newRow = playerPos.row + dRow;
        let newCol = playerPos.col + dCol;

        // Boundary checks
        if (newRow < 0 || newRow >= level.length || newCol < 0 || newCol >= level[0].length) {
            return;
        }

        if (level[newRow][newCol] !== "█") {
            if (level[newRow][newCol] === "►" || level[newRow][newCol] === "▼" || level[newRow][newCol] === "◄") { // Check if the player is at the door
                this.handleDoor(newRow, newCol);
            } else if (level[newRow][newCol] === "♨︎") { // Check if the player is at the teleporter
                this.handleTeleporter(newRow, newCol);
            } else if (level[newRow][newCol] === "$") { // Check if the player is collecting money
                playerStats.chash += 10; // Add money to player's cash
                level[playerPos.row][playerPos.col] = " ";
                playerPos.row = newRow;
                playerPos.col = newCol;
                level[playerPos.row][playerPos.col] = "H";
            } else {
                level[playerPos.row][playerPos.col] = " ";
                playerPos.row = newRow;
                playerPos.col = newCol;
                level[playerPos.row][playerPos.col] = "H";
            }
        }
    }

    handleDoor(row, col) {
        if (level[row][col] === "►") {
            this.loadLevel("aSharpPlace");
        } else if (level[row][col] === "▼") {
            this.loadLevel("newLevel");
        } else if (level[row][col] === "◄") {
            if (this.roomStack.length > 0) {
                const previousRoom = this.roomStack.pop();
                this.loadLevel(previousRoom.levelName, previousRoom.position);
            }
        } else if (level[row][col] === "♦") { // Check if the player is at the final door in newLevel
            this.finishGame();
        }
    }

    handleTeleporter(row, col) {
        const teleporters = [];
        for (let r = 0; r < level.length; r++) {
            for (let c = 0; c < level[r].length; c++) {
                if (level[r][c] === "♨︎") {
                    teleporters.push({ row: r, col: c });
                }
            }
        }

        if (teleporters.length === 2) {
            const otherTeleporter = teleporters.find(t => t.row !== row || t.col !== col);
            if (otherTeleporter) {
                level[playerPos.row][playerPos.col] = " ";
                playerPos.row = otherTeleporter.row;
                playerPos.col = otherTeleporter.col;
                level[playerPos.row][playerPos.col] = "H";
                isDirty = true;
            }
        }
    }

    updateNPCs() {
        for (let npc of this.npcPositions) {
            let newRow = npc.row + npc.direction;
            if (newRow < 0 || newRow >= level.length || level[newRow][npc.col] !== " ") {
                npc.direction *= -1;
                newRow = npc.row + npc.direction;
            }
            if (newRow >= 0 && newRow < level.length && level[newRow][npc.col] === " ") {
                level[npc.row][npc.col] = " ";
                npc.row = newRow;
                level[npc.row][npc.col] = "X";
            }
        }
        isDirty = true;
    }

    checkCollisions() {
        for (let i = 0; i < this.npcPositions.length; i++) {
            let npc = this.npcPositions[i];
            if (npc.row === playerPos.row && npc.col === playerPos.col) {
                playerStats.hp -= 1;
                console.log(`Player hit by NPC! HP: ${playerStats.hp}`);
                if (playerStats.hp <= 0) {
                    console.log("Game Over!");
                    process.exit();
                }
                // Remove the NPC from the level and the npcPositions array
                level[npc.row][npc.col] = " ";
                this.npcPositions.splice(i, 1);
                i--; // Adjust the index after removal
            }
        }
    }

    draw() {
        if (isDirty) {
            console.log(ANSI.CLEAR_SCREEN + this.renderHud() + this.renderLevel());
            isDirty = false;
        }
    }

    renderLevel() {
        let output = "";
        for (let row of level) {
            for (let cell of row) {
                output += (pallet[cell] || "") + cell + ANSI.COLOR.COLOR_RESET;
            }
            output += "\n";
        }
        return output;
    }

    renderHud() {
        let hpBar = `Life:[${ANSI.COLOR.RED + "♥︎".repeat(playerStats.hp) + ANSI.COLOR.COLOR_RESET}${ANSI.COLOR.LIGHT_GRAY + "♥︎".repeat(10 - playerStats.hp) + ANSI.COLOR.COLOR_RESET}]`;
        let cash = `$:${playerStats.chash}`;
        return `${hpBar} ${cash}\n`;
    }

    finishGame() {
        console.log("Congratulations! You have finished the game!");
        process.exit();
    }

    // ... existing code ...
}

export default Labyrinth;