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
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const conn = process.env.DATABASE_URL;
const pool = new pg_1.Pool({
    connectionString: conn
});
const testConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const client = yield pool.connect();
        console.log("Connected to PostgreSQL database successfully!");
        client.release();
    }
    catch (err) {
        console.error("Failed to connect to PostgreSQL database:", err);
    }
    finally {
        pool.end();
    }
});
// testConnection();
exports.default = pool;
