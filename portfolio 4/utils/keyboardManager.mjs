import readline from 'readline';

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
}

const KEY_ID = {
    down: "down",
    up: "up",
    left: "left",
    right: "right",
    return: "return",
    escape: "escape",
    r: "r"
};

const KEY_STATES = Object.keys(KEY_ID).reduce((prev, cur) => {
    prev[cur] = false;
    return prev;
}, {});

process.stdin.on("keypress", (str, key) => {
    if (key.ctrl && key.name === 'c') {
        process.exit();
    } else {
        if (key.name in KEY_ID) {
            KEY_STATES[KEY_ID[key.name]] = true;
        }
    }
});

function isEnterPressed() {
    return KEY_STATES.return;
}

function isUpPressed() {
    return KEY_STATES.up;
}

function isDownPressed() {
    return KEY_STATES.down;
}

function isLeftPressed() {
    return KEY_STATES.left;
}

function isRightPressed() {
    return KEY_STATES.right;
}

function resetKeyStates() {
    Object.keys(KEY_STATES).forEach(key => {
        KEY_STATES[key] = false;
    });
}

export default {
    isEnterPressed,
    isUpPressed,
    isDownPressed,
    isLeftPressed,
    isRightPressed,
    resetKeyStates
};