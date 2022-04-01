import { AddressZero } from "@ethersproject/constants";
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import { ChainId, ERC20Interface, useEthers } from "@usedapp/core";
import { Contract } from "ethers";
import {
  formatBytes32String,
  Interface,
  isAddress,
  parseBytes32String,
} from "ethers/lib/utils";
import { useMemo } from "react";
import { useQuery } from "react-query";
import DexJson from "../../contract/artifacts/contracts/Dex.sol/Dex.json";
import { Dex, ERC20 } from "../../contract/typechain";
import { Contracts, NATIVE_CURRENCY } from "../config";

const DexInterface = new Interface(DexJson.abi);

const getSigner = (library: Web3Provider, account: string): JsonRpcSigner => {
  return library.getSigner(account).connectUnchecked();
};

const getProviderOrSigner = (
  library: Web3Provider,
  account?: string
): Web3Provider | JsonRpcSigner => {
  return account ? getSigner(library, account) : library;
};

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

const useDexContract = (withSignerIfPossible?: boolean): Dex | null => {
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
  const tickerListQuery = useQuery("tickers", () => dex!.getTokenList(), {
    enabled: !!dex,
  });

  return tickerListQuery;
};

export const useAddressList = () => {
  const dex = useDexContract();

  const addressListQuery = useQuery("addresses", () => dex!.getAddressList(), {
    enabled: !!dex,
  });
  return addressListQuery;
};

export const useTokenAddress = (ticker?: string) => {
  const dex = useDexContract();

  const tokenDetails = useQuery(
    ["address", ticker],
    () => dex!.tokenMapping(ticker!),
    {
      enabled: !!ticker && !!dex,
    }
  );

  return tokenDetails.data?.tokenAddress;
};

export const useIsNative = (ticker?: string) => {
  const chainId = useChainId();

  if (!ticker) {
    return null;
  }

  return parseBytes32String(ticker) === NATIVE_CURRENCY[chainId];
};

export const useNativeBalance = () => {
  const { account, library } = useEthers();

  const balanceQuery = useQuery(
    ["balance", "native"],
    () => getSigner(library as Web3Provider, account!).getBalance(),
    {
      enabled: !!account && !!library,
    }
  );

  return balanceQuery;
};

export const useTokenBalance = (address?: string) => {
  const { account } = useEthers();

  const contract = useTokenContract(address);

  const balanceQuery = useQuery(
    ["balance", address],
    () => contract!.balanceOf(account!),
    {
      enabled: !!account && !!contract,
    }
  );

  return balanceQuery;
};

export const useDexBalance = (ticker?: string) => {
  const { account } = useEthers();
  const isNative = useIsNative(ticker);

  const tokenOrNativeTicker = isNative ? formatBytes32String("ETH") : ticker;
  const dex = useDexContract();

  const balanceQuery = useQuery(
    ["balance", "dex", tokenOrNativeTicker],
    () => dex!.balances(account!, tokenOrNativeTicker!),
    {
      enabled: !!account && !!tokenOrNativeTicker && !!dex,
    }
  );

  return balanceQuery;
};

export const useAllowance = (address?: string) => {
  const { account } = useEthers();
  const chainId = useChainId();

  const contract = useTokenContract(address);

  const allowance = useQuery(
    ["allowance", address],
    () => contract!.allowance(account!, Contracts[chainId].dex),
    {
      enabled: !!contract && !!account,
    }
  );

  return allowance;
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

// export const useOrderbook = (ticker?: string) => {
//   const dex = useDexContract();

//   const buyOrders = useQuery(
//     ["orderbook", "buy"],
//     () => dex.getOrderBook(formatBytes32String(ticker!), Side.BUY),
//     { enabled: !!ticker }
//   );
//   const sellOrders = useQuery(
//     ["orderbook", "sell"],
//     () => dex.getOrderBook(formatBytes32String(ticker!), Side.SELL),
//     { enabled: !!ticker }
//   );

//   return { buyOrders, sellOrders };
// };
