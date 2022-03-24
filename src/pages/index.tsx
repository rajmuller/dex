import { Link as ChakraLink, Flex, Text, Select } from "@chakra-ui/react";
import Head from "next/head";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

const Home = () => {
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
        </Flex>
      </Flex>
    </>
  );
};

export default Home;
