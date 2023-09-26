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
exports.editItem = exports.removeItem = exports.addItem = exports.getAllWalletList = void 0;
const WalletList_1 = __importDefault(require("../models/WalletList"));
const getAllWalletList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    WalletList_1.default.find().then((models) => {
        res.json({ models });
    });
});
exports.getAllWalletList = getAllWalletList;
const addItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    WalletList_1.default.findOne({
        walletAddress: req.body.walletAddress,
        chainName: req.body.chainName,
    }).then((model) => __awaiter(void 0, void 0, void 0, function* () {
        if (model)
            res.json({ success: false, message: "The List exits!" });
        model = new WalletList_1.default();
        model.walletAddress = req.body.walletAddress;
        model.chainName = req.body.chainName;
        model.save().then(() => {
            res.json({ success: true, model });
        });
    }));
});
exports.addItem = addItem;
const removeItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    WalletList_1.default.findByIdAndDelete(req.body.walletListId).then((model) => {
        res.json({ success: true, model });
    });
});
exports.removeItem = removeItem;
const editItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    WalletList_1.default.findOne({
        _id: req.body.walletListId,
    }).then((model) => __awaiter(void 0, void 0, void 0, function* () {
        if (!model)
            res.json({ success: false, message: "The WalletList not exits!" });
        model.walletAddress = req.body.walletAddress;
        model.chainName = req.body.chainName;
        model.save().then(() => {
            res.json({ success: true, model });
        });
    }));
});
exports.editItem = editItem;
