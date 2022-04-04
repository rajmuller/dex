import { ChainId } from "@usedapp/core";

export const Contracts = {
  [ChainId.Polygon]: {
    dex: "test",
  },
  [ChainId.Mumbai]: {
    dex: "0x3D4589e0ca42F03Ced20846d5Be0489c588D29f4",
  },
};

export const NATIVE_CURRENCY = {
  [ChainId.Mumbai]: "MATIC",
};

export const ContractOwners = {
  [ChainId.Polygon]: "test",
  [ChainId.Mumbai]: "0x4c7f83d25bcefb3f7ae61c3a85a5b2037b37b994",
};
