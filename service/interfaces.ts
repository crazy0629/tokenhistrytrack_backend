import { Document } from "mongoose";

/**
 * IWalletList Interface
 * Document class inheritance
 */

export interface IWalletList extends Document {
  walletAddress: string;
  chainName: string;
}
