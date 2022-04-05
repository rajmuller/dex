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
  useDisclosure
} from "@chakra-ui/react";
import { useTransactions } from "@usedapp/core";
import {
  formatBytes32String,
  formatEther,
  parseBytes32String,
  parseEther
} from "ethers/lib/utils";
import Link from "next/link";
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState
} from "react";
import { Container, Logo } from "../components";
import {
  ApprovalState,
  useApproval,
  useDeposit,
  useDexBalance,
  useIsNative,
  useNativeBalance,
  useTickerList,
  useTokenAddress,
  useTokenBalance,
  useWithdraw
} from "../lib/hooks";

type ActionButtonsProps = {
  ticker: string;
  setActiveTicker: Dispatch<SetStateAction<string | undefined>>;
  onDepositOpen: () => void;
  onWithdrawOpen: () => void;
};

const ActionButtons = ({
  ticker,
  onDepositOpen,
  onWithdrawOpen,
  setActiveTicker,
}: ActionButtonsProps) => {
  const isNative = useIsNative(ticker);

  const handleDeposit = useCallback(
    (ticker: string) => {
      setActiveTicker(ticker);
      onDepositOpen();
    },
    [onDepositOpen, setActiveTicker]
  );

  const handleWithdraw = useCallback(
    (ticker: string) => {
      setActiveTicker(ticker);
      onWithdrawOpen();
    },
    [onWithdrawOpen, setActiveTicker]
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
      <Button
        onClick={() => handleWithdraw(ticker)}
        colorScheme="red"
        size="sm"
      >
        Withdraw
      </Button>
      {!isNative && (
        <Button colorScheme="blue" size="sm">
          <Link href={`/trade/${parseBytes32String(ticker)}`}>
            <a>Trade</a>
          </Link>
        </Button>
      )}
    </Flex>
  );
};

type ActionModalProps = {
  initialRef: MutableRefObject<null>;
  isOpen: boolean;
  onClose: () => void;
  ticker?: string;
  amount: string;
  setAmount: Dispatch<SetStateAction<string>>;
};

const WithdrawModal = ({
  initialRef,
  isOpen,
  onClose,
  ticker,
  amount,
  setAmount,
}: ActionModalProps) => {
  const { withdraw, status } = useWithdraw(ticker, parseEther(amount || "0"));

  useEffect(() => {
    if (status === "success") {
      onClose();
    }
  }, [onClose, status]);

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
        <ModalHeader>Withdraw {parseBytes32String(ticker)}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <FormControl>
            <FormLabel>Amount</FormLabel>
            <Input
              min={0}
              borderWidth={0}
              borderBottomWidth={1}
              borderRadius="none"
              pl={0}
              ref={initialRef}
              disabled={status === "loading"}
              placeholder="0"
              onChange={(e) => setAmount(e.target.value)}
              value={amount}
              type="number"
              _focus={{
                outline: "none",
              }}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Flex w="full" direction="column">
            <Button
              onClick={withdraw}
              disabled={status === "loading"}
              colorScheme="purple"
              w="full"
            >
              {status === "loading"
                ? `Withdrawing ${parseBytes32String(ticker)}...`
                : "Withdraw"}
            </Button>
            <Text mt={4} fontSize="xs">
              * Withdraw to your Wallet
            </Text>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

type DepositButtonProps = {
  approvalState: ApprovalState;
  ticker: string;
  approve: () => void;
  deposit: () => void;
  depositStatus: "error" | "idle" | "loading" | "success";
};

const DepositButton = ({
  approvalState,
  approve,
  deposit,
  depositStatus,
  ticker,
}: DepositButtonProps) => {
  const tickerString = parseBytes32String(ticker);

  if (depositStatus === "loading") {
    return (
      <Button disabled colorScheme="purple" w="full">
        Depositing {tickerString}...
      </Button>
    );
  }

  switch (approvalState) {
    case ApprovalState.PENDING:
      return (
        <Button disabled colorScheme="purple" w="full">
          Approving {tickerString}...
        </Button>
      );
    case ApprovalState.NOT_APPROVED:
      return (
        <Button onClick={approve} colorScheme="purple" w="full">
          Approve {tickerString}
        </Button>
      );

    case ApprovalState.APPROVED:
      return (
        <Button onClick={deposit} colorScheme="purple" w="full">
          Deposit
        </Button>
      );

    default:
      return (
        <Button onClick={deposit} colorScheme="purple" w="full">
          Deposit
        </Button>
      );
  }
};

const DepositModal = ({
  initialRef,
  isOpen,
  onClose,
  ticker,
  amount,
  setAmount,
}: ActionModalProps) => {
  const tokenAddress = useTokenAddress(ticker);
  const { approvalState, approve } = useApproval(
    ticker,
    tokenAddress,
    parseEther(amount || "0")
  );
  const { deposit, status: depositStatus } = useDeposit(
    ticker,
    parseEther(amount || "0")
  );

  useEffect(() => {
    if (depositStatus === "success") {
      onClose();
    }
  }, [depositStatus, onClose]);

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
              min={0}
              borderWidth={0}
              borderBottomWidth={1}
              borderRadius="none"
              pl={0}
              ref={initialRef}
              disabled={
                approvalState === ApprovalState.PENDING ||
                depositStatus === "loading"
              }
              placeholder="0"
              onChange={(e) => setAmount(e.target.value)}
              value={amount}
              type="number"
              _focus={{
                outline: "none",
              }}
            />
          </FormControl>
        </ModalBody>

        <ModalFooter>
          <Flex w="full" direction="column">
            <DepositButton
              approvalState={approvalState}
              approve={approve}
              deposit={deposit}
              depositStatus={depositStatus}
              ticker={ticker}
            />
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

type TokenRowProps = ActionButtonsProps & {
  ticker: string;
};

const TokenRow = ({
  ticker,
  onDepositOpen,
  onWithdrawOpen,
  setActiveTicker,
}: TokenRowProps) => {
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
          onDepositOpen={onDepositOpen}
          onWithdrawOpen={onWithdrawOpen}
          setActiveTicker={setActiveTicker}
          ticker={ticker}
        />
      </Td>
    </Tr>
  );
};

const Home = () => {
  const initialRef = useRef(null);
  const [activeTicker, setActiveTicker] = useState<string>();
  const [amount, setAmount] = useState("");
  const {
    isOpen: isDepositOpen,
    onOpen: onDepositOpen,
    onClose: closeDepositModal,
  } = useDisclosure();
  const {
    isOpen: isWithdrawOpen,
    onOpen: onWithdrawOpen,
    onClose: closeWithdrawModal,
  } = useDisclosure();
  const { data: tickerList, status } = useTickerList();
  const { transactions } = useTransactions();
  console.log({ transactions });

  const onClose = useCallback(() => {
    setActiveTicker(undefined);
    setAmount("");
    closeDepositModal();
    closeWithdrawModal();
  }, [closeDepositModal, closeWithdrawModal]);

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
                onDepositOpen={onDepositOpen}
                onWithdrawOpen={onWithdrawOpen}
                setActiveTicker={setActiveTicker}
              />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
      <DepositModal
        isOpen={isDepositOpen}
        ticker={activeTicker}
        onClose={onClose}
        initialRef={initialRef}
        amount={amount}
        setAmount={setAmount}
      />
      <WithdrawModal
        isOpen={isWithdrawOpen}
        ticker={activeTicker}
        onClose={onClose}
        initialRef={initialRef}
        amount={amount}
        setAmount={setAmount}
      />
    </Container>
  );
};

export default Home;
