import { Request, Response } from "express";
import * as chainList from "../service/chainInfo.json";
import TokenInfo from "../models/TokenInfo";
import { ITokenInfo } from "../service/interfaces";

const ethers = require("ethers");
const fs = require("fs");
const path = require("path");
const axios = require("axios");
const { ERC20_ABI } = require("../service/erc20-abi");
const { CHAIN_ID_TO_RPC } = require("../service/chainIdToRpc");

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

const getCoinId = async (tokenName: string, tokenSymbol: string) => {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/list?include_platform=false`;
    const response = await axios.get(url);
    const data = response.data;

    for (let i = 0; i < data.length; i++) {
      const coin = data[i];
      if (
        coin.symbol.toLowerCase() == tokenSymbol.toLowerCase() &&
        coin.name.replaceAll("-", " ").toLowerCase() == tokenName.toLowerCase()
      ) {
        return coin.id;
      }
    }

    return null;
  } catch (error) {
    return "";
  }
};

const getTokenPriceAtDate = async (coinId: string, date: string) => {
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

    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart/range?vs_currency=usd&from=${startTimestamp}&to=${
      startTimestamp + 10000
    }`;
    const response = await axios.get(url);
    const data = response.data;
    const prices = data.prices;
    const tokenPrice = prices.find((price) => {
      const timestamp = price[0];
      const priceDate = new Date(timestamp);
      return (
        priceDate.getMonth() === startDate.getMonth() &&
        priceDate.getFullYear() === startDate.getFullYear()
      );
    });

    return tokenPrice[1];
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
  tokenSymbol: string,
  blockNumber: number
) => {
  TokenInfo.findOne({
    chainId: chainId,
    walletAddress: walletAddress,
    date: date,
    tokenName: tokenName,
    tokenImage: tokenImage,
    tokenAddr: tokenAddress,
    tokenSymbol: tokenSymbol,
    blockNumber: blockNumber,
  }).then(async (model: any) => {
    if (model && model.date != "now") {
      const tokenInfoData = {
        tokenAmount: model.tokenAmount,
        tokenPrice: model.tokenPrice,
      };
      return tokenInfoData;
    } else {
      let tokenAmount = -1;
      if (blockNumber != -2) {
        tokenAmount = await getTokenAmount(
          Number(chainId),
          tokenAddress,
          walletAddress,
          Number(blockNumber)
        );
      }
      const coinId = await getCoinId(tokenName, tokenSymbol);
      const tokenPrice = await getTokenPriceAtDate(coinId, date);
      const tokenInfoData = {
        tokenAmount: tokenAmount,
        tokenPrice: tokenPrice,
      };
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
      console.log("One document addeded");
      return tokenInfoData;
    }
  });
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
          success: "false",
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
              success: "false",
              message: "This chain is not available yet.",
            });
            return;
          }
          const blockNumberJsonData = JSON.parse(data).data;
          let resultData: Array<Object> = [];
          await tokenJsonData.map((item: any) => {
            Object.entries(blockNumberJsonData).forEach(
              async ([key, value]) => {
                await setTimeout(async () => {
                  const data: any = await getTokenInfo(
                    chainId,
                    walletAddress,
                    key,
                    item.tokenName,
                    item.tokenImage,
                    item.tokenAddress,
                    item.tokenSymbol,
                    Number(value)
                  );
                  resultData.push({
                    ...item,
                    date: key,
                    chainId,
                    walletAddress,
                    tokenAmount: data.tokenAmount,
                    tokenPrice: data.tokenPrice,
                  });
                }, 1000);
              }
            );
          });
          return res.json({
            success: "true",
            data: { tokenJsonData, chainId, resultData },
          });
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
