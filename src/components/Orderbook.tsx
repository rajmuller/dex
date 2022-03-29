import { Stack, Skeleton, Flex, Text } from "@chakra-ui/react";

import { useOrderbook } from "../lib/hooks";

type OrderbookProps = {
  ticker?: string;
};

const Orderbook = ({ ticker }: OrderbookProps) => {
  const { buyOrders, sellOrders } = useOrderbook(ticker);

  if (buyOrders.status === "success" || sellOrders.status === "loading") {
    return (
      <Flex flex={3} gap={4}>
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

  if (!buyOrders.data?.length && !sellOrders.data?.length) {
    return <Text>No order has been placed yet</Text>;
  }

  return <div>Orderbook</div>;
};

export default Orderbook;
