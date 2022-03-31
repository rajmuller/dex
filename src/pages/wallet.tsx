import {
  Flex,
  Heading,
  Spinner,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  Button,
} from "@chakra-ui/react";
import { useEtherBalance, useEthers } from "@usedapp/core";
import {
  formatBytes32String,
  formatEther,
  parseBytes32String,
} from "ethers/lib/utils";

import { Container, Logo, Token } from "../components";
import {
  useTickerList,
  useTokenBalance,
  useToken,
  useDexTokenBalance,
} from "../lib/hooks";

type TokenRowProps = {
  ticker: string;
};

const TokenRow = ({ ticker }: TokenRowProps) => {
  const tickerString = parseBytes32String(ticker);
  const { data } = useToken(tickerString);

  const { value } = useTokenBalance(data?.tokenAddress);
  const { value: dexBalance } = useDexTokenBalance(ticker);

  console.log({ value });

  return (
    <Tr>
      <Td>
        <Flex align="center" gap={2}>
          <Logo ticker={tickerString} />
          <Text>{tickerString}</Text>
        </Flex>
      </Td>

      <Td isNumeric>{formatEther(value)}</Td>
      <Td isNumeric>{formatEther(dexBalance)}</Td>
      <Td>
        <Flex gap={4}>
          <Button colorScheme="green" size="sm">
            Deposit
          </Button>
          <Button colorScheme="red" size="sm">
            Withdraw
          </Button>
        </Flex>
      </Td>
    </Tr>
  );
};

const Wallet = () => {
  const { account } = useEthers();
  const nativeBalance = useEtherBalance(account);
  const { value: dexNativeBalance } = useDexTokenBalance(
    formatBytes32String("ETH")
  );
  const { data, status } = useTickerList();

  if (status === "loading" || !nativeBalance) {
    return (
      <Container heading="Deposit & Withdraw">
        <Heading>Loading tokens...</Heading>
        <Spinner size="xl" />
      </Container>
    );
  }

  return (
    <Container heading="Deposit & Withdraw">
      <TableContainer>
        <Table variant="simple">
          <TableCaption>Imperial to metric conversion factors</TableCaption>
          <Thead>
            <Tr>
              <Th>Token</Th>
              <Th>Wallet</Th>
              <Th>Dex</Th>
              <Th>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>
                <Flex align="center" gap={2}>
                  <Logo ticker="MATIC" />
                  <Text>MATIC</Text>
                </Flex>
              </Td>

              <Td isNumeric>{formatEther(nativeBalance)}</Td>
              <Td isNumeric>{formatEther(dexNativeBalance)}</Td>
              <Td>
                <Flex gap={4}>
                  <Button colorScheme="green" size="sm">
                    Deposit
                  </Button>
                  <Button colorScheme="red" size="sm">
                    Withdraw
                  </Button>
                </Flex>
              </Td>
            </Tr>
            {data?.map((ticker) => (
              <TokenRow key={ticker} ticker={ticker} />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Wallet;
