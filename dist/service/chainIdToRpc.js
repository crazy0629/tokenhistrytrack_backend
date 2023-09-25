"use strict";
const CHAIN_ID_TO_RPC = {
    56: "https://endpoints.omniatech.io/v1/bsc/mainnet/public",
    53935: "https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc",
    1088: "https://metis-mainnet.public.blastapi.io",
    1284: "https://endpoints.omniatech.io/v1/moonbeam/mainnet/public",
    42161: "https://arbitrum.llamarpc.com",
    1313161554: "https://mainnet.aurora.dev",
    43114: "https://rpc.ankr.com/avalanche",
    8453: "https://rpc.notadegen.com/base",
    288: "https://mainnet.boba.network",
    7700: "https://canto.slingshot.finance",
    25: "https://cronos.blockpi.network/v1/rpc/public",
    2000: "https://rpc.ankr.com/dogechain",
    1: "https://eth.llamarpc.com",
    250: "https://fantom-mainnet.public.blastapi.io",
    1666600000: "https://api.harmony.one",
    8217: "https://klaytn.blockpi.network/v1/rpc/public",
    1285: "https://moonriver.unitedbloc.com:2000",
    137: "https://polygon.llamarpc.com",
    10: "https://optimism.llamarpc.com",
};
module.exports = { CHAIN_ID_TO_RPC };
