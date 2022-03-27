import { useCallback, useEffect, useState } from "react";
import {
  Button,
  chakra,
  Flex,
  Text,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import Image from "next/image";
import { useEthers } from "@usedapp/core";

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
  const [activateError, setActivateError] = useState("");
  const { error, activateBrowserWallet, account } = useEthers();
  useEffect(() => {
    if (error) {
      setActivateError(error.message);
    }
  }, [error]);

  const activate = async () => {
    setActivateError("");
    activateBrowserWallet();
  };

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
          {account ? (
            <Text>
              {account.slice(0, 5)}...{account.slice(-4)}
            </Text>
          ) : (
            <Button
              variant="outline"
              colorScheme="purple"
              onClick={() => activate()}
            >
              Connect Wallet
            </Button>
          )}
        </Flex>
      </Flex>
      <Flex w="100vw" h={0.25} bg="rgba(255,255,255,0.1)"></Flex>
    </>
  );
};

export default Header;
