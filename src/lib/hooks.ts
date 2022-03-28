import { ChainId, useEthers, useConfig, ERC20Interface } from "@usedapp/core";
import { utils, Contract, providers } from "ethers";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useQueries, useQuery } from "react-query";

import { Dex__factory, ERC20 } from "../../contract/typechain";
import { Contracts } from "../config";

export function useChainId() {
  const { chainId } = useEthers();

  switch (chainId) {
    case ChainId.Mumbai:
      return chainId;
    default:
      return ChainId.Mumbai;
  }
}

const useDex = (args: { readOnly: boolean }) => {
  const { readOnlyUrls } = useConfig();
  const chainId = useChainId();

  if (args?.readOnly === false) {
    // @ts-ignore
    const provider = new providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    return Dex__factory.connect(Contracts[chainId].dex, signer);
  }

  const provider = new providers.JsonRpcProvider(readOnlyUrls![chainId]);
  return Dex__factory.connect(Contracts[chainId].dex, provider);
};

export const useAddedTokenAddressList = () => {
  const dex = useDex({ readOnly: true });
  const { data, status } = useQuery(
    "addedTokenAddresses",
    () => dex.getAddressList(),
    {
      refetchInterval: 30 * 1000,
      re
    }
  );
  return { data, status };
};

export const useTokenBalance = (address: string) => {
  const { account } = useEthers();
  const { readOnlyUrls } = useConfig();
  const chainId = useChainId();

  const provider = new providers.JsonRpcProvider(readOnlyUrls![chainId]);
  const erc20 = new Contract(
    address,
    ERC20Interface,
    provider
  ) as unknown as ERC20;

  const { data, status } = useQuery(
    "tokenBalance",
    () => erc20.balanceOf(account!),
    {
      enabled: !!account,
      refetchInterval: 30 * 1000,
    }
  );

  return { data, status };
};
