import { CheckCircleIcon, WarningTwoIcon, InfoIcon } from "@chakra-ui/icons";
import { SlideFade, Box, Text, Flex, Spinner } from "@chakra-ui/react";
import { resolveValue, Toaster } from "react-hot-toast";

const ToastNotificatio = () => {
  return (
    <Toaster position="bottom-left">
      {(t: any) => (
        <SlideFade in={t.visible} offsetY="20px">
          <Box
            maxW="sm"
            w="full"
            bg="purple.900"
            shadow="xl"
            rounded="lg"
            pointerEvents="auto"
            ring={1}
            ringColor="blackAlpha.500"
            overflow="hidden"
          >
            <Box p={4}>
              <Flex justify="center" align="center">
                <Flex flexShrink={0}>
                  {(() => {
                    switch (t.type) {
                      case "success":
                        return (
                          <CheckCircleIcon color="green.500" h={6} w={6} />
                        );
                      case "error":
                        return <WarningTwoIcon color="red.500" h={6} w={6} />;
                      case "loading":
                        return (
                          <Spinner
                            thickness="4px"
                            speed="0.69s"
                            color="purple.500"
                            size="xl"
                          />
                        );
                      default:
                        return <InfoIcon color="yellow.500" h={6} w={6} />;
                    }
                  })()}
                </Flex>
                <Box ml={3} w={0} flex={1}>
                  <Text color="white">{resolveValue(t.message, t)}</Text>
                </Box>
              </Flex>
            </Box>
          </Box>
        </SlideFade>
      )}
    </Toaster>
  );
};

export default ToastNotificatio;
