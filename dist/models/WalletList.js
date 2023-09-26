"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/**
 * Create a new Schema from mongoose
 */
const WalletListSchema = new mongoose_1.Schema({
    walletAddress: { type: String, required: true },
    chainName: { type: String, required: true },
}, { timestamps: true });
/**
 * IEmailHistory Interface Document class inheritance
 */
exports.default = (0, mongoose_1.model)("WalletList", WalletListSchema);
