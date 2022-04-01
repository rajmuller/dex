import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useMutation, useQueries, useQuery, useQueryClient } from "react-query";
import { ChainId, useEthers, useConfig, ERC20Interface } from "@usedapp/core";
import { Contract, providers, BigNumber } from "ethers";
import { formatBytes32String, Interface, isAddress } from "ethers/lib/utils";
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import { AddressZero } from "@ethersproject/constants";

import { Dex__factory, ERC20, Dex } from "../../contract/typechain";
import DexJson from "../../contract/artifacts/contracts/Dex.sol/Dex.json";

import { Contracts } from "../config";

const DexInterface = new Interface(DexJson.abi);

// account is not optional
const getSigner = (library: Web3Provider, account: string): JsonRpcSigner => {
  return library.getSigner(account).connectUnchecked();
};

// account is optional
const getProviderOrSigner = (
  library: Web3Provider,
  account?: string
): Web3Provider | JsonRpcSigner => {
  return account ? getSigner(library, account) : library;
};

// account is optional
const getContract = (
  address: string,
  ABI: any,
  library: Web3Provider,
  account?: string
): Contract => {
  if (!isAddress(address) || address === AddressZero) {
    throw Error(`Invalid 'address' parameter '${address}'.`);
  }
  return new Contract(address, ABI, getProviderOrSigner(library, account));
};

// returns null on errors
const useContract = (
  address: string | undefined,
  ABI: any,
  withSignerIfPossible = true
): Contract | null => {
  const { library, account } = useEthers();
  return useMemo(() => {
    if (!address || address === AddressZero || !ABI || !library) {
      return null;
    }
    try {
      return getContract(
        address,
        ABI,
        library as Web3Provider,
        withSignerIfPossible && account ? account : undefined
      );
    } catch (error) {
      console.error("Failed to get contract", error);
      return null;
    }
  }, [address, ABI, library, withSignerIfPossible, account]);
};

export function useChainId() {
  const { chainId } = useEthers();

  switch (chainId) {
    case ChainId.Mumbai:
      return chainId;
    default:
      return ChainId.Mumbai;
  }
}

export function useTokenContract(
  tokenAddress?: string,
  withSignerIfPossible?: boolean
): ERC20 | null {
  return useContract(
    tokenAddress,
    ERC20Interface,
    withSignerIfPossible
  ) as unknown as ERC20;
}

const useDexContract = (withSignerIfPossible?: boolean): Dex => {
  const chainId = useChainId();
  const dex = useContract(
    Contracts[chainId].dex,
    DexInterface,
    withSignerIfPossible
  ) as unknown as Dex;
  return dex;
};

export const useTickerList = () => {
  const dex = useDexContract();
  const { data, status, error } = useQuery(
    "addedTokenTickers",
    () => dex!.getTokenList(),
    {
      refetchInterval: 30 * 1000,
      enabled: !!dex,
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
  const dex = useDexContract();

  const { data, status } = useQuery(
    "addedTokenAddresses",
    () => dex!.getAddressList(),
    {
      refetchInterval: 30 * 1000,
      enabled: !!dex,
    }
  );
  return { data, status };
};

export const useToken = (ticker?: string) => {
  const dex = useDexContract();
  const { data, status, error } = useQuery(
    ["token", ticker],
    () => dex!.tokenMapping(formatBytes32String(ticker!)),
    {
      refetchInterval: 30 * 1000,
      enabled: !!ticker && !!dex,
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

export const useDexTokenBalance = (ticker?: string) => {
  const [balance, setBalance] = useState({
    value: BigNumber.from(0),
  });

  const { account } = useEthers();

  const dex = useDexContract();

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

// const useApprove = (ticker: string, amount: BigNumber) => {
//   const queryClient = useQueryClient();

//   const dex = useDex({ readOnly: false });

//   // When this mutation succeeds, invalidate any queries with the `todos` or `reminders` query key
//   const mutation = useMutation(() => dex., {
//     onSuccess: () => {
//       queryClient.invalidateQueries("todos");
//       queryClient.invalidateQueries("reminders");
//     },
//   });
// };

// const useDeposit = (ticker: string, amount: BigNumber) => {
//   const queryClient = useQueryClient();

//   const dex = useDex({ readOnly: false });

//   // When this mutation succeeds, invalidate any queries with the `todos` or `reminders` query key
//   const mutation = useMutation(() => dex., {
//     onSuccess: () => {
//       queryClient.invalidateQueries("todos");
//       queryClient.invalidateQueries("reminders");
//     },
//   });
// };

enum Side {
  BUY,
  SELL,
}

export const useOrderbook = (ticker?: string) => {
  const dex = useDexContract();

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
