import { ChainId } from "@usedapp/core";

export const dexOwner = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

export const Contracts = {
  [ChainId.Polygon]: {
    dex: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    linkk: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  },
  [ChainId.Mumbai]: {
    dex: "0x9214b562986F28959420c30AE94725bBF2E3Af69",
    linkk: "0x6b37b3aA50D017913d1535aB87938E1A6a9759e3",
  },
};

export const ContractOwners = {
  [ChainId.Polygon]: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
  [ChainId.Mumbai]: "0x4c7f83d25bcefb3f7ae61c3a85a5b2037b37b994",
};
