require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");
require("solidity-coverage");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    bsc: {
      url: "https://rpc-bsc.bnb48.club",
      accounts: [process.env.PK],
    },
    testnet: {
      url: "https://rpc.ankr.com/bsc_testnet_chapel",
      accounts: [process.env.PK],
    },
    hardhat: {
      forking: {
        url: "https://rpc.ankr.com/bsc",
      },
    },
  },
  etherscan: {
    apiKey: "2EHDUE4VIK9UZQ9PXYFZYY1QQTTTSBUB5G",
  },
};
