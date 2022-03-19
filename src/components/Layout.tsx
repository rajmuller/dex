import { Flex, useColorMode } from "@chakra-ui/react";
import { ReactNode } from "react";

import Header from "./Header";

type LayoutProps = {
  children: ReactNode;
};

const Layout = ({ children }: LayoutProps) => {
  const { colorMode } = useColorMode();

  const bgColor = {
    light: "gray.50",
    dark: "radial-gradient(circle, rgba(96,58,8,1) 0%, rgba(27,16,1,1) 100%)",
  };

  const color = { light: "black", dark: "white" };
  return (
    <Flex
      direction="column"
      alignItems="center"
      maxW="1280px"
      mx="auto"
      justifyContent="flex-start"
      bg={bgColor[colorMode]}
      color={color[colorMode]}
    >
      <Header />
      {children}
    </Flex>
  );
};

export default Layout;
