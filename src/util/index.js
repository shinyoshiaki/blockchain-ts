"use strict";
exports.__esModule = true;
function excuteEvent(ev, v) {
    console.log("excuteEvent", ev);
    Object.keys(ev).forEach(function (key) {
        ev[key](v);
    });
}
exports.excuteEvent = excuteEvent;
