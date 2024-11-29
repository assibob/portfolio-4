const ESC = '\x1b';
const CSI = ESC + '[';
const BOLD = CSI + '1m';
const BOLD_OFF = CSI + '22m';
const CURSOR_UP = CSI + 'A';
const CURSOR_DOWN = CSI + 'B';
const CURSOR_RIGHT = CSI + 'C';
const CURSOR_LEFT = CSI + 'D';
const CLEAR_SCREEN = CSI + '2J';
const DELETE_SCREEN = CSI + '3J';
const CURSOR_HOME = CSI + '1;1H';
const SAVE_CURSOR = ESC + '7';
const RESTORE_CURSOR = ESC + '8';
const moveCursorTo = (row, col) => CSI + row + ';' + col + 'H';
const setCursorCol = (col) => `${ESC}[${col}G`;
const setCursorRow = (row) => `${ESC}[${row}d`;
const BELL = '\x07';
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\u001b[38;5;221m';
const BLUE = '\x1b[34m';
const BLACK = '\x1b[30m';
const WHITE = '\x1b[37m';
const LIGHT_GRAY = `\u001b[38;5;251m`;
const COLOR_RESET = '\x1b[0m';
const BACK_GREEN = '\x1b[42m';

const ANSI = {
    ESC,
    CSI,
    BOLD,
    BOLD_OFF,
    CURSOR_UP,
    CURSOR_DOWN,
    CURSOR_RIGHT,
    CURSOR_LEFT,
    CLEAR_SCREEN,
    DELETE_SCREEN,
    CURSOR_HOME,
    SAVE_CURSOR,
    RESTORE_CURSOR,
    moveCursorTo,
    setCursorCol,
    setCursorRow,
    BELL,
    RESET,
    COLOR: {
        GREEN,
        RED,
        YELLOW,
        BLUE,
        BLACK,
        WHITE,
        LIGHT_GRAY,
        COLOR_RESET,
        BACK_GREEN
    }
};

export default ANSI;