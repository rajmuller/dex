import { Button, Flex, FormControl, FormLabel, Input } from "@chakra-ui/react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

import Dex from "../../contract/artifacts/contracts/Dex.sol/Dex.json";

import { dexAddress, dexOwner } from "../config";

const AddToken = () => {
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    ticker: "",
    address: "",
  });

  const checkEligibility = async () => {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const address = await signer.getAddress();

    const eligibleAccess = address.toLowerCase() === dexOwner.toLowerCase();

    setShow(eligibleAccess);
  };

  useEffect(() => {
    checkEligibility();
  }, []);

  const onSubmit = async (e: any) => {
    e.preventDefault();
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const dex = new ethers.Contract(dexAddress, Dex.abi, signer);

    const ticker = ethers.utils.formatBytes32String(form.ticker);
    const address = ethers.utils.getAddress(form.address);

    await dex.addToken(ticker, address);

    setForm({ ticker: "", address: "" });
  };

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
