import { Flex, Text, Select, Button } from "@chakra-ui/react";
import { useEthers } from "@usedapp/core";

import { useTokenBalances } from "../lib/hooks";

const Home = () => {
  const { account } = useEthers();
  const { balance } = useTokenBalances();
  console.log({ balance });

  return (
    <Flex justify="center" align="center">
      <Flex borderRadius="lg" bg="gray.800" direction="column" p={4}>
        <Text>Swap</Text>
        <Flex direction="column">
          <Select defaultValue="ETH" size="lg">
            <option value="ETH">ETH</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </Select>
        </Flex>
        <Button>Load Tokens</Button>
        <div>{account && <p>Account: {account}</p>}</div>
      </Flex>
    </Flex>
  );
};

export default Home;
