import { Dex } from "../typechain";

export const fillOrderbook = async (
  orderAmount: number,
  side: "BUY" | "SELL" | "BOTH",
  dex: Dex,
  tokenTicker: string
) => {
  for (let index = 0; index < orderAmount; index++) {
    const price = Math.floor(Math.random() * 10) + 1;
    const orderSide =
      side === "BUY" ? 0 : side === "SELL" ? 1 : index % 2 === 0 ? 0 : 1;

    await dex.createLimitOrder(orderSide, tokenTicker, 1, price);
  }
};
