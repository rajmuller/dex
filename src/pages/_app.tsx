import { ChakraProvider } from "@chakra-ui/react";
import { ChainId, Config, DAppProvider } from "@usedapp/core";
import { AppProps } from "next/app";
import Head from "next/head";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Layout } from "../components";
import theme from "../theme";

const config: Config = {
  readOnlyChainId: ChainId.Mumbai,
  readOnlyUrls: {
    [ChainId.Mumbai]: process.env.NEXT_PUBLIC_MUMBAI_ENDPOINT as string,
  },
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: 20 * 1000,
    },
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Swap | Carrot</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta name="description" content="Dex Project" />
        <meta name="keywords" content="Swap, Dex, Rein, Carrot" />
        <meta name="author" content="Rein"></meta>
      </Head>

      <ChakraProvider resetCSS theme={theme}>
        <DAppProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
            <ReactQueryDevtools />
          </QueryClientProvider>
        </DAppProvider>
      </ChakraProvider>
    </>
  );
}

export default MyApp;
