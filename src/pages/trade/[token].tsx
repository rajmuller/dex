import { Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";

import { Container, Orderbook, TradeWindow } from "../../components";
import { useToken } from "../../lib/hooks";

const Trade = () => {
  const router = useRouter();
  console.log({ router });

  const tickerString = router.query.token as string | undefined;
  const { data } = useToken(tickerString);

  return (
    <Container w="full" heading={`Buy & Sell ${tickerString}`}>
      <Flex justify="center" align="center" gap={6} w="100%">
        <Orderbook ticker={tickerString} />
        <TradeWindow address={data?.tokenAddress} ticker={tickerString} />
      </Flex>
    </Container>
  );
};

export default Trade;