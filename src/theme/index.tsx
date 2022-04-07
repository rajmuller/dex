import { extendTheme } from "@chakra-ui/react";
import { createBreakpoints } from "@chakra-ui/theme-tools";
import "@fontsource/m-plus-1";

const fonts = {
  body: `'M PLUS 1', sans-serif`,
  heading: `'M PLUS 1', sans-serif`,
};

const breakpoints = createBreakpoints({
  sm: "40em", //  640px
  md: "52em", //  832px
  lg: "64em", // 1024px
  xl: "80em", // 1280px
});

const theme = extendTheme({
  colors: {
    black: "#16161D",
  },
  fonts,
  breakpoints,
});

export default theme;
