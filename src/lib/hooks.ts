import {
  ChainId,
  useEthers,
  useContractFunction,
  useConfig,
  useTokenBalance,
} from "@usedapp/core";
import { utils, Contract, providers } from "ethers";
import { useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useQuery } from "react-query";

import { Dex__factory, ERC20__factory } from "../../contract/typechain";
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
      refetchInterval: 20 * 1000,
    }
  );
  console.log("addressListData: ", data);

  return { data, status };
};

export const useTokenBalances = () => {
  const { account } = useEthers();
  const { readOnlyUrls } = useConfig();
  const chainId = useChainId();

  const { data } = useAddedTokenAddressList();
  const provider = new providers.JsonRpcProvider(readOnlyUrls![chainId]);

  const erc20 = data?.length ? ERC20__factory.connect(data[0], provider) : null;

  const { data: balance, status } = useQuery(
    "tokenBalance",
    () => erc20!.balanceOf(account!),
    {
      enabled: data && erc20 !== null && !!account,
    }
  );
  console.log(balance?.toNumber());

  // useEffect(() => {
  //   console.log({ state });

  //   switch (state.status) {
  //     case "Exception":
  //     case "Fail":
  //       toast.error(`Transaction failed! ${state.errorMessage}`);
  //       return;
  //     case "Success":
  //       toast.success("Successfully acquired token list!");
  //       break;
  //   }
  // }, [state, state.errorMessage, state.status]);

  return { balance };
};
