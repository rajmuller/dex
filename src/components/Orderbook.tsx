import {
  Flex,
  Skeleton,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { BigNumber } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { Side, useOrderbook } from "../lib/hooks";

type OrderbookProps = {
  ticker?: string;
  side: Side;
};

type OrderProps = {
  side: Side;
  order: [
    BigNumber,
    string,
    number,
    string,
    BigNumber,
    BigNumber,
    BigNumber
  ] & {
    id: BigNumber;
    trader: string;
    side: number;
    ticker: string;
    price: BigNumber;
    amount: BigNumber;
    filled: BigNumber;
  };
};

const Order = ({ order, side }: OrderProps) => {
  return (
    <Tr>
      <Td color={side === Side.BUY ? "green.500" : "red.500"} isNumeric>
        {formatEther(order.price)}
      </Td>
      <Td isNumeric>{formatEther(order.amount.sub(order.filled))}</Td>
    </Tr>
  );
};

const Orderbook = ({ ticker, side }: OrderbookProps) => {
  const oppositeSide = side === Side.BUY ? Side.SELL : Side.BUY;
  console.log({ oppositeSide });

  const { data, status } = useOrderbook(ticker, oppositeSide);

  // console.log({ orders });
  console.log({ data });

  // console.log("sells: ", sells);

  if (status === "loading") {
    return (
      <Flex width="190px" gap={4}>
        <Stack w="100%">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <Skeleton
                key={i}
                rounded="lg"
                opacity={0.5}
                speed={2}
                startColor="pink.800"
                endColor="purple.200"
                height="40px"
              />
            ))}
        </Stack>
        <Stack w="100%">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <Skeleton
                key={i}
                rounded="lg"
                opacity={0.5}
                speed={2}
                startColor="pink.800"
                endColor="purple.200"
                height="40px"
              />
            ))}
        </Stack>
      </Flex>
    );
  }

  return (
    <Flex direction="column">
      <Text width="full" mb={4} textAlign="center" fontWeight="semibold">
        {side === Side.BUY ? "Sell Orders" : "Buy Orders"}
      </Text>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th isNumeric>Price</Th>
              <Th isNumeric>Amount</Th>
            </Tr>
          </Thead>
          <Tbody>
            {data?.map((order) => {
              return (
                <Order
                  side={oppositeSide}
                  order={order}
                  key={order.id.toString()}
                />
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Flex>
  );
};

export default Orderbook;
