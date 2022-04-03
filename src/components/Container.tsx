import { Button, Flex, FlexProps, Heading } from "@chakra-ui/react";
import { useEthers } from "@usedapp/core";
import { ReactNode } from "react";

type ContainerProps = FlexProps & {
  heading: string;
  children?: ReactNode;
};

const Container = ({ heading, children, ...props }: ContainerProps) => {
  const { account, activateBrowserWallet } = useEthers();

  return (
    <Flex
      justifySelf="start"
      direction="column"
      pt={12}
      px={32}
      align="center"
      {...props}
    >
      <Heading color="pink.300" mb={32} alignSelf="center">
        {heading}
      </Heading>
      {account ? (
        children
      ) : (
        <Button
          variant="outline"
          colorScheme="purple"
          size="lg"
          onClick={() => activateBrowserWallet()}
        >
          Connect Wallet
        </Button>
      )}
    </Flex>
  );
};

export default Container;
