import { Flex } from "@chakra-ui/react";
import { parseBytes32String } from "ethers/lib/utils";
import { ReactNode } from "react";
import Link from "next/link";

import Logo from "./Logo";

type TokenProps = {
  ticker: string;
  children?: ReactNode;
};

const Token = ({ ticker }: TokenProps) => {
  const tickerString = parseBytes32String(ticker);

  return (
    <Link href={`/trade/${tickerString}`}>
      <a>
        <Flex
          align="center"
          gap={4}
          px={8}
          py={4}
          borderColor="pink.500"
          borderWidth={0.25}
        >
          <Logo ticker={tickerString} />
          {tickerString}
        </Flex>
      </a>
    </Link>
  );
};

export default Token;
