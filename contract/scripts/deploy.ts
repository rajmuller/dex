import { utils } from "ethers";
import { ethers } from "hardhat";

async function main() {
  const Dex = await ethers.getContractFactory("Dex");
  const Link = await ethers.getContractFactory("Link");

  const dex = await Dex.deploy();
  const link = await Link.deploy();

  await dex.deployed();
  await link.deployed();

  console.log("Dex deployed to:", dex.address);
  console.log("Link deployed to:", link.address);

  const linkTicker = utils.formatBytes32String(await link.symbol());
  const tstTicker = utils.formatBytes32String("TST");
  const addLink = await dex.addToken(linkTicker, link.address);
  const addTst = await dex.addToken(
    tstTicker,
    "0x2d7882beDcbfDDce29Ba99965dd3cdF7fcB10A1e"
  );
  await Promise.all([addLink.wait(), addTst.wait()]);

  const tokenAddresses = await dex.getAddressList();

  console.log("Dex added token addresses: ", tokenAddresses);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
