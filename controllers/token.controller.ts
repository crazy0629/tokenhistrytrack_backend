import { Request, Response } from "express";
import * as chainList from "../service/chainInfo.json";
import * as coinIdList from "../service/coinId.json";

import TokenInfo from "../models/TokenInfo";
import WalletList from "../models/WalletList";
import { ITokenInfo } from "../service/interfaces";
import { model } from "mongoose";

const ethers = require("ethers");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { ERC20_ABI } = require("../service/erc20-abi");
const { CHAIN_ID_TO_RPC } = require("../service/chainIdToRpc");

let priceFlag = 0;
let priceValue = [];

export const viewData = async (req: Request, res: Response) => {
  const chainIdArray = chainList.data.filter(
    (item) => item.chainName == req.body.chainName
  );
  if (!chainIdArray.length) {
    console.log("Error: No chain found");
    return res.json({ success: false, message: "Chain does not exist!" });
  }
  const chainId = chainIdArray[0].chainId;

  const tokenArrayInfo = await readTokenInfo(
    Number(chainId),
    req.body.chainName,
    req.body.walletAddress,
    res
  );
};

export const modifyDBData = async (req: Request, res: Response) => {
  TokenInfo.deleteMany({ chainId: 250 }).then(async (models) => {
    res.json({ success: true, models });
  });
};

const getTokenPriceList = async (coinId: string) => {
  try {
    const startDate = new Date("2021-08-01");
    const startTimestamp = Math.floor(startDate.getTime() / 1000);
    const endTimestamp = Math.floor(Date.now() / 1000);

    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart/range?vs_currency=usd&from=${startTimestamp}&to=${endTimestamp}`;
    const response = await axios.get(url);
    const data = response.data;
    const prices = data.prices;
    if (priceFlag == 0) {
      priceFlag = 1;
      priceValue = prices;
    }
    return priceValue;
  } catch (error) {
    return -1;
  }
};

const getTokenInfo = async (
  chainId: number,
  walletAddress: string,
  date: string,
  tokenName: string,
  tokenImage: string,
  tokenAddress: string,
  tokenSymbol: String,
  blockNumber: number,
  tokenJsonData: Array<Object>,
  blockNumberJsonData: Array<Object>,
  index: number,
  ind: number,
  res: Response
) => {
  await TokenInfo.findOne({
    chainId: chainId,
    walletAddress: walletAddress,
    date: date,
    tokenName: tokenName,
    tokenImage: tokenImage,
    tokenAddr: tokenAddress,
    tokenSymbol: tokenSymbol,
    blockNumber: blockNumber,
  }).then(async (model: any) => {
    if (model) {
      const tokenInfoData = {
        tokenAmount: model.tokenAmount,
        tokenPrice: model.tokenPrice,
      };
      await getTokenInfoFunc(
        tokenJsonData,
        blockNumberJsonData,
        index,
        ind + 1,
        chainId,
        walletAddress,
        res
      );
    } else {
      setTimeout(async () => {
        let tokenAmount = -1;
        if (blockNumber != -2) {
          tokenAmount = await getTokenAmount(
            Number(chainId),
            tokenAddress,
            walletAddress,
            Number(blockNumber)
          );
        }
        console.log(tokenName, tokenSymbol);
        const coinId = coinIdList.data.filter(
          (item: any) =>
            item.symbol
              .replaceAll("-", " ")
              .replaceAll("(", " ")
              .replaceAll(")", " ")
              .toLowerCase() == tokenSymbol.toLowerCase() &&
            item.name
              .replaceAll("-", " ")
              .replaceAll("(", " ")
              .replaceAll(")", " ")
              .toLowerCase() == tokenName.toLowerCase()
        )[0].id;
        if (priceValue.length == 0) {
          await getTokenPriceList(coinId);
        }
        let year = Number(date.slice(0, 4));
        let mon = Number(date.slice(5, 7)) + 1;
        let day = 1;
        if (mon == 13) {
          mon = 1;
          year += 1;
        }
        const moment = new Date(year, mon - 1, day);

        const filterData = priceValue.filter(
          (item: any) => item[0] < moment.getTime()
        );

        let tokenPrice = -1;
        if (filterData.length != 0)
          tokenPrice = filterData[filterData.length - 1][1];

        const tokenInfoData = {
          tokenAmount: tokenAmount,
          tokenPrice: tokenPrice,
        };
        console.log(coinId, date, tokenAmount, tokenPrice);

        model = new TokenInfo();
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
        await model.save();

        await getTokenInfoFunc(
          tokenJsonData,
          blockNumberJsonData,
          index,
          ind + 1,
          chainId,
          walletAddress,
          res
        );
      }, 1000);
    }
  });
};

const getTokenInfoFunc = async (
  tokenJsonData: Array<Object>,
  blockNumberJsonData: Array<Object>,
  index: number,
  ind: number,
  chainId: number,
  walletAddress: string,
  res: Response
) => {
  if (ind == blockNumberJsonData.length) {
    ind = 0;
    index += 1;
    priceFlag = 0;
    priceValue = [];
  }
  if (index == tokenJsonData.length) {
    const chainName = chainList.data.filter(
      (item) => item.chainId == chainId
    )[0].chainName;
    WalletList.findOne({
      walletAddress: walletAddress,
      chainName: chainName,
    }).then(async (model: any) => {
      if (!model)
        res.json({ success: false, message: "The WalletList not exits!" });

      model.isVisited = true;
      await model.save();
    });

    TokenInfo.find({ walletAddress, chainId }).then((models: any) => {
      return res.json({
        success: true,
        data: { tokenJsonData, chainId, models },
      });
    });
  } else {
    console.log(tokenJsonData.length);
    console.log(index, ind);
    const tokenItem: any = tokenJsonData[index];
    const blockInfoItem: any = blockNumberJsonData[ind];
    await getTokenInfo(
      Number(chainId),
      walletAddress,
      blockInfoItem.date,
      tokenItem.name,
      tokenItem.logoURI,
      tokenItem.address,
      tokenItem.symbol,
      Number(blockInfoItem.value),
      tokenJsonData,
      blockNumberJsonData,
      index,
      ind,
      res
    );
  }
};

const readTokenInfo = async (
  chainId: number,
  chainName: string,
  walletAddress: string,
  res: Response
) => {
  const rootPath = path.resolve(__dirname);
  await fs.readFile(
    `${rootPath}\\token_data\\${chainName}_tokens.json`,
    "utf8",
    async (err, data) => {
      if (err) {
        res.json({
          success: false,
          message: "Error happened while getting data",
        });
        return;
      }
      const tokenJsonData = JSON.parse(data).tokens;
      await fs.readFile(
        `${rootPath}\\block_number\\${chainName}.json`,
        "utf8",
        async (err, data) => {
          if (err) {
            res.json({
              success: false,
              message: "This chain is not available yet.",
            });
            return;
          } else {
            const blockNumberJsonData = JSON.parse(data);
            const chainName = chainList.data.filter(
              (item) => item.chainId == chainId
            )[0].chainName;
            await WalletList.findOne({
              walletAddress: walletAddress,
              chainName: chainName,
            }).then(async (model: any) => {
              if (!model)
                res.json({
                  success: false,
                  message: "The WalletList not exits!",
                });
              if (model.isVisited == true) {
                await TokenInfo.find({ walletAddress, chainId }).then(
                  (models: any) => {
                    return res.json({
                      success: true,
                      data: { tokenJsonData, chainId, models },
                    });
                  }
                );
              } else {
                getTokenInfoFunc(
                  tokenJsonData,
                  blockNumberJsonData,
                  5,
                  0,
                  Number(chainId),
                  walletAddress,
                  res
                );
              }
            });
          }
        }
      );
    }
  );
};

const getTokenAmount = async (
  chainId: number,
  tokenAddress: string,
  walletAddress: string,
  blockNumber: number
) => {
  try {
    const provider = new ethers.JsonRpcProvider(CHAIN_ID_TO_RPC[chainId]);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    const decimals = await contract.decimals();
    let block_number = blockNumber;
    if (block_number == -1) {
      blockNumber = await provider.getBlockNumber("latest");
    }
    const balance = await contract.balanceOf(walletAddress, {
      blockTag: blockNumber,
    });
    const balanceSn = await ethers.formatUnits(balance, decimals);
    return balanceSn;
  } catch (error) {
    return -1;
  }
};
