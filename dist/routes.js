"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const txController_1 = require("./controllers/txController");
const txVerifMiddleware_1 = require("./middleware/txVerifMiddleware");
const router = (0, express_1.Router)();
router.post('/transaction', txVerifMiddleware_1.verifyTx, txController_1.processTx);
router.get('/echo', txController_1.echo);
exports.default = router;
