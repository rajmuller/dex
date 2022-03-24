import { useCallback, useState } from "react";
import { Flex, Text, Select, Button } from "@chakra-ui/react";
import Head from "next/head";
import { ethers } from "ethers";

import Dex from "../../contract/artifacts/contracts/Dex.sol/Dex.json";
// import Market from "../artifacts/contracts/Market.sol/Market.json";

import { dexAddress } from "../config";

const Home = () => {
  const [tokens, setTokens] = useState([]);
  const [fetchingTokens, setFetchingTokens] = useState(false);

  const loadTokens = async () => {
    const provider = new ethers.providers.JsonRpcProvider(
      "https://matic-mumbai.chainstacklabs.com"
    );
    const dex = new ethers.Contract(dexAddress, Dex.abi, provider);
    const data = await dex.tokenList(5);
    console.log({ data });

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
