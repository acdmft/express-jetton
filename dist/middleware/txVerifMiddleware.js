"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyTx = verifyTx;
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function verifyTx(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const { msgHash } = req.body.msgHash;
        try {
            yield fetchTxWithRetry(msgHash);
            next();
        }
        catch (error) {
            if (error instanceof TypeError) {
                res.status(404).json({ message: 'Transaction not found or not confirmed.' });
            }
            else {
                res.status(500).json({ message: 'Error confirming transaction.', error: error });
            }
        }
    });
}
function fetchTxWithRetry(hash_1) {
    return __awaiter(this, arguments, void 0, function* (hash, retries = 3, minDelay = 3000, maxDelay = 7000) {
        for (let attempt = 1; attempt <= retries; attempt++) {
            try {
                const response = yield (0, node_fetch_1.default)(`https://toncenter.com/api/v3/transactionsByMessage?direction=in&msg_hash=${hash}%3D&limit=128&offset=0`);
                if (response.ok) {
                    const data = (yield response.json());
                    // if (data.transactions.length === 0) {
                    //     throw new Error('Transaction not found');
                    // }
                    return data.transactions[0].out_msgs[0].value; // If the request is successful, return the response
                }
                else if (response.status === 429) {
                    throw new Error('Too Many Requests'); // Throw an error for status 429 to trigger retry
                }
                else {
                    throw new Error(`Request failed with status code ${response.status}`);
                }
            }
            catch (error) {
                if (attempt < retries) {
                    const randomDelay = Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
                    console.log(`Attempt ${attempt} failed. Retrying in ${randomDelay / 1000} seconds...`);
                    yield new Promise(resolve => setTimeout(resolve, randomDelay));
                }
                else {
                    console.log('All attempts failed.');
                    throw error; // Re-throw the error after the last attempt
                }
            }
        }
    });
}
