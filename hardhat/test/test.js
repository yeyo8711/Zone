const { expect } = require("chai");
const { ethers } = require("hardhat");

// Helpers
const toWei = (amount) => ethers.utils.parseEther(amount.toString());
const fromWei = (amount) => ethers.utils.formatEther(amount);

describe("Rewards Contract", function () {
  // Declare Signers  and contracts
  let deployer,
    account1,
    account2,
    account3,
    account4,
    account5,
    account6,
    account7,
    account8,
    ZoneToken,
    ZoneRewards,
    server;
  it("Deploys both contracts and confirms ownership", async function () {
    [
      deployer,
      account1,
      account2,
      account3,
      account4,
      account5,
      account6,
      account7,
      account8,
      server,
    ] = await hre.ethers.getSigners();

    const zoneToken = await ethers.getContractFactory("ZoneToken");
    ZoneToken = await zoneToken.deploy();

    const TestContract = await ethers.getContractFactory("ZoneRewards");
    ZoneRewards = await TestContract.deploy(ZoneToken.address);

    expect(await ZoneToken.owner()).to.equal(deployer.address);
    expect(await ZoneRewards.owner()).to.equal(deployer.address);
  });
  it("Confirms reward token and server address", async function () {
    expect(await ZoneRewards.server()).to.equal(deployer.address);
    expect(await ZoneRewards.ZoneToken()).to.equal(ZoneToken.address);
  });
  it("Updates Server Address", async function () {
    expect(await ZoneRewards.server()).to.equal(deployer.address);
    await ZoneRewards.connect(deployer).updateServerAddress(server.address);
    expect(await ZoneRewards.server()).to.equal(server.address);
  });
  it("Deployer sends tokens to wallets/Contract before simulating contract interaction", async function () {
    const array = [
      account1.address,
      account2.address,
      account3.address,
      account4.address,
      account5.address,
    ];

    for (let i = 0; i < array.length; i++) {
      await ZoneToken.connect(deployer).transfer(array[i], toWei(10000));
      expect(await ZoneToken.balanceOf(array[i])).to.equal(toWei(10000));
    }
    await ZoneToken.connect(deployer).transfer(
      ZoneRewards.address,
      toWei(1000000)
    );
    expect(await ZoneToken.balanceOf(ZoneRewards.address)).to.equal(
      toWei(1000000)
    );
  });
  it("User trades in tokens for a ticket", async function () {
    expect(await ZoneRewards.availableTickets(account1.address)).to.equal(0);
    const startingTokenBalance = Number(
      fromWei(await ZoneToken.balanceOf(ZoneRewards.address))
    );
    await ZoneToken.connect(account1).approve(ZoneRewards.address, toWei(1000));
    await ZoneRewards.connect(account1).buyTicket();
    const endingTokenBalance = Number(
      fromWei(await ZoneToken.balanceOf(ZoneRewards.address))
    );
    expect(endingTokenBalance).to.be.greaterThan(startingTokenBalance);
    expect(await ZoneRewards.availableTickets(account1.address)).to.equal(1);
    expect(await ZoneToken.balanceOf(account1.address)).to.equal(toWei(9000));
  });
  it("Multiple players buy tickets, game ends and tickets removed", async function () {
    await ZoneToken.connect(account2).approve(ZoneRewards.address, toWei(1000));
    await ZoneRewards.connect(account2).buyTicket();
    await ZoneToken.connect(account3).approve(ZoneRewards.address, toWei(1000));
    await ZoneRewards.connect(account3).buyTicket();
    await ZoneToken.connect(account4).approve(ZoneRewards.address, toWei(1000));
    await ZoneRewards.connect(account4).buyTicket();

    expect(await ZoneRewards.availableTickets(account1.address)).to.equal(1);
    expect(await ZoneRewards.availableTickets(account2.address)).to.equal(1);
    expect(await ZoneRewards.availableTickets(account3.address)).to.equal(1);
    expect(await ZoneRewards.availableTickets(account4.address)).to.equal(1);

    const addressArray = [
      account1.address,
      account2.address,
      account3.address,
      account4.address,
    ];

    await ZoneRewards.connect(server).endGame(addressArray);

    expect(await ZoneRewards.availableTickets(account1.address)).to.equal(0);
    expect(await ZoneRewards.availableTickets(account2.address)).to.equal(0);
    expect(await ZoneRewards.availableTickets(account3.address)).to.equal(0);
    expect(await ZoneRewards.availableTickets(account4.address)).to.equal(0);
  });
  it("Server updates reward balances, they reflect in the contract", async function () {
    expect(await ZoneRewards.availableRewards(account1.address)).to.equal(0);
    expect(await ZoneRewards.availableRewards(account2.address)).to.equal(0);
    expect(await ZoneRewards.availableRewards(account3.address)).to.equal(0);
    expect(await ZoneRewards.availableRewards(account4.address)).to.equal(0);

    const playerArray = [
      account1.address,
      account2.address,
      account3.address,
      account4.address,
    ];
    let rewardArray = [1000, 2000, 3000];
    await expect(
      ZoneRewards.connect(server).updateRewards(playerArray, rewardArray)
    ).to.be.revertedWith("Arrays length dont match");

    rewardArray = [1000, 2000, 3000, 4000];
    await ZoneRewards.connect(server).updateRewards(playerArray, rewardArray);
    expect(await ZoneRewards.availableRewards(account1.address)).to.equal(
      toWei(1000)
    );
    expect(await ZoneRewards.availableRewards(account2.address)).to.equal(
      toWei(2000)
    );
    expect(await ZoneRewards.availableRewards(account3.address)).to.equal(
      toWei(3000)
    );
    expect(await ZoneRewards.availableRewards(account4.address)).to.equal(
      toWei(4000)
    );
  });
  it("Users can claim rewards", async function () {
    const startingBalance = Number(
      fromWei(await ZoneToken.balanceOf(account4.address))
    );
    const rewardsToClaim = Number(
      fromWei(await ZoneRewards.availableRewards(account4.address))
    );
    await ZoneRewards.connect(account4).claimRewards();
    const endingBalance = Number(
      fromWei(await ZoneToken.balanceOf(account4.address))
    );
    expect(startingBalance + rewardsToClaim).to.equal(endingBalance);
  });
  it("Changes Ticket Cost", async function () {
    await ZoneRewards.connect(deployer).changeTicketCost(2000);
    expect(await ZoneRewards.ticketCost()).to.equal(toWei(2000));
  });
});
