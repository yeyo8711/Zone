const hre = require("hardhat");

async function main() {
  const zoneToken = await hre.ethers.getContractFactory("ZoneToken");
  const ZoneToken = await zoneToken.deploy();
  await ZoneToken.deployed();

  const TestContract = await hre.ethers.getContractFactory("ZoneRewards");
  const ZoneRewards = await TestContract.deploy(ZoneToken.address);
  await ZoneRewards.deployed();

  console.log("Zone Token deployed to: ", ZoneToken.address);
  console.log("Zone Rewards deployed to: ", ZoneRewards.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
