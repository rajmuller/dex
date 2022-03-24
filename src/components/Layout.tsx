import { Flex } from "@chakra-ui/react";
import { ReactNode } from "react";

import Header from "./Header";

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  return (
    <Flex
      alignItems="center"
      mx="auto"
      justifyContent="flex-start"
      bg="linear-gradient(155deg, rgba(22,1,28,1) 0%, rgba(15,3,19,1) 100%)"
      color="white"
    >
      <Flex
        direction="column"
        alignItems="center"
        w="100%"
        mx="auto"
        justifyContent="flex-start"
      >
        <Header />
        {children}
      </Flex>
    </Flex>
  );
};

export default Layout;
