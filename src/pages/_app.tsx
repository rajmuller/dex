import { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";

import theme from "../theme";
import { Layout } from "../components";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider resetCSS theme={theme}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ChakraProvider>
  );
}

export default MyApp;
