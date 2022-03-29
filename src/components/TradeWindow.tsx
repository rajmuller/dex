import { Flex, Text, Button, Input } from "@chakra-ui/react";
import { useEtherBalance, useEthers } from "@usedapp/core";
import { formatEther } from "ethers/lib/utils";
import { useState } from "react";

import { useTokenBalance } from "../lib/hooks";

type TradeWindowProps = {
  ticker?: string;
  address?: string;
};

const TradeWindow = ({ ticker, address }: TradeWindowProps) => {
  const [isLimit, setIsLimit] = useState(true);

  const { account } = useEthers();
  const balance = useEtherBalance(account);
  const { value, decimals } = useTokenBalance(address);

  console.log({ value });
  console.log({ decimals });

  return (
    <Flex flex={2} borderRadius="lg" bg="gray.800" direction="column" p={4}>
      <Flex gap={4} pb={4} borderBottomColor="gray.700" borderBottomWidth={2}>
        <Button
          onClick={() => setIsLimit(true)}
          fontSize="2xl"
          w="full"
          h={16}
          borderColor={isLimit ? "pink.500" : "gray.500"}
          borderWidth={1}
          _hover={{
            borderColor: "pink.500",
            borderWidth: "2px",
          }}
          _active={{
            backgroundColor: "gray.900",
            outline: "none",
          }}
          _focus={{
            outline: "none",
          }}
          variant="ghost"
        >
          Limit
        </Button>
        <Button
          onClick={() => setIsLimit(false)}
          fontSize="2xl"
          w="full"
          h={16}
          borderColor={!isLimit ? "pink.500" : "gray.500"}
          borderWidth={1}
          _hover={{
            borderColor: "pink.500",
            borderWidth: "2px",
          }}
          _active={{
            backgroundColor: "gray.900",
            outline: "none",
          }}
          _focus={{
            outline: "none",
          }}
          variant="ghost"
        >
          Market
        </Button>
      </Flex>
      <Flex align="center" justify="space-between" mb={16}>
        <Flex align="center" gap={4}>
          <Text>MATIC: </Text>
          {!balance ? 0 : formatEther(balance).slice(0, 4)}
        </Flex>
        <Flex align="center" gap={4}>
          <Text>{ticker}:</Text>
          {formatEther(value)}
        </Flex>
      </Flex>

      <Flex direction="column" gap={12}>
        <Flex gap={4}>
          <Input flex={2} />
          <Button flex={1} textTransform="uppercase" colorScheme="green">
            {isLimit ? "Place Buy" : "Buy"}
          </Button>
        </Flex>

        <Flex gap={4}>
          <Input flex={2} />
          <Button flex={1} textTransform="uppercase" colorScheme="red">
            {isLimit ? "Place Sell" : "Sell"}
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default TradeWindow;
