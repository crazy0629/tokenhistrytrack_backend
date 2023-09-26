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
exports.viewData = void 0;
const chainList = __importStar(require("../service/chainInfo.json"));
const TokenInfo_1 = __importDefault(require("../models/TokenInfo"));
const ethers = require("ethers");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { ERC20_ABI } = require("../service/erc20-abi");
const { CHAIN_ID_TO_RPC } = require("../service/chainIdToRpc");
const viewData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const chainIdArray = chainList.data.filter((item) => item.chainName == req.body.chainName);
    if (!chainIdArray.length) {
        console.log("Error: No chain found");
        return res.json({ success: false, message: "Chain does not exist!" });
    }
    const chainId = chainIdArray[0].chainId;
    const tokenArrayInfo = yield readTokenInfo(Number(chainId), req.body.chainName, req.body.walletAddress, res);
});
exports.viewData = viewData;
const getCoinId = (tokenName, tokenSymbol) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const url = `https://api.coingecko.com/api/v3/coins/list?include_platform=false`;
        const response = yield axios.get(url);
        const data = response.data;
        for (let i = 0; i < data.length; i++) {
            const coin = data[i];
            if (coin.symbol.toLowerCase() == tokenSymbol.toLowerCase() &&
                coin.name.replaceAll("-", " ").toLowerCase() == tokenName.toLowerCase()) {
                return coin.id;
            }
        }
        return null;
    }
    catch (error) {
        return "";
    }
});
const getTokenPriceAtDate = (coinId, date) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let year = Number(date.slice(0, 4));
        let mon = Number(date.slice(5, 7)) + 1;
        let day = 1;
        if (mon == 12) {
            mon = 1;
            year += 1;
        }
        const startDate = new Date(year, mon - 1, day);
        const startTimestamp = Math.floor(startDate.getTime() / 1000);
        const endTimestamp = Math.floor(Date.now() / 1000);
        const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart/range?vs_currency=usd&from=${startTimestamp}&to=${startTimestamp + 10000}`;
        const response = yield axios.get(url);
        const data = response.data;
        const prices = data.prices;
        const tokenPrice = prices.find((price) => {
            const timestamp = price[0];
            const priceDate = new Date(timestamp);
            return (priceDate.getMonth() === startDate.getMonth() &&
                priceDate.getFullYear() === startDate.getFullYear());
        });
        return tokenPrice[1];
    }
    catch (error) {
        return -1;
    }
});
const getTokenInfo = (chainId, walletAddress, date, tokenName, tokenImage, tokenAddress, tokenSymbol, blockNumber, tokenJsonData, blockNumberJsonData, index, ind, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield TokenInfo_1.default.findOne({
        chainId: chainId,
        walletAddress: walletAddress,
        date: date,
        tokenName: tokenName,
        tokenImage: tokenImage,
        tokenAddr: tokenAddress,
        tokenSymbol: tokenSymbol,
        blockNumber: blockNumber,
    }).then((model) => __awaiter(void 0, void 0, void 0, function* () {
        if (model && model.date != "now") {
            const tokenInfoData = {
                tokenAmount: model.tokenAmount,
                tokenPrice: model.tokenPrice,
            };
            yield getTokenInfoFunc(tokenJsonData, blockNumberJsonData, index, ind + 1, chainId, walletAddress, res);
        }
        else {
            setTimeout(() => __awaiter(void 0, void 0, void 0, function* () {
                let tokenAmount = -1;
                if (blockNumber != -2) {
                    tokenAmount = yield getTokenAmount(Number(chainId), tokenAddress, walletAddress, Number(blockNumber));
                }
                const coinId = yield getCoinId(tokenName, tokenSymbol);
                const tokenPrice = yield getTokenPriceAtDate(coinId, date);
                const tokenInfoData = {
                    tokenAmount: tokenAmount,
                    tokenPrice: tokenPrice,
                };
                if (model && model.date == "now") {
                    model.tokenImage = tokenImage;
                    model.tokenPrice = tokenPrice;
                    yield model.save();
                }
                else {
                    model = new TokenInfo_1.default();
                    model.chainId = chainId;
                    model.walletAddress = walletAddress;
                    model.date = date;
                    model.tokenName = tokenName;
                    model.tokenAddr = tokenAddress;
                    model.tokenSymbol = tokenSymbol;
                    model.blockNumber = blockNumber;
                    model.tokenAmount = tokenAmount;
                    model.tokenImage = tokenImage;
                    model.tokenPrice = tokenPrice;
                    yield model.save();
                }
                yield getTokenInfoFunc(tokenJsonData, blockNumberJsonData, index, ind + 1, chainId, walletAddress, res);
            }), 1000);
        }
    }));
});
const getTokenInfoFunc = (tokenJsonData, blockNumberJsonData, index, ind, chainId, walletAddress, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(tokenJsonData.length);
    console.log(index, ind);
    if (ind == blockNumberJsonData.length) {
        ind = 0;
        index += 1;
    }
    if (index == tokenJsonData.length) {
        return res.json({
            success: "true",
            data: { tokenJsonData, chainId, blockNumberJsonData },
        });
    }
    const tokenItem = tokenJsonData[index];
    const blockInfoItem = blockNumberJsonData[ind];
    yield getTokenInfo(Number(chainId), walletAddress, blockInfoItem.date, tokenItem.name, tokenItem.logoURI, tokenItem.address, tokenItem.symbol, Number(blockInfoItem.value), tokenJsonData, blockNumberJsonData, index, ind, res);
});
const readTokenInfo = (chainId, chainName, walletAddress, res) => __awaiter(void 0, void 0, void 0, function* () {
    const rootPath = path.resolve(__dirname);
    yield fs.readFile(`${rootPath}\\token_data\\${chainName}_tokens.json`, "utf8", (err, data) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            res.json({
                success: "false",
                message: "Error happened while getting data",
            });
            return;
        }
        const tokenJsonData = JSON.parse(data).tokens;
        yield fs.readFile(`${rootPath}\\block_number\\${chainName}.json`, "utf8", (err, data) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                res.json({
                    success: "false",
                    message: "This chain is not available yet.",
                });
                return;
            }
            const blockNumberJsonData = JSON.parse(data);
            getTokenInfoFunc(tokenJsonData, blockNumberJsonData, 0, 0, Number(chainId), walletAddress, res);
        }));
    }));
});
const getTokenAmount = (chainId, tokenAddress, walletAddress, blockNumber) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const provider = new ethers.JsonRpcProvider(CHAIN_ID_TO_RPC[chainId]);
        const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
        const decimals = yield contract.decimals();
        let block_number = blockNumber;
        if (block_number == -1) {
            blockNumber = yield provider.getBlockNumber("latest");
        }
        const balance = yield contract.balanceOf(walletAddress, {
            blockTag: blockNumber,
        });
        const balanceSn = yield ethers.formatUnits(balance, decimals);
        return balanceSn;
    }
    catch (error) {
        return -1;
    }
});
