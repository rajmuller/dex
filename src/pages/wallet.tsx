import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from "@chakra-ui/react";
import {
  formatBytes32String,
  formatEther,
  parseBytes32String,
} from "ethers/lib/utils";
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useRef,
  useState,
} from "react";
import { Container, Logo } from "../components";
import {
  useAllowance,
  useDexBalance,
  useIsNative,
  useNativeBalance,
  useTickerList,
  useTokenAddress,
  useTokenBalance,
} from "../lib/hooks";

type ActionButtonsProps = {
  ticker: string;
  setActiveTicker: Dispatch<SetStateAction<string | undefined>>;
  onOpen: () => void;
};

const ActionButtons = ({
  ticker,
  onOpen,
  setActiveTicker,
}: ActionButtonsProps) => {
  const handleDeposit = useCallback(
    (ticker: string) => {
      setActiveTicker(ticker);
      onOpen();
    },
    [onOpen, setActiveTicker]
  );

  return (
    <Flex gap={4}>
      <Button
        onClick={() => handleDeposit(ticker)}
        colorScheme="green"
        size="sm"
      >
        Deposit
      </Button>
      <Button colorScheme="red" size="sm">
        Withdraw
      </Button>
    </Flex>
  );
};

type TokenRowProps = ActionButtonsProps & {
  ticker: string;
};

const TokenRow = ({ ticker, onOpen, setActiveTicker }: TokenRowProps) => {
  const tickerString = parseBytes32String(ticker);
  const tokenAddress = useTokenAddress(ticker);
  const isNative = useIsNative(ticker);

  const { data: nativeBalance } = useNativeBalance();
  const { data: tokenBalance } = useTokenBalance(tokenAddress);
  const { data: dexBalance } = useDexBalance(ticker);

  const balance = isNative ? nativeBalance : tokenBalance;

  return (
    <Tr>
      <Td>
        <Flex align="center" gap={2}>
          <Logo ticker={tickerString} />
          <Text>{tickerString}</Text>
        </Flex>
      </Td>
      <Td isNumeric>
        {balance ? formatEther(balance) : <Spinner size="sm" />}
      </Td>
      <Td isNumeric>
        {dexBalance ? formatEther(dexBalance) : <Spinner size="sm" />}
      </Td>
      <Td>
        <ActionButtons
          onOpen={onOpen}
          setActiveTicker={setActiveTicker}
          ticker={ticker}
        />
      </Td>
    </Tr>
  );
};

type ActionModalProps = {
  initialRef: MutableRefObject<null>;
  isOpen: boolean;
  onClose: () => void;
  ticker?: string;
};

const DepositModal = ({
  initialRef,
  isOpen,
  onClose,
  ticker,
}: ActionModalProps) => {
  const tokenAddress = useTokenAddress(ticker);
  const { data: allowanceData } = useAllowance(tokenAddress);

  console.log({ allowanceData });

  if (!ticker) {
    return null;
  }

  return (
    <Modal
      size="xs"
      initialFocusRef={initialRef}
      isOpen={isOpen}
      onClose={onClose}
    >
      <ModalOverlay />
      <ModalContent backgroundColor="gray.800">
        <ModalHeader>Deposit {parseBytes32String(ticker)}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl>
            <FormLabel>Amount</FormLabel>
            <Input
              borderWidth={0}
              borderBottomWidth={1}
              borderRadius="none"
              pl={0}
              ref={initialRef}
              placeholder="0"
              type="number"
              _focus={{
                outline: "none",
              }}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Flex direction="column">
            <Button colorScheme="purple" w="full">
              Deposit
            </Button>
            <Text mt={4} fontSize="xs">
              * Save MATIC in Wallet for gas & Do not deposit more than in
              Wallet
            </Text>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const Wallet = () => {
  const initialRef = useRef(null);
  const [activeTicker, setActiveTicker] = useState<string>();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data: tickerList, status } = useTickerList();

  if (status === "loading" || !tickerList?.length) {
    return (
      <Container heading="Deposit & Withdraw">
        <Heading>Loading tokens...</Heading>
        <Spinner size="xl" />
      </Container>
    );
  }

  const tickerListWithNative = [formatBytes32String("MATIC"), ...tickerList];

  return (
    <Container heading="Deposit & Withdraw">
      <TableContainer>
        <Table variant="simple">
          <TableCaption>
            * Deposit from Wallet to Trade Account to be able to buy and sell
            tokens
          </TableCaption>
          <Thead>
            <Tr>
              <Th>Token</Th>
              <Th>Wallet</Th>
              <Th>Trade Account</Th>
              <Th isNumeric>Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {tickerListWithNative.map((ticker) => (
              <TokenRow
                key={ticker}
                ticker={ticker}
                onOpen={onOpen}
                setActiveTicker={setActiveTicker}
              />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <DepositModal
        isOpen={isOpen}
        ticker={activeTicker}
        onClose={onClose}
        initialRef={initialRef}
      />
    </Container>
  );
};

export default Wallet;
