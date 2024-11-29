import Labyrinth from "./labyrint.mjs";
import ANSI from "./utils/ANSI.mjs";
import SplashScreen from "./splashScreen.mjs";
import KeyBoardManager from "./utils/keyboardManager.mjs"; // Import KeyBoardManager

const REFRESH_RATE = 250;

console.log(ANSI.RESET, ANSI.CLEAR_SCREEN, ANSI.HIDE_CURSOR);

let intervalID = null;
let isBlocked = false;
let state = null;
let splashScreen = new SplashScreen();
let showSplash = true;

function init() {
    intervalID = setInterval(update, REFRESH_RATE);
}

function update() {
    if (isBlocked) { return; }
    isBlocked = true;

    if (showSplash) {
        splashScreen.update();
        splashScreen.draw();
        if (KeyBoardManager.isEnterPressed()) {
            showSplash = false;
            state = new Labyrinth();
        }
    } else {
        state.update();
        state.draw();
    }

    isBlocked = false;
}

function renderLevel() {
    let output = "";
    for (let row of level) {
        for (let cell of row) {
            output += pallet[cell] || cell;
        }
        output += "\n";
    }
    return output;
}

function renderHud() {
    let hpBar = `Life:[${ANSI.COLOR.RED + "♥︎".repeat(playerStats.hp) + ANSI.COLOR_RESET}${ANSI.COLOR.LIGHT_GRAY + "♥︎".repeat(HP_MAX - playerStats.hp) + ANSI.COLOR_RESET}]`;
    let cash = `$:${playerStats.chash}`;
    return `${hpBar} ${cash}\n`;
}

function draw() {
    if (isDirty) {
        console.log(ANSI.CLEAR_SCREEN + renderHud() + renderLevel());
        isDirty = false;
    }
}

init();