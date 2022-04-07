import { ChevronDownIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  chakra,
  Flex,
  FormLabel,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
} from "@chakra-ui/react";
import { BigNumber } from "ethers";
import {
  formatBytes32String,
  formatEther,
  parseBytes32String,
  parseEther,
} from "ethers/lib/utils";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import {
  Side,
  useDexBalance,
  useLimitOrder,
  useMarketOrder,
} from "../lib/hooks";

type TradeWindowProps = {
  ticker?: string;
  side: Side;
  setSide: Dispatch<SetStateAction<Side>>;
};

type TradeMethodProps = {
  side: Side;
  setSide: Dispatch<SetStateAction<Side>>;
};

const TradeMethod = ({ side, setSide }: TradeMethodProps) => {
  return (
    <Flex>
      <Button
        onClick={() => setSide(Side.BUY)}
        fontSize="md"
        fontWeight="semibold"
        color={side === Side.BUY ? "green.500" : "gray.300"}
        w="full"
        h={12}
        borderRadius="none"
        borderColor={side === Side.BUY ? "green.500" : "transparent"}
        borderBottomWidth={2}
        _hover={{
          color: side === Side.BUY ? "green.500" : "gray.100",
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
        onClick={() => setSide(Side.SELL)}
        fontSize="md"
        fontWeight="semibold"
        color={side === Side.BUY ? "gray.300" : "red.500"}
        w="full"
        h={12}
        borderRadius="none"
        borderColor={side === Side.SELL ? "red.500" : "transparent"}
        borderBottomWidth={2}
        _hover={{
          color: side === Side.SELL ? "red.500" : "gray.100",
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
  nativeBalance?: BigNumber;
  ticker?: string;
  tokenBalance?: BigNumber;
};

const Balances = ({ nativeBalance, ticker, tokenBalance }: BalanceProps) => {
  return (
    <>
      <Text mt={4} color="gray.400" w="full" textAlign="center">
        Wallet Balances
      </Text>
      <Flex
        color="gray.400"
        p={4}
        pt={2}
        align="center"
        justify="space-between"
      >
        <Flex align="center" gap={4}>
          <Text>MATIC: </Text>
          {nativeBalance && formatEther(nativeBalance)}
        </Flex>
        <Flex align="center" gap={4}>
          <Text>{ticker && parseBytes32String(ticker)}: </Text>
          {tokenBalance && formatEther(tokenBalance)}
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

const TradeWindow = ({ ticker, side, setSide }: TradeWindowProps) => {
  const [price, setPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");

  const { data: nativBalance } = useDexBalance(formatBytes32String("MATIC"));
  const { data: tokenBalance } = useDexBalance(ticker);

  const { createLimitOrder, status: limitOrderStatus } = useLimitOrder(
    ticker,
    parseEther(amount || "0"),
    parseEther(price || "0"),
    side
  );
  const { createMarketOrder, status: marketOrderStatus } = useMarketOrder(
    ticker,
    parseEther(amount || "0"),
    side
  );

  const handleMarketOrderTypeChange = useCallback(() => {
    setPrice("");
    setOrderType("market");
  }, []);

  const onClick = useCallback(() => {
    if (orderType === "limit") {
      createLimitOrder();
      return;
    }

    createMarketOrder();
  }, [createLimitOrder, createMarketOrder, orderType]);

  return (
    <Flex borderRadius="lg" bg="gray.800" direction="column">
      <TradeMethod side={side} setSide={setSide} />
      <Balances
        nativeBalance={nativBalance}
        ticker={ticker}
        tokenBalance={tokenBalance}
      />

      <Flex p={4} gap={8} direction="column">
        <Flex gap={8}>
          <Box flex={3}>
            <FormLabel htmlFor="price" m={0} fontSize="xs" color="gray.400">
              Price
            </FormLabel>
            <Input
              id="price"
              min={0}
              value={orderType === "limit" ? price : "MARKET"}
              onChange={(e) => setPrice(e.target.value)}
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
              <MenuList borderWidth={0} backgroundColor="gray.800">
                <MenuItem
                  _hover={{
                    backgroundColor: "gray.600",
                  }}
                  bg={orderType === "limit" ? "gray.700" : "unset"}
                  onClick={() => setOrderType("limit")}
                >
                  {getOrderTypeText("limit")}
                </MenuItem>
                <MenuItem
                  _hover={{
                    backgroundColor: "gray.600",
                  }}
                  bg={orderType === "market" ? "gray.700" : "unset"}
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
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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

      <Button
        disabled={
          limitOrderStatus === "loading" || marketOrderStatus === "loading"
        }
        m={4}
        onClick={onClick}
        colorScheme={side === Side.BUY ? "green" : "red"}
      >
        {orderType === "limit" && "Place "}
        {side === Side.BUY ? "Buy" : "Sell"}
      </Button>
      <chakra.span my={4} color="gray.400" textAlign="center">
        <Text>limit orders to add to OB</Text>
        <Text>market orders to execute trade</Text>
      </chakra.span>
    </Flex>
  );
};

export default TradeWindow;
