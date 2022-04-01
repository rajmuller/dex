import { Flex, Heading, Spinner } from "@chakra-ui/react";
import { useEthers } from "@usedapp/core";

import { Container, Token } from "../components";
import { useTickerList } from "../lib/hooks";

const Home = () => {
  const { account } = useEthers();
  const { data, status } = useTickerList();

  if (status === "loading") {
    return (
      <Container heading="Tradeable Tokens">
        <Heading>Loading tokens...</Heading>
        <Spinner size="xl" />
      </Container>
    );
  }

  return (
    <Container heading="Tradeable Tokens">
      <Flex gap={8}>
        {data?.map((ticker) => (
          <Token key={ticker} ticker={ticker} />
        ))}
      </Flex>
      <div>{account && <p>Account: {account}</p>}</div>
    </Container>
  );
};

export default Home;
