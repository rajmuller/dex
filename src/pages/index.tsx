import {
  Link as ChakraLink,
  Text,
  Code,
  List,
  ListIcon,
  ListItem,
  Flex,
} from "@chakra-ui/react";
import { CheckCircleIcon, LinkIcon } from "@chakra-ui/icons";

import { DarkModeSwitch } from "../components/DarkModeSwitch";

const Index = () => (
  <Flex h="100vh">
    <Text>
      Example repository of <Code>Next.js</Code> + <Code>chakra-ui</Code> +{" "}
      <Code>TypeScript</Code>.
    </Text>

    <List spacing={3} my={0}>
      <ListItem>
        <ListIcon as={CheckCircleIcon} color="green.500" />
        <ChakraLink isExternal href="https://chakra-ui.com" flexGrow={1} mr={2}>
          Chakra UI <LinkIcon />
        </ChakraLink>
      </ListItem>
      <ListItem>
        <ListIcon as={CheckCircleIcon} color="green.500" />
        <ChakraLink isExternal href="https://nextjs.org" flexGrow={1} mr={2}>
          Next.js <LinkIcon />
        </ChakraLink>
      </ListItem>
    </List>

    <DarkModeSwitch />
  </Flex>
);

export default Index;
