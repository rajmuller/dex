import { Flex } from "@chakra-ui/react";
import { parseBytes32String } from "ethers/lib/utils";
import { ReactNode } from "react";
import Logo from "./Logo";

type TokenProps = {
  ticker: string;
  children?: ReactNode;
};

const Token = ({ ticker }: TokenProps) => {
  const tickerString = parseBytes32String(ticker);

  return (
    <Flex
      align="center"
      gap={4}
      p={4}
      borderColor="pink.500"
      borderWidth={0.25}
    >
      <Logo ticker={tickerString} />
      {tickerString}
    </Flex>
  );
};

export default Token;
