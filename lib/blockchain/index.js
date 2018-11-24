"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class C {
    constructor() {
        this.x = 10;
        this.getX = () => this.x;
        this.setX = (newVal) => {
            this.x = newVal;
        };
    }
}
exports.C = C;
exports.x = new C();
exports.y = { ...{ some: "value" } };
console.log("test");
//# sourceMappingURL=index.js.map