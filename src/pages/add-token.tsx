import { Button, Flex, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { useEthers } from "@usedapp/core";
import { ethers } from "ethers";
import { useCallback, useState } from "react";
import { ContractOwners } from "../config";
import { useAddToken, useChainId } from "../lib/hooks";

const useEligibility = async () => {
  const { account } = useEthers();
  const chainId = useChainId();

  if (!account || !chainId) {
    return false;
  }

  return account.toLowerCase() === ContractOwners[chainId].toLowerCase();
};

const AddToken = () => {
  const [form, setForm] = useState({
    ticker: "",
    address: "",
  });
  const ticker = form.ticker && ethers.utils.formatBytes32String(form.ticker);
  const tokenAddress = form.address && ethers.utils.getAddress(form.address);

  const show = useEligibility();
  const addToken = useAddToken(ticker, tokenAddress);

  const onSubmit = useCallback(
    (e: any) => {
      e.preventDefault();

      addToken.mutate();

      setForm({ ticker: "", address: "" });
    },
    [addToken]
  );

  if (!show) {
    return <div>Not Eligible</div>;
  }

  return (
    <Flex justify="center" align="center">
      <Flex justify="center" align="center" direction="column">
        <form onSubmit={onSubmit}>
          Add Token
          <FormControl>
            <FormLabel htmlFor="ticker">Ticker</FormLabel>
            <Input
              onChange={(e) => setForm({ ...form, ticker: e.target.value })}
              value={form.ticker}
              id="ticker"
              type="Ticker"
            />
          </FormControl>
          <FormControl>
            <FormLabel htmlFor="address">Address</FormLabel>
            <Input
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              value={form.address}
              id="address"
              type="Address"
            />
          </FormControl>
          <Button type="submit" variant="outline">
            Add
          </Button>
        </form>
      </Flex>
    </Flex>
  );
};

export default AddToken;
