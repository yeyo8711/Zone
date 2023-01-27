const express = require("express");
const app = express();
const { ethers } = require("ethers");
const cors = require("cors");
const tokenAbi = require("./tokenAbi.json");
const rewardAbi = require("./rewardAbi.json");
app.use(cors());
app.use(express.json());

const ZoneTokenAddress = "0xDd3699049C369e0aCa21faA29972b9BFA7593278";
const ZoneRewardsAddress = "0xef5702a3E3dECB3467E941FeB611e01483656d52";
const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.ankr.com/bsc_testnet_chapel"
);
const deployer = new ethers.Wallet(
  "7b1e69b337b5a6c4898457456009ca9d6bb67b092d69aaed46280f8f45a7d9e5",
  provider
);
const ZoneToken = new ethers.Contract(ZoneTokenAddress, tokenAbi, deployer);
const ZoneRewards = new ethers.Contract(
  ZoneRewardsAddress,
  rewardAbi,
  deployer
);

app.post("/", async (req, res) => {
  console.log(req.body.addressArray);
  try {
    const endGame = await ZoneRewards.endGame(req.body.addressArray);
    await endGame.wait();
    res.status(200).json({
      status: "success",
      message: "Player Addresses Received",
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      error,
    });
  }
});

app.post("/rewards", async (req, res) => {
  console.log(req.body);
  try {
    const submit = await ZoneRewards.updateRewards(
      req.body.addressArray,
      req.body.rewardArray
    );
    await submit.wait();
    res.status(200).json({
      status: "success",
      message: "rewards array received",
    });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      error,
    });
  }
});

app.listen(3000, () => {
  console.log("Listening on port 3000");
});
