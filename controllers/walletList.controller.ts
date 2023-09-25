import { Request, Response } from "express";
import WalletList from "../models/WalletList";

// import * as walletLists from "../service/walletList.json";
// import { IWalletList } from "../service/interfaces";

// const initWalletList = async () => {
//   walletLists.data.map(async (item) => {
//     let model = new WalletList();
//     model.walletAddress = item.walletAddress;
//     model.chainName = item.chainName;
//     await model.save();
//   });
// };

// initWalletList();

export const getAllWalletList = async (req: Request, res: Response) => {
  WalletList.find().then((models: any) => {
    res.json({ models });
  });
};

export const addItem = async (req: Request, res: Response) => {
  WalletList.findOne({
    walletAddress: req.body.walletAddress,
    chainName: req.body.chainName,
  }).then(async (model: any) => {
    if (model) res.json({ success: false, message: "The List exits!" });

    model = new WalletList();
    model.walletAddress = req.body.walletAddress;
    model.chainName = req.body.chainName;
    model.save().then(() => {
      res.json({ success: true, model, message: "Successfully added" });
    });
  });
};

export const removeItem = async (req: Request, res: Response) => {
  WalletList.findByIdAndDelete(req.body.walletListId).then((model: any) => {
    res.json({ success: true, model, message: "Successfully deleted" });
  });
};

export const editItem = async (req: Request, res: Response) => {
  WalletList.findOne({
    _id: req.body.walletListId,
  }).then(async (model: any) => {
    if (!model)
      res.json({ success: false, message: "The WalletList not exits!" });

    model.walletAddress = req.body.walletAddress;
    model.chainName = req.body.chainName;
    WalletList.findOne({
      walletAddress: req.body.walletAddress,
      chainName: req.body.chainName,
    }).then(async (model1: any) => {
      if (model1)
        res.json({ success: false, message: "This List already exits!" });
      else {
        model.save().then(() => {
          res.json({
            success: true,
            model,
            message: "Successfully edited",
          });
        });
      }
    });
  });
};
