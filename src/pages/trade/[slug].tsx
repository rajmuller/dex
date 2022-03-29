import { Flex, Text, Select, Button, Heading } from "@chakra-ui/react";
import { useEthers } from "@usedapp/core";

import { useAddedTokenTickerList } from "../../lib/hooks";

const Trade = () => {
  const { account } = useEthers();
  const { data, status } = useAddedTokenTickerList();

  return (
    <Flex justify="center" align="center">
      <Flex borderRadius="lg" bg="gray.800" direction="column" p={4}>
        <Heading color="pink.300" alignSelf="center">
          Tradeable Tokens
        </Heading>
        <Flex direction="column">
          <Select defaultValue="ETH" size="lg" on>
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

export default Trade;
