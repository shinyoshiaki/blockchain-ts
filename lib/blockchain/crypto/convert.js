"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
 * Copyright © 2018 Lisk Foundation
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Unless otherwise agreed in a custom licensing agreement with the Lisk Foundation,
 * no part of this software, including this file, may be copied, modified,
 * propagated, or distributed except according to the terms contained in the
 * LICENSE file.
 *
 * Removal or modification of this copyright notice is prohibited.
 *
 */
const ed2curve_1 = __importDefault(require("ed2curve"));
exports.convertPublicKeyEd2Curve = ed2curve_1.default.convertPublicKey;
exports.convertPrivateKeyEd2Curve = ed2curve_1.default.convertSecretKey;
//# sourceMappingURL=convert.js.map