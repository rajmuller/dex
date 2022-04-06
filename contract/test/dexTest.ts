import { expect } from "chai";
import { utils } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { ethers } from "hardhat";
// eslint-disable-next-line node/no-missing-import
import { fillOrderbook } from "./testUtils";

describe("Dex", async function () {
  const depositAmount = parseEther("500");
  const withdrawAmount = parseEther("200");
  const ownerTokenAmount = parseEther("1000");

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

    await expect(dex.deposit(parseEther("500"), linkTicker)).to.be.revertedWith(
      "Token is not initialized"
    );

    await dex.addToken(linkTicker, link.address);

    await expect(dex.deposit(parseEther("500"), linkTicker)).to.be.revertedWith(
      "ERC20: insufficient allowance"
    );

    await link.approve(dex.address, parseEther("1000"));

    // 500 tokens are transferred
    await expect(() =>
      dex.deposit(depositAmount, linkTicker)
    ).to.changeTokenBalance(link, dex, depositAmount);
  });

  it("should give back token list and address list", async function () {
    const Dex = await ethers.getContractFactory("Dex");
    const Link = await ethers.getContractFactory("Link");
    const dex = await Dex.deploy();
    const link = await Link.deploy();
    await dex.deployed();
    await link.deployed();

    const linkTicker = utils.formatBytes32String(await link.symbol());

    await dex.addToken(linkTicker, link.address);
    const tokenList = await dex.getTokenList();
    const tokenAddresses = await dex.getAddressList();

    expect(tokenList[0]).to.be.eq(linkTicker);
    expect(tokenAddresses[0]).to.be.eq(link.address);
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
    await link.approve(dex.address, parseEther("1000"));
    await dex.deposit(depositAmount, linkTicker);

    await dex.withdraw(withdrawAmount, linkTicker);

    expect(await link.balanceOf(owner.address)).to.equal(
      ownerTokenAmount.sub(depositAmount).add(withdrawAmount)
    );

    expect(await dex.balances(owner.address, linkTicker)).to.equal(
      depositAmount.sub(withdrawAmount)
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
    await link.approve(dex.address, parseEther("1000"));

    await expect(
      dex.createLimitOrder(0, linkTicker, parseEther("10"), parseEther("1"))
    ).to.be.revertedWith("Insufficient balance");

    await dex.depositEth({ value: parseEther("1000") });

    await expect(
      dex.createLimitOrder(0, linkTicker, parseEther("10"), parseEther("1"))
    ).to.not.reverted;
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
    await link.approve(dex.address, parseEther("1000"));

    await expect(
      dex.createLimitOrder(1, linkTicker, parseEther("10"), parseEther("1"))
    ).to.be.revertedWith("Insufficient tokens");

    await dex.deposit(parseEther("10"), linkTicker);

    await expect(dex.createLimitOrder(1, linkTicker, 10, parseEther("1"))).to
      .not.reverted;
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
    await link.approve(dex.address, parseEther("1000"));

    await dex.depositEth({ value: parseEther("1000") });

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
    await link.approve(dex.address, parseEther("1000"));

    await dex.deposit(parseEther("10"), linkTicker);

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
    await link.approve(dex.address, parseEther("1000"));

    await dex.depositEth({ value: parseEther("1000") });
    await dex.deposit(parseEther("1000"), linkTicker);

    await expect(dex.createMarketOrder(1, linkTicker, parseEther("1100"))).to.be
      .reverted;
  });

  it("should have enough ETH when creating a market BUY MARKET ORDER", async function () {
    const Dex = await ethers.getContractFactory("Dex");
    const Link = await ethers.getContractFactory("Link");
    const dex = await Dex.deploy();
    const link = await Link.deploy();
    await dex.deployed();
    await link.deployed();
    const [, address1] = await ethers.getSigners();

    const linkTicker = utils.formatBytes32String(await link.symbol());
    await dex.addToken(linkTicker, link.address);
    await link.approve(dex.address, parseEther("1000"));

    await dex.connect(address1).depositEth({ value: parseEther("1000") });
    await dex.deposit(parseEther("1000"), linkTicker);

    await dex.createLimitOrder(
      1,
      linkTicker,
      parseEther("1"),
      parseEther("1001")
    );

    await expect(
      dex.connect(address1).createMarketOrder(0, linkTicker, parseEther("1"))
    ).to.be.revertedWith("Insufficient balance");
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
    await link.approve(dex.address, parseEther("1000"));

    await dex.depositEth({ value: parseEther("1000") });
    await dex.deposit(parseEther("1000"), linkTicker);
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
    await link.transfer(address1.address, parseEther("50"));
    await link.transfer(address2.address, parseEther("50"));
    await link.transfer(address3.address, parseEther("50"));

    // Approve DEX for accounts owner,1,2,3 to spend link
    await link.connect(address1).approve(dex.address, parseEther("1000"));
    await link.connect(address2).approve(dex.address, parseEther("1000"));
    await link.connect(address3).approve(dex.address, parseEther("1000"));

    // Deposit link to DEX
    await dex.connect(address1).deposit(parseEther("10"), linkTicker);
    await dex.connect(address2).deposit(parseEther("10"), linkTicker);
    await dex.connect(address3).deposit(parseEther("10"), linkTicker);

    // Fill up orderbook
    await dex
      .connect(address1)
      .createLimitOrder(1, linkTicker, parseEther("5"), parseEther("10"));
    await dex
      .connect(address2)
      .createLimitOrder(1, linkTicker, parseEther("5"), parseEther("20"));
    await dex
      .connect(address3)
      .createLimitOrder(1, linkTicker, parseEther("5"), parseEther("30"));

    await dex.depositEth({ value: parseEther("1000") });

    // It should be filled and 5 LINK left in the OB
    await dex.createMarketOrder(0, linkTicker, parseEther("10")); // ez a problemas

    const orderbook = await dex.getOrderBook(linkTicker, 1);
    // const orderbook = await dex.getOrderBook(linkTicker, 1);

    expect(orderbook.length).to.be.equal(1);
    expect(orderbook[0].filled.eq(0)).to.be.true;
    expect((await dex.balances(owner.address, linkTicker)).eq(parseEther("10")))
      .to.be.true;
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
    await link.transfer(address1.address, parseEther("50"));
    await link.transfer(address2.address, parseEther("50"));
    await link.transfer(address3.address, parseEther("50"));

    // Approve DEX for accounts owner,1,2,3 to spend link
    await link.connect(address1).approve(dex.address, parseEther("1000"));
    await link.connect(address2).approve(dex.address, parseEther("1000"));
    await link.connect(address3).approve(dex.address, parseEther("1000"));

    // Deposit link to DEX
    await dex.connect(address1).deposit(parseEther("50"), linkTicker);
    await dex.connect(address2).deposit(parseEther("50"), linkTicker);
    await dex.connect(address3).deposit(parseEther("50"), linkTicker);

    // Fill up orderbook
    await dex
      .connect(address1)
      .createLimitOrder(1, linkTicker, parseEther("5"), parseEther("10"));
    await dex
      .connect(address2)
      .createLimitOrder(1, linkTicker, parseEther("5"), parseEther("20"));
    await dex
      .connect(address3)
      .createLimitOrder(1, linkTicker, parseEther("5"), parseEther("30"));

    await dex.depositEth({ value: parseEther("1000") });
    await dex.createMarketOrder(0, linkTicker, parseEther("50"));

    const orderbook = await dex.getOrderBook(linkTicker, 1);
    expect(orderbook.length).to.be.equal(0);
    expect(
      (await dex.balances(owner.address, linkTicker)).toString()
    ).to.be.equal(parseEther("15"));
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
    await link.transfer(address1.address, parseEther("50"));
    await link.transfer(address2.address, parseEther("50"));
    await link.transfer(address3.address, parseEther("50"));

    // Approve DEX for accounts owner,1,2,3 to spend link
    await link.connect(address1).approve(dex.address, parseEther("1000"));
    await link.connect(address2).approve(dex.address, parseEther("1000"));
    await link.connect(address3).approve(dex.address, parseEther("1000"));

    // Deposit link to DEX
    await dex.connect(address1).deposit(parseEther("50"), linkTicker);
    await dex.connect(address2).deposit(parseEther("50"), linkTicker);
    await dex.connect(address3).deposit(parseEther("50"), linkTicker);

    // Fill up orderbook
    await dex
      .connect(address1)
      .createLimitOrder(1, linkTicker, parseEther("5"), parseEther("10"));
    await dex
      .connect(address2)
      .createLimitOrder(1, linkTicker, parseEther("5"), parseEther("20"));
    await dex
      .connect(address3)
      .createLimitOrder(1, linkTicker, parseEther("5"), parseEther("30"));

    await dex.depositEth({ value: parseEther("1000") });

    const balanceBefore = await dex.balances(owner.address, ethTicker);
    await dex.createMarketOrder(0, linkTicker, parseEther("1"));
    const balanceAfter = await dex.balances(owner.address, ethTicker);

    expect(balanceBefore).to.be.equal(balanceAfter.add(parseEther("10")));
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
    await link.transfer(address1.address, parseEther("50"));
    await link.transfer(address2.address, parseEther("50"));
    await link.transfer(address3.address, parseEther("50"));

    // Approve DEX for accounts owner,1,2,3 to spend link
    await link.connect(address1).approve(dex.address, parseEther("1000"));
    await link.connect(address2).approve(dex.address, parseEther("1000"));
    await link.connect(address3).approve(dex.address, parseEther("1000"));

    // Deposit link to DEX
    await dex.connect(address1).deposit(parseEther("50"), linkTicker);
    await dex.connect(address2).deposit(parseEther("50"), linkTicker);
    await dex.connect(address3).deposit(parseEther("50"), linkTicker);

    // Fill up orderbook
    await dex
      .connect(address1)
      .createLimitOrder(1, linkTicker, parseEther("5"), parseEther("10"));
    await dex
      .connect(address2)
      .createLimitOrder(1, linkTicker, parseEther("5"), parseEther("20"));
    await dex
      .connect(address3)
      .createLimitOrder(1, linkTicker, parseEther("5"), parseEther("30"));

    await dex.depositEth({ value: parseEther("1000") });

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

    await dex.createMarketOrder(0, linkTicker, parseEther("12"));

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

    expect(address1BalanceBefore).to.be.equal(
      address1BalanceAfter.add(parseEther("5"))
    );
    expect(address2BalanceBefore).to.be.equal(
      address2BalanceAfter.add(parseEther("5"))
    );
    expect(address3BalanceBefore).to.be.equal(
      address3BalanceAfter.add(parseEther("2"))
    );
  });

  it("should set limit orders' filled property correctly after a trade", async () => {
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
    await link.transfer(address1.address, parseEther("50"));
    await link.transfer(address2.address, parseEther("50"));
    await link.transfer(address3.address, parseEther("50"));

    // Approve DEX for accounts owner,1,2,3 to spend link
    await link.connect(address1).approve(dex.address, parseEther("1000"));
    await link.connect(address2).approve(dex.address, parseEther("1000"));
    await link.connect(address3).approve(dex.address, parseEther("1000"));

    // Deposit link to DEX
    await dex.connect(address1).deposit(parseEther("50"), linkTicker);
    await dex.connect(address2).deposit(parseEther("50"), linkTicker);
    await dex.connect(address3).deposit(parseEther("50"), linkTicker);

    // Fill up orderbook
    await dex
      .connect(address1)
      .createLimitOrder(1, linkTicker, parseEther("5"), parseEther("10"));
    await dex
      .connect(address2)
      .createLimitOrder(1, linkTicker, parseEther("5"), parseEther("20"));
    await dex
      .connect(address3)
      .createLimitOrder(1, linkTicker, parseEther("5"), parseEther("30"));

    await dex.depositEth({ value: parseEther("1000") });
    await dex.createMarketOrder(0, linkTicker, parseEther("3"));

    const orderbook = await dex.getOrderBook(linkTicker, 1);
    expect(orderbook[0].filled).to.be.equal(parseEther("3"));
    expect(orderbook[0].amount).to.be.equal(parseEther("5"));
  });
});
