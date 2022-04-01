import {
  Flex,
  Text,
  Button,
  Input,
  FormLabel,
  Box,
  Menu,
  MenuButton,
  MenuDivider,
  MenuGroup,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useEtherBalance, useEthers } from "@usedapp/core";
import { formatEther } from "ethers/lib/utils";
import { useState, Dispatch, SetStateAction, useCallback } from "react";

import { useDexBalance, useTokenBalance } from "../lib/hooks";
import { BigNumber } from "ethers";

type TradeWindowProps = {
  ticker?: string;
  address?: string;
};

type TradeMethodProps = {
  buySelected: boolean;
  setBuySelected: Dispatch<SetStateAction<boolean>>;
};

const TradeMethod = ({ buySelected, setBuySelected }: TradeMethodProps) => {
  return (
    <Flex>
      <Button
        onClick={() => setBuySelected(true)}
        fontSize="md"
        fontWeight="semibold"
        color={buySelected ? "green.500" : "gray.300"}
        w="full"
        h={12}
        borderRadius="none"
        borderColor={buySelected ? "green.500" : "transparent"}
        borderBottomWidth={2}
        _hover={{
          color: buySelected ? "green.500" : "gray.100",
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
        Buy
      </Button>
      <Button
        onClick={() => setBuySelected(false)}
        fontSize="md"
        fontWeight="semibold"
        color={buySelected ? "gray.300" : "red.500"}
        w="full"
        h={12}
        borderRadius="none"
        borderColor={!buySelected ? "red.500" : "transparent"}
        borderBottomWidth={2}
        _hover={{
          color: !buySelected ? "red.500" : "gray.100",
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
        Sell
      </Button>
    </Flex>
  );
};

type BalanceProps = {
  balance?: BigNumber;
  ticker?: string;
  value: BigNumber;
};

const Balances = ({ balance, ticker, value }: BalanceProps) => {
  return (
    <>
      <Text mt={4} w="full" textAlign="center">
        Wallet Balances
      </Text>
      <Flex p={4} pt={2} align="center" justify="space-between">
        <Flex align="center" gap={4}>
          <Text>MATIC: </Text>
          {!balance ? 0 : formatEther(balance).slice(0, 4)}
        </Flex>
        <Flex align="center" gap={4}>
          <Text>{ticker}:</Text>
          {formatEther(value)}
        </Flex>
      </Flex>

      <Text mt={4} w="full" textAlign="center">
        Tradeable Balances
      </Text>
      <Flex p={4} pt={2} align="center" justify="space-between" mb={8}>
        <Flex align="center" gap={4}>
          <Text>MATIC: </Text>
          {!balance ? 0 : formatEther(balance).slice(0, 4)}
        </Flex>
        <Flex align="center" gap={4}>
          <Text>{ticker}:</Text>
          {formatEther(value)}
        </Flex>
      </Flex>
    </>
  );
};

type OrderType = "limit" | "market";

const getOrderTypeText = (type: OrderType) => {
  switch (type) {
    case "limit":
      return "Limit order";

    case "market":
      return "Market order";

    default:
      return "Limit Order";
  }
};

const TradeWindow = ({ ticker, address }: TradeWindowProps) => {
  const [isBuy, setIsBuy] = useState(true);
  const [price, setPrice] = useState<number | undefined>();
  const [amount, setAmount] = useState(0);
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const { account } = useEthers();

  const userBalance = useEtherBalance(account);
  const { value: userTokenBalance } = useTokenBalance(address);
  const { value: dexBalance } = useDexBalance(ticker);

  console.log(dexBalance.toNumber());

  const handleMarketOrderTypeChange = useCallback(() => {
    setPrice(undefined);
    setOrderType("market");
  }, []);

  return (
    <Flex flex={2} borderRadius="lg" bg="gray.800" direction="column">
      <TradeMethod buySelected={isBuy} setBuySelected={setIsBuy} />
      <Balances
        balance={userBalance}
        ticker={ticker}
        value={userTokenBalance}
      />

      <Flex p={4} gap={8} direction="column">
        <Flex gap={8}>
          <Box flex={3}>
            <FormLabel htmlFor="price" m={0} fontSize="xs" color="gray.400">
              Price
            </FormLabel>
            <Input
              id="price"
              value={orderType === "limit" ? price : "MARKET"}
              onChange={(e) => setPrice(parseInt(e.target.value))}
              placeholder={orderType === "limit" ? "0" : "MARKET"}
              pl={0}
              disabled={orderType !== "limit"}
              required={orderType === "limit"}
              borderRadius="none"
              type="number"
              borderWidth={0}
              borderBottomWidth={1}
              borderBottomColor="gray.700"
              _hover={{
                borderBottomWidth: 2,
                borderBottomColor: "gray.600",
              }}
              _focus={{
                outline: "none",
                borderBottomWidth: 2,
                borderBottomColor: "gray.600",
              }}
            />
          </Box>
          <Box>
            <Text fontSize="xs" color="gray.400">
              Order type
            </Text>
            <Menu offset={[0, -42]}>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                bg="transparent"
                colorScheme="gray"
                borderBottomColor="gray.700"
                borderBottomWidth={1}
                rounded="none"
                px={0}
                fontWeight="normal"
                _hover={{
                  backgroundColor: "unset",
                  borderBottomWidth: 2,
                  borderBottomColor: "gray.600",
                }}
              >
                {getOrderTypeText(orderType)}
              </MenuButton>
              <MenuList>
                <MenuItem
                  bg={orderType === "limit" ? "gray.600" : "unset"}
                  onClick={() => setOrderType("limit")}
                >
                  {getOrderTypeText("limit")}
                </MenuItem>
                <MenuItem
                  bg={orderType === "market" ? "gray.600" : "unset"}
                  onClick={handleMarketOrderTypeChange}
                >
                  {getOrderTypeText("market")}
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
        </Flex>

        <Flex gap={8}>
          <Box flex={3}>
            <FormLabel htmlFor="amount" m={0} fontSize="xs" color="gray.400">
              Amount
            </FormLabel>
            <Input
              id="amount"
              value={amount}
              onChange={(e) => setAmount(parseInt(e.target.value))}
              placeholder="0"
              pl={0}
              required
              borderRadius="none"
              type="number"
              borderWidth={0}
              borderBottomWidth={1}
              borderBottomColor="gray.700"
              _hover={{
                borderBottomWidth: 2,
                borderBottomColor: "gray.600",
              }}
              _focus={{
                outline: "none",
                borderBottomWidth: 2,
                borderBottomColor: "gray.600",
              }}
            />
          </Box>
        </Flex>
      </Flex>

      <Button m={4} mb={8} colorScheme={isBuy ? "green" : "red"}>
        {isBuy ? "Buy" : "Sell"}
      </Button>
    </Flex>
  );
};

export default TradeWindow;
