import { Flex, Text } from "@chakra-ui/react";
import Image from "next/image";
import { DarkModeSwitch } from "./DarkModeSwitch";

const Header = () => {
  return (
    <Flex
      borderBottom="rgba(255,255,255,0.1) 1px solid"
      w="100%"
      h={16}
      justify="space-between"
      align="center"
    >
      <Flex h="100%" w={[16, 24]} position="relative">
        <Image layout="fill" alt="logo" objectFit="contain" src="/logo.png" />
      </Flex>
      <Flex align="center" gap={4}>
        <Text>Link1</Text>
        <Text>Link2</Text>
        <Text>Link3</Text>
        <DarkModeSwitch />
      </Flex>
    </Flex>
  );
};

export default Header;
