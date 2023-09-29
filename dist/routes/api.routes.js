"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wallet = __importStar(require("../controllers/walletList.controller"));
const token = __importStar(require("../controllers/token.controller"));
/**
 * Router
 * Using Passport
 */
const router = (0, express_1.Router)();
// Wallet List Controller
router.post("/walletList/insert", wallet.addItem);
router.post("/walletList/remove", wallet.removeItem);
router.post("/walletList/edit", wallet.editItem);
router.post("/walletList/getAll", wallet.getAllWalletList);
// Token Action Controller
router.post("/tokenAction/viewData", token.viewData);
router.post("/tokenAction/modifyDBData", token.modifyDBData);
exports.default = router;
