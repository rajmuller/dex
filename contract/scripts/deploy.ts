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
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
