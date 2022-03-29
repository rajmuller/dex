import { Flex, FlexProps, Heading } from "@chakra-ui/react";
import { ReactNode } from "react";

type ContainerProps = FlexProps & {
  heading: string;
  children?: ReactNode;
};

const Container = ({ heading, children, ...props }: ContainerProps) => {
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
      {children}
    </Flex>
  );
};

export default Container;
