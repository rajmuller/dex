import { ChainId, useEthers, useConfig, ERC20Interface } from "@usedapp/core";
import { utils, Contract, providers, BytesLike, BigNumber } from "ethers";
import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useQueries, useQuery } from "react-query";
import axios from "axios";
import { formatBytes32String } from "ethers/lib/utils";

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

export const useTickerList = () => {
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

export const useAddressList = () => {
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

export const useToken = (ticker?: string) => {
  const dex = useDex({ readOnly: true });
  const { data, status, error } = useQuery(
    ["token", ticker],
    () => dex.tokenMapping(formatBytes32String(ticker!)),
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

type BalanceProps = {
  value: BigNumber;
  decimals: number;
};

export const useTokenBalance = (address?: string): BalanceProps => {
  const [balance, setBalance] = useState<BalanceProps>({
    value: BigNumber.from(0),
    decimals: 18,
  });

  const { account } = useEthers();
  const { readOnlyUrls } = useConfig();
  const chainId = useChainId();

  const provider = new providers.JsonRpcProvider(readOnlyUrls![chainId]);

  const erc20 = address
    ? (new Contract(address!, ERC20Interface, provider) as unknown as ERC20)
    : null;

  const decimalsQuery = useQuery(
    ["decimals", address],
    () =>
      (
        new Contract(address!, ERC20Interface, provider) as unknown as ERC20
      ).decimals(),
    {
      enabled: !!account && !!erc20,
      refetchInterval: 30 * 1000,
    }
  );

  const balanceQuery = useQuery(
    ["balance", address],
    () =>
      (
        new Contract(address!, ERC20Interface, provider) as unknown as ERC20
      ).balanceOf(account!),
    {
      enabled: !!account && !!erc20,
      refetchInterval: 30 * 1000,
    }
  );

  useEffect(() => {
    if (
      balanceQuery.status === "success" &&
      decimalsQuery.status === "success"
    ) {
      setBalance({
        value: balanceQuery.data,
        decimals: decimalsQuery.data,
      });
    }
  }, [
    balanceQuery.data,
    balanceQuery.status,
    decimalsQuery.data,
    decimalsQuery.status,
    setBalance,
  ]);

  return balance;
};

export const useDexBalance = (ticker?: string) => {
  const [balance, setBalance] = useState({
    value: BigNumber.from(0),
  });

  const { account } = useEthers();

  const dex = useDex({ readOnly: true });

  const balanceQuery = useQuery(
    ["balance", "dex", account],
    () => dex.balances(account!, ticker!),
    {
      enabled: !!account && !!ticker,
      refetchInterval: 30 * 1000,
    }
  );

  useEffect(() => {
    if (balanceQuery.status === "success") {
      setBalance({
        value: balanceQuery.data,
      });
    }
  }, [balanceQuery.data, balanceQuery.status, setBalance]);

  return balance;
};

enum Side {
  BUY,
  SELL,
}

export const useOrderbook = (ticker?: string) => {
  const dex = useDex({ readOnly: true });

  const buyOrders = useQuery(
    ["orderbook", "buy"],
    () => dex.getOrderBook(formatBytes32String(ticker!), Side.BUY),
    { enabled: !!ticker }
  );
  const sellOrders = useQuery(
    ["orderbook", "sell"],
    () => dex.getOrderBook(formatBytes32String(ticker!), Side.SELL),
    { enabled: !!ticker }
  );

  return { buyOrders, sellOrders };
};
