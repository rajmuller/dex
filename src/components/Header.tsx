import { useCallback, useEffect, useState } from "react";
import {
  Button,
  chakra,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import Image from "next/image";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

const Overlay = ({ show }: { show: boolean }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    if (show) {
      onOpen();
    } else if (!show) {
      onClose();
    }
  }, [show, onOpen, onClose]);

  return (
    <Modal closeOnOverlayClick={false} isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent color="white" bg="gray.800">
        <ModalHeader>Wrong Network</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <chakra.a
            color="blue.500"
            _hover={{ textDecoration: "underline" }}
            href="https://docs.polygon.technology/docs/develop/network-details/network"
            target="_blank"
            rel="noreferrer"
          >
            Please switch to Mumbai-Testnet!
          </chakra.a>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const Header = () => {
  const [web3Modal, setWeb3Modal] = useState<Web3Modal>();
  const [fetching, setFetching] = useState(false);
  const [assets, setAssets] = useState([]);
  const [connected, setConnected] = useState(false);
  const [addressValue, setAddressValue] = useState("");
  const [isMumbai, setIsMumbai] = useState(true);

  const resetApp = useCallback(() => {
    setWeb3Modal(undefined);
    setConnected(false);
    setAddressValue("");
    setIsMumbai(true);
    web3Modal?.clearCachedProvider();
  }, [web3Modal]);

  const subscribeProvider = useCallback(
    async (provider: any) => {
      if (!provider.on) {
        return;
      }

      provider.on("accountsChanged", (accounts: string[]) => {
        if (!accounts.length) {
          resetApp();
        }

        setAddressValue(accounts[0]);
      });

      provider.on("disconnect", () => {
        console.log("disconnect");
      });

      provider.on("chainChanged", (chainId: string) => {
        console.log({ chainId });

        // const isMumbai = chainId === "0x13881"; // real mumbai
        const isMumbai = chainId === "0x539"; // localhost
        setIsMumbai(isMumbai);
      });

      provider.on("connect", (info: { chainId: number }) => {
        console.log(info);
      });

      provider.on("disconnect", (error: { code: number; message: string }) => {
        console.log("Disconnect");
        resetApp();
        console.log(error);
      });
    },
    [resetApp]
  );

  const onConnect = useCallback(async () => {
    if (!web3Modal) {
      return;
    }

    try {
      const instance = await web3Modal.connect();
      setConnected(true);
      subscribeProvider(instance);

      const provider = new ethers.providers.Web3Provider(instance);

      const network = await provider.getNetwork();

      console.log("nchain: ", network.chainId);
      console.log("name: ", network.name);

      // const isMumbai = network.chainId === 80001; // real mumbai
      const isMumbai = network.chainId === 1337; // localhost

      setIsMumbai(isMumbai);

      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setAddressValue(address);
    } catch (error) {
      setConnected(false);
      console.error(error);
    }
  }, [subscribeProvider, web3Modal]);

  useEffect(() => {
    const web3Modal = new Web3Modal({
      cacheProvider: true, // optional
      theme: "dark",
    });

    setWeb3Modal(web3Modal);
  }, []);

  useEffect(() => {
    if (web3Modal?.cachedProvider) {
      onConnect();
    }
  }, [onConnect, web3Modal]);

  return (
    <>
      <Flex
        w="100%"
        h={16}
        justify="space-between"
        align="center"
        px={[4, 4, 12, 32]}
      >
        <Flex h="100%" w={[16, 24]} position="relative">
          <Image layout="fill" alt="logo" objectFit="contain" src="/logo.png" />
        </Flex>
        <Flex align="center" gap={4}>
          {connected ? (
            <Text>
              {addressValue.slice(0, 5)}...{addressValue.slice(-4)}
            </Text>
          ) : (
            <Button
              variant="outline"
              colorScheme="purple"
              onClick={() => onConnect()}
            >
              Connect Wallet
            </Button>
          )}
        </Flex>
      </Flex>
      <Flex w="100vw" h={0.25} bg="rgba(255,255,255,0.1)"></Flex>
      <Overlay show={!isMumbai} />
    </>
  );
};

export default Header;
