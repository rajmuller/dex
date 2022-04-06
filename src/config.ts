import { ChainId } from "@usedapp/core";

export const Contracts = {
  [ChainId.Polygon]: {
    dex: "test",
  },
  [ChainId.Mumbai]: {
    dex: "0x0ce803d574fEd126389Fa38d622d0DA3E3e830D6",
  },
};

export const NATIVE_CURRENCY = {
  [ChainId.Mumbai]: "MATIC",
};

export const ContractOwners = {
  [ChainId.Polygon]: "test",
  [ChainId.Mumbai]: "0x4c7f83d25bcefb3f7ae61c3a85a5b2037b37b994",
};
