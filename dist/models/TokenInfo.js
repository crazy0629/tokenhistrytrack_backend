"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/**
 * Create a new Schema from mongoose
 */
const TokenInfoSchema = new mongoose_1.Schema({
    walletAddress: { type: String, required: true },
    chainId: { type: Number, required: true },
    tokenName: { type: String, required: true },
    tokenSymbol: { type: String, required: true },
    tokenImage: { type: String, required: true },
    tokenAddr: { type: String, required: true },
    date: { type: String, required: true },
    blockNumber: { type: Number, required: true },
    tokenAmount: { type: Number, required: true },
    tokenPrice: { type: Number, required: true },
}, { timestamps: true });
/**
 * IEmailHistory Interface Document class inheritance
 */
exports.default = (0, mongoose_1.model)("TokenInfo", TokenInfoSchema);
