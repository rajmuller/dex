import { Flex } from "@chakra-ui/react";
import { formatBytes32String } from "ethers/lib/utils";
import { useRouter } from "next/router";
import { useState } from "react";
import { Container, Orderbook, TradeWindow } from "../../components";
import { Side } from "../../lib/hooks";

const Trade = () => {
  const router = useRouter();
  const [side, setSide] = useState(Side.BUY);

  const tickerString = router.query.token as string | undefined;
  const ticker = tickerString && formatBytes32String(tickerString);

  return (
    <Container w="full" heading={`Buy & Sell ${tickerString}`}>
      <Flex justify="center" align="flex-start" gap={64} w="100%">
        <Orderbook side={side} ticker={ticker} />
        <TradeWindow setSide={setSide} side={side} ticker={ticker} />
      </Flex>
    </Container>
  );
};

export default Trade;
