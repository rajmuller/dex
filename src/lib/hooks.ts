import { ChainId, useEthers, useConfig, ERC20Interface } from "@usedapp/core";
import { utils, Contract, providers } from "ethers";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useQueries, useQuery } from "react-query";
import axios from "axios";

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

export const useAddedTokenTickerList = () => {
  const dex = useDex({ readOnly: true });
  const { data, status, error } = useQuery(
    "addedTokenTickers",
    () => dex.getTokenList(),
    {
      refetchInterval: 30 * 1000,
    }
  );

  useEffect(() => {
    switch (status) {
      case "error":
        toast.error(`Failed loading tickers: ${error}`);
        break;
    }
  }, [error, status]);

  return { data, status };
};

export const useAddedTokenAddressList = () => {
  const dex = useDex({ readOnly: true });
  const { data, status } = useQuery(
    "addedTokenAddresses",
    () => dex.getAddressList(),
    {
      refetchInterval: 30 * 1000,
    }
  );
  return { data, status };
};

const getCoingeckoUrl = (tokenAddress: string) => {
  return `https://api.coingecko.com/api/v3/simple/token_price/polygon-pos?contract_addresses=${tokenAddress}&vs_currencies=eth`;
};

export const useToken = (ticker: string) => {
  const dex = useDex({ readOnly: true });
  const { data, status, error } = useQuery(
    ["token", ticker],
    () => dex.tokenMapping(ticker),
    {
      refetchInterval: 30 * 1000,
      enabled: !!ticker,
    }
  );

  useEffect(() => {
    switch (status) {
      case "error":
        toast.error(`Failed loading ${ticker} token: ${error}`);
        break;
    }
  }, [error, status, ticker]);

  return { data, status };
};

export const useTokenPrice = (address: string | undefined, ticker: string) => {
  const { data, status, error } = useQuery(
    ["tokenPrice", address],
    () => axios.get(getCoingeckoUrl(address!)),
    {
      refetchInterval: 30 * 1000,
      enabled: !!address,
    }
  );

  useEffect(() => {
    switch (status) {
      case "error":
        toast.error(`Failed loading ${ticker} token price: ${error}`);
        break;
    }
  }, [error, status, ticker]);

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
    "addedTokenBalance",
    () => erc20.balanceOf(account!),
    {
      enabled: !!account,
      refetchInterval: 30 * 1000,
    }
  );

  return { data, status };
};
