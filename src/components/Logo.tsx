import { Flex } from "@chakra-ui/react";
import Image from "next/image";
import { useState } from "react";

type LogoProps = {
  ticker: string;
  width?: number;
  height?: number;
};

export const BASE_URL =
  "https://raw.githubusercontent.com/sushiswap/icons/master/token/";

export const UNKNOWN_ICON = BASE_URL + "unknown.png";

const Logo = ({ ticker, width = 6, height = 6 }: LogoProps) => {
  const [fallback, setFallback] = useState("");

  const src = `${BASE_URL}${ticker}.jpg`;

  return (
    <Flex
      position="relative"
      width={width}
      height={height}
      align="center"
      overflow="hidden"
      rounded="full"
    >
      <Image
        onError={() => setFallback(UNKNOWN_ICON)}
        layout="fill"
        alt={`logo of ${ticker}`}
        objectFit="cover"
        src={fallback || src.toLowerCase()}
      />
    </Flex>
  );
};

export default Logo;
