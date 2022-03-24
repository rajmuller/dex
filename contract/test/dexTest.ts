import { expect } from "chai";
import { utils } from "ethers";
import { ethers } from "hardhat";

// eslint-disable-next-line node/no-missing-import
import { fillOrderbook } from "./testUtils";

describe("Dex", async function () {
  const depositAmount = 500;
  const withdrawAmount = 200;
  const ownerTokenAmount = 1000;

  it("should only be possible for owner to add tokens", async function () {
    const [, address1] = await ethers.getSigners();
    const Dex = await ethers.getContractFactory("Dex");
    const Link = await ethers.getContractFactory("Link");
    const dex = await Dex.deploy();
    const link = await Link.deploy();
    await dex.deployed();
    await link.deployed();

    const linkTicker = utils.formatBytes32String(await link.symbol());

    await expect(
      dex.connect(address1).addToken(linkTicker, link.address)
    ).to.be.revertedWith("Ownable: caller is not the owner");

    await expect(dex.addToken(linkTicker, link.address)).to.not.reverted;
  });

  it("should handle deposits correctly", async function () {
    const Dex = await ethers.getContractFactory("Dex");
    const Link = await ethers.getContractFactory("Link");
    const dex = await Dex.deploy();
    const link = await Link.deploy();
    await dex.deployed();
    await link.deployed();

    const linkTicker = utils.formatBytes32String(await link.symbol());

    await expect(dex.deposit(500, linkTicker)).to.be.revertedWith(
      "Token is not initialized"
    );

    await dex.addToken(linkTicker, link.address);

    await expect(dex.deposit(500, linkTicker)).to.be.revertedWith(
      "ERC20: insufficient allowance"
    );

    await link.approve(dex.address, 1000);

    // 500 tokens are transferred
    await expect(() =>
      dex.deposit(depositAmount, linkTicker)
    ).to.changeTokenBalance(link, dex, depositAmount);
  });

  it("should revert faulty withdrawals", async function () {
    const Dex = await ethers.getContractFactory("Dex");
    const Link = await ethers.getContractFactory("Link");
    const dex = await Dex.deploy();
    const link = await Link.deploy();
    await dex.deployed();
    await link.deployed();

    const linkTicker = utils.formatBytes32String(await link.symbol());

    await dex.addToken(linkTicker, link.address);

    await expect(dex.withdraw(500, linkTicker)).to.be.revertedWith(
      "Balance not sufficient"
    );
  });

  it("should handle withdrawals correctly", async function () {
    const [owner] = await ethers.getSigners();
    const Dex = await ethers.getContractFactory("Dex");
    const Link = await ethers.getContractFactory("Link");
    const dex = await Dex.deploy();
    const link = await Link.deploy();
    await dex.deployed();
    await link.deployed();

    const linkTicker = utils.formatBytes32String(await link.symbol());

    await dex.addToken(linkTicker, link.address);
    await link.approve(dex.address, 1000);
    await dex.deposit(depositAmount, linkTicker);

    await dex.withdraw(withdrawAmount, linkTicker);

    expect(await link.balanceOf(owner.address)).to.equal(
      ownerTokenAmount - depositAmount + withdrawAmount
    );

    expect(await dex.balances(owner.address, linkTicker)).to.equal(
      depositAmount - withdrawAmount
    );
  });

  it("should have enough ETH when creating a BUY LIMIT ORDER", async function () {
    const Dex = await ethers.getContractFactory("Dex");
    const Link = await ethers.getContractFactory("Link");
    const dex = await Dex.deploy();
    const link = await Link.deploy();
    await dex.deployed();
    await link.deployed();

    const linkTicker = utils.formatBytes32String(await link.symbol());
    await dex.addToken(linkTicker, link.address);
    await link.approve(dex.address, 1000);

    await expect(dex.createLimitOrder(0, linkTicker, 10, 1)).to.be.revertedWith(
      "Not enough balance"
    );

    await dex.depositEth({ value: 10 });

    await expect(dex.createLimitOrder(0, linkTicker, 10, 1)).to.not.reverted;
  });

  it("should have enough tokens when creating a SELL LIMIT ORDER", async function () {
    const Dex = await ethers.getContractFactory("Dex");
    const Link = await ethers.getContractFactory("Link");
    const dex = await Dex.deploy();
    const link = await Link.deploy();
    await dex.deployed();
    await link.deployed();

    const linkTicker = utils.formatBytes32String(await link.symbol());
    await dex.addToken(linkTicker, link.address);
    await link.approve(dex.address, 1000);

    await expect(dex.createLimitOrder(1, linkTicker, 10, 1)).to.be.revertedWith(
      "Not enough tokens"
    );

    await dex.deposit(10, linkTicker);

    await expect(dex.createLimitOrder(1, linkTicker, 10, 1)).to.not.reverted;
  });

  it("should test that the BUY order book is ordered on price from highest -> lowest", async function () {
    const Dex = await ethers.getContractFactory("Dex");
    const Link = await ethers.getContractFactory("Link");
    const dex = await Dex.deploy();
    const link = await Link.deploy();
    await dex.deployed();
    await link.deployed();

    const linkTicker = utils.formatBytes32String(await link.symbol());
    await dex.addToken(linkTicker, link.address);
    await link.approve(dex.address, 1000);

    await dex.depositEth({ value: 1000 });

    await fillOrderbook(10, "BUY", dex, linkTicker);

    const orderbook = await dex.getOrderBook(linkTicker, 0);

    expect(orderbook.length).to.be.greaterThan(0);

    for (let index = 0; index < orderbook.length - 1; index++) {
      expect(orderbook[index].price.toNumber()).to.be.greaterThanOrEqual(
        orderbook[index + 1].price.toNumber()
      );
    }
  });

  it("should test that the SELL order book is ordered on price from lowest -> highest", async function () {
    const Dex = await ethers.getContractFactory("Dex");
    const Link = await ethers.getContractFactory("Link");
    const dex = await Dex.deploy();
    const link = await Link.deploy();
    await dex.deployed();
    await link.deployed();

    const linkTicker = utils.formatBytes32String(await link.symbol());
    await dex.addToken(linkTicker, link.address);
    await link.approve(dex.address, 1000);

    await dex.deposit(10, linkTicker);

    await fillOrderbook(10, "SELL", dex, linkTicker);
    const orderbook = await dex.getOrderBook(linkTicker, 1);
    expect(orderbook.length).to.be.greaterThan(0);

    for (let index = 0; index < orderbook.length - 1; index++) {
      expect(orderbook[index].price.toNumber()).to.be.lessThanOrEqual(
        orderbook[index + 1].price.toNumber()
      );
    }
  });

  it("should have enough tokens when creating a market SELL MARKET ORDER", async function () {
    const Dex = await ethers.getContractFactory("Dex");
    const Link = await ethers.getContractFactory("Link");
    const dex = await Dex.deploy();
    const link = await Link.deploy();
    await dex.deployed();
    await link.deployed();

    const linkTicker = utils.formatBytes32String(await link.symbol());
    await dex.addToken(linkTicker, link.address);
    await link.approve(dex.address, 1000);

    await dex.depositEth({ value: 1000 });
    await dex.deposit(1000, linkTicker);

    await fillOrderbook(30, "BOTH", dex, linkTicker);

    await expect(dex.createMarketOrder(1, linkTicker, 1100)).to.be.reverted;
  });

  it("should have enough ETH when creating a market BUY MARKET ORDER", async function () {
    const Dex = await ethers.getContractFactory("Dex");
    const Link = await ethers.getContractFactory("Link");
    const dex = await Dex.deploy();
    const link = await Link.deploy();
    await dex.deployed();
    await link.deployed();

    const linkTicker = utils.formatBytes32String(await link.symbol());
    await dex.addToken(linkTicker, link.address);
    await link.approve(dex.address, 1000);

    await dex.depositEth({ value: 1000 });
    await dex.deposit(1000, linkTicker);

    // create 10k ETH sum value on the OB
    await dex.createLimitOrder(1, linkTicker, 10, 500);
    // create market order of 1500 ETH sum value
    await expect(dex.createMarketOrder(0, linkTicker, 3)).to.be.reverted;
  });

  it("should allow market market orders to be submitted even if the order book is empty", async function () {
    const Dex = await ethers.getContractFactory("Dex");
    const Link = await ethers.getContractFactory("Link");
    const dex = await Dex.deploy();
    const link = await Link.deploy();
    await dex.deployed();
    await link.deployed();

    const linkTicker = utils.formatBytes32String(await link.symbol());
    await dex.addToken(linkTicker, link.address);
    await link.approve(dex.address, 1000);

    await dex.depositEth({ value: 1000 });
    await dex.deposit(1000, linkTicker);
    const orderbook = await dex.getOrderBook(linkTicker, 1);

    expect(orderbook.length).to.be.equal(0);
    await expect(dex.createMarketOrder(1, linkTicker, 500)).not.be.reverted;
  });

  it("Market orders should not fill more limit orders than the market order amount", async function () {
    const [owner, address1, address2, address3] = await ethers.getSigners();
    const Dex = await ethers.getContractFactory("Dex");
    const Link = await ethers.getContractFactory("Link");
    const dex = await Dex.deploy();
    const link = await Link.deploy();
    await dex.deployed();
    await link.deployed();

    const linkTicker = utils.formatBytes32String(await link.symbol());
    await dex.addToken(linkTicker, link.address);

    // Send LINK tokens to accounts
    await link.transfer(address1.address, 50);
    await link.transfer(address2.address, 50);
    await link.transfer(address3.address, 50);

    // Approve DEX for accounts owner,1,2,3 to spend link
    await link.connect(address1).approve(dex.address, 1000);
    await link.connect(address2).approve(dex.address, 1000);
    await link.connect(address3).approve(dex.address, 1000);

    // Deposit link to DEX
    await dex.connect(address1).deposit(10, linkTicker);
    await dex.connect(address2).deposit(10, linkTicker);
    await dex.connect(address3).deposit(10, linkTicker);

    // Fill up orderbook
    await dex.connect(address1).createLimitOrder(1, linkTicker, 5, 10);
    await dex.connect(address2).createLimitOrder(1, linkTicker, 5, 20);
    await dex.connect(address3).createLimitOrder(1, linkTicker, 5, 30);

    await dex.depositEth({ value: 1000 });

    // It should be filled and 5 LINK left in the OB
    await dex.createMarketOrder(0, linkTicker, 10); // ez a problemas

    const orderbook = await dex.getOrderBook(linkTicker, 1);
    // const orderbook = await dex.getOrderBook(linkTicker, 1);

    expect(orderbook.length).to.be.equal(1);
    expect(orderbook[0].filled.toNumber()).to.be.equal(0);
    expect(
      (await dex.balances(owner.address, linkTicker)).toNumber()
    ).to.be.equal(10);
  });

  it("Market orders should be filled until the order book is empty", async function () {
    const [owner, address1, address2, address3] = await ethers.getSigners();
    const Dex = await ethers.getContractFactory("Dex");
    const Link = await ethers.getContractFactory("Link");
    const dex = await Dex.deploy();
    const link = await Link.deploy();
    await dex.deployed();
    await link.deployed();

    const linkTicker = utils.formatBytes32String(await link.symbol());
    await dex.addToken(linkTicker, link.address);

    // Send LINK tokens to accounts
    await link.transfer(address1.address, 50);
    await link.transfer(address2.address, 50);
    await link.transfer(address3.address, 50);

    // Approve DEX for accounts owner,1,2,3 to spend link
    await link.connect(address1).approve(dex.address, 1000);
    await link.connect(address2).approve(dex.address, 1000);
    await link.connect(address3).approve(dex.address, 1000);

    // Deposit link to DEX
    await dex.connect(address1).deposit(50, linkTicker);
    await dex.connect(address2).deposit(50, linkTicker);
    await dex.connect(address3).deposit(50, linkTicker);

    // Fill up orderbook
    await dex.connect(address1).createLimitOrder(1, linkTicker, 5, 10);
    await dex.connect(address2).createLimitOrder(1, linkTicker, 5, 20);
    await dex.connect(address3).createLimitOrder(1, linkTicker, 5, 30);

    await dex.depositEth({ value: 1000 });
    await dex.createMarketOrder(0, linkTicker, 50);

    const orderbook = await dex.getOrderBook(linkTicker, 1);
    expect(orderbook.length).to.be.equal(0);
    expect(
      (await dex.balances(owner.address, linkTicker)).toNumber()
    ).to.be.equal(15);
  });

  it("should decrease the ETH balance of the buyer with the filled amount", async () => {
    const [owner, address1, address2, address3] = await ethers.getSigners();
    const Dex = await ethers.getContractFactory("Dex");
    const Link = await ethers.getContractFactory("Link");
    const dex = await Dex.deploy();
    const link = await Link.deploy();
    await dex.deployed();
    await link.deployed();

    const linkTicker = utils.formatBytes32String(await link.symbol());
    const ethTicker = utils.formatBytes32String("ETH");

    await dex.addToken(linkTicker, link.address);

    // Send LINK tokens to accounts
    await link.transfer(address1.address, 50);
    await link.transfer(address2.address, 50);
    await link.transfer(address3.address, 50);

    // Approve DEX for accounts owner,1,2,3 to spend link
    await link.connect(address1).approve(dex.address, 1000);
    await link.connect(address2).approve(dex.address, 1000);
    await link.connect(address3).approve(dex.address, 1000);

    // Deposit link to DEX
    await dex.connect(address1).deposit(50, linkTicker);
    await dex.connect(address2).deposit(50, linkTicker);
    await dex.connect(address3).deposit(50, linkTicker);

    // Fill up orderbook
    await dex.connect(address1).createLimitOrder(1, linkTicker, 5, 10);
    await dex.connect(address2).createLimitOrder(1, linkTicker, 5, 20);
    await dex.connect(address3).createLimitOrder(1, linkTicker, 5, 30);

    await dex.depositEth({ value: 1000 });

    const balanceBefore = await dex.balances(owner.address, ethTicker);
    await dex.createMarketOrder(0, linkTicker, 1);
    const balanceAfter = await dex.balances(owner.address, ethTicker);

    expect(balanceBefore.toNumber()).to.be.equal(balanceAfter.toNumber() + 10);
  });

  it("should decrease the token balances of the limit sellers with the filled amounts", async () => {
    const [, address1, address2, address3] = await ethers.getSigners();
    const Dex = await ethers.getContractFactory("Dex");
    const Link = await ethers.getContractFactory("Link");
    const dex = await Dex.deploy();
    const link = await Link.deploy();
    await dex.deployed();
    await link.deployed();

    const linkTicker = utils.formatBytes32String(await link.symbol());

    await dex.addToken(linkTicker, link.address);

    // Send LINK tokens to accounts
    await link.transfer(address1.address, 50);
    await link.transfer(address2.address, 50);
    await link.transfer(address3.address, 50);

    // Approve DEX for accounts owner,1,2,3 to spend link
    await link.connect(address1).approve(dex.address, 1000);
    await link.connect(address2).approve(dex.address, 1000);
    await link.connect(address3).approve(dex.address, 1000);

    // Deposit link to DEX
    await dex.connect(address1).deposit(50, linkTicker);
    await dex.connect(address2).deposit(50, linkTicker);
    await dex.connect(address3).deposit(50, linkTicker);

    // Fill up orderbook
    await dex.connect(address1).createLimitOrder(1, linkTicker, 5, 10);
    await dex.connect(address2).createLimitOrder(1, linkTicker, 5, 20);
    await dex.connect(address3).createLimitOrder(1, linkTicker, 5, 30);

    await dex.depositEth({ value: 1000 });

    const address1BalanceBefore = await dex.balances(
      address1.address,
      linkTicker
    );
    const address2BalanceBefore = await dex.balances(
      address2.address,
      linkTicker
    );
    const address3BalanceBefore = await dex.balances(
      address3.address,
      linkTicker
    );

    await dex.createMarketOrder(0, linkTicker, 12);

    const address1BalanceAfter = await dex.balances(
      address1.address,
      linkTicker
    );
    const address2BalanceAfter = await dex.balances(
      address2.address,
      linkTicker
    );
    const address3BalanceAfter = await dex.balances(
      address3.address,
      linkTicker
    );

    expect(address1BalanceBefore.toNumber()).to.be.equal(
      address1BalanceAfter.toNumber() + 5
    );
    expect(address2BalanceBefore.toNumber()).to.be.equal(
      address2BalanceAfter.toNumber() + 5
    );
    expect(address3BalanceBefore.toNumber()).to.be.equal(
      address3BalanceAfter.toNumber() + 2
    );
  });

  it.only("should set limit orders' filled property correctly after a trade", async () => {
    const [, address1, address2, address3] = await ethers.getSigners();
    const Dex = await ethers.getContractFactory("Dex");
    const Link = await ethers.getContractFactory("Link");
    const dex = await Dex.deploy();
    const link = await Link.deploy();
    await dex.deployed();
    await link.deployed();

    const linkTicker = utils.formatBytes32String(await link.symbol());
    await dex.addToken(linkTicker, link.address);

    // Send LINK tokens to accounts
    await link.transfer(address1.address, 50);
    await link.transfer(address2.address, 50);
    await link.transfer(address3.address, 50);

    // Approve DEX for accounts owner,1,2,3 to spend link
    await link.connect(address1).approve(dex.address, 1000);
    await link.connect(address2).approve(dex.address, 1000);
    await link.connect(address3).approve(dex.address, 1000);

    // Deposit link to DEX
    await dex.connect(address1).deposit(50, linkTicker);
    await dex.connect(address2).deposit(50, linkTicker);
    await dex.connect(address3).deposit(50, linkTicker);

    // Fill up orderbook
    await dex.connect(address1).createLimitOrder(1, linkTicker, 5, 10);
    await dex.connect(address2).createLimitOrder(1, linkTicker, 5, 20);
    await dex.connect(address3).createLimitOrder(1, linkTicker, 5, 30);

    await dex.depositEth({ value: 1000 });
    await dex.createMarketOrder(0, linkTicker, 3);

    const orderbook = await dex.getOrderBook(linkTicker, 1);
    expect(orderbook[0].filled.toNumber()).to.be.equal(3);
    expect(orderbook[0].amount.toNumber()).to.be.equal(5);
  });
});
