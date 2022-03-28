import { ChainId } from "@usedapp/core";

export const Contracts = {
  [ChainId.Polygon]: {
    dex: "test",
    linkk: "test",
  },
  [ChainId.Mumbai]: {
    dex: "0x9214b562986F28959420c30AE94725bBF2E3Af69",
    linkk: "0x6b37b3aA50D017913d1535aB87938E1A6a9759e3",
  },
};

export const ContractOwners = {
  [ChainId.Polygon]: "test",
  [ChainId.Mumbai]: "0x4c7f83d25bcefb3f7ae61c3a85a5b2037b37b994",
};
