import { Router } from "express";
import * as wallet from "../controllers/walletList.controller";

/**
 * Router
 * Using Passport
 */

const router = Router();

// Wallet List Controller

router.post("/walletList/insert", wallet.addItem);
router.post("/walletList/remove", wallet.removeItem);
router.post("/walletList/edit", wallet.editItem);
router.post("/walletList/getAll", wallet.getAllWalletList);

export default router;
