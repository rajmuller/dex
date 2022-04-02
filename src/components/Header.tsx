import {
  Button,
  chakra,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { ChainId, useEthers } from "@usedapp/core";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const Overlay = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { chainId } = useEthers();

  useEffect(() => {
    if (chainId !== ChainId.Mumbai) {
      onOpen();
      return;
    }

    onClose();
  }, [onOpen, onClose, chainId]);

  // TODO: switch should be automatic

  return (
    <Modal
      closeOnEsc={false}
      onClose={onClose}
      closeOnOverlayClick={false}
      isOpen={isOpen}
    >
      <ModalOverlay backgroundColor="blackAlpha.800" />
      <ModalContent color="white" bg="gray.800">
        <ModalHeader>Wrong Network !</ModalHeader>
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
      </ModalContent>
    </Modal>
  );
};

const Header = () => {
  const [, setActivateError] = useState("");
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
          <Link href="/">
            <a>
              <Image
                layout="fill"
                alt="logo"
                objectFit="contain"
                src="/logo.png"
              />
            </a>
          </Link>
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
      <Flex w="100%" h={0.25} bg="rgba(255,255,255,0.1)" />
      <Overlay />
    </>
  );
};

export default Header;
