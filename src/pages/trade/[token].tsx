import { Flex } from "@chakra-ui/react";
import { useRouter } from "next/router";

import { Container, Orderbook, TradeWindow } from "../../components";
import { useToken } from "../../lib/hooks";

const Trade = () => {
  const router = useRouter();

  const { token: tickerString } = router.query;
  const { data } = useToken(tickerString as string | undefined);

  return (
    <Container w="full" heading={`Buy & Sell ${tickerString}`}>
      <Flex justify="center" align="center" gap={6} w="100%">
        <Orderbook ticker={tickerString as string | undefined} />
        <TradeWindow
          address={data?.tokenAddress}
          ticker={tickerString as string | undefined}
        />
      </Flex>
    </Container>
  );
};

export default Trade;
