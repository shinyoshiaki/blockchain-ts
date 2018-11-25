"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function excuteEvent(ev, v) {
    console.log("excuteEvent", ev);
    Object.keys(ev).forEach(key => {
        ev[key](v);
    });
}
exports.excuteEvent = excuteEvent;
//# sourceMappingURL=index.js.map