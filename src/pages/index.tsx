import { useEffect, useState } from "react";
import { Flex, Text, Select, Button } from "@chakra-ui/react";
import Head from "next/head";
import { ethers } from "ethers";
import Web3Modal from "web3modal";

import { Dex__factory } from "../../contract/typechain/factories/Dex__factory";

import { dexAddress } from "../config";

const Home = () => {
  const [tokens, setTokens] = useState([]);
  const [fetchingTokens, setFetchingTokens] = useState(false);
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>();

  useEffect(() => {
    const web3Modal = new Web3Modal({
      cacheProvider: true, // optional
      theme: "dark",
    });

    setWeb3Modal(web3Modal);
  }, []);

  const loadTokens = async () => {
    if (!web3Modal) {
      return;
    }
    const instance = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(instance);
    const dex = Dex__factory.connect(dexAddress, provider);
    const data = await dex.getTokenList();
    const tickers = data.map((ticker) =>
      ethers.utils.parseBytes32String(ticker)
    );

    // const linkTicker = ethers.utils.formatBytes32String("LINKK");
    console.log({ tickers });

    /*
     *  map over items returned from smart contract and format
     *  them as well as fetch their token metadata
     */
    // const items = await Promise.all(
    //   data.map(async (i) => {
    //     const tokenUri = await tokenContract.tokenURI(i.tokenId);
    //     const meta = await axios.get(tokenUri);
    //     let price = ethers.utils.formatUnits(i.price.toString(), "ether");
    //     let item = {
    //       price,
    //       tokenId: i.tokenId.toNumber(),
    //       seller: i.seller,
    //       owner: i.owner,
    //       image: meta.data.image,
    //       name: meta.data.name,
    //       description: meta.data.description,
    //     };
    //     return item;
    //   })
    // );
    // setNfts(items);
    // setLoadingState("loaded");
  };

  return (
    <>
      <Head>
        <title>Swap | Carrot</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="Dex Project" />
        <meta name="keywords" content="Swap, Dex, Rein, Carrot" />
        <meta name="author" content="Rein"></meta>
      </Head>

      <Flex h="100vh" justify="center" align="center">
        <Flex borderRadius="lg" bg="gray.800" direction="column" p={4}>
          <Text>Swap</Text>
          <Flex direction="column">
            <Select defaultValue="ETH" size="lg">
              <option value="ETH">ETH</option>
              <option value="option2">Option 2</option>
              <option value="option3">Option 3</option>
            </Select>
          </Flex>
          <Button onClick={loadTokens}>Load Tokens</Button>
        </Flex>
      </Flex>
    </>
  );
};

export default Home;
