const rl = require("readline");
const { BigNumber } = require("@ethersproject/bignumber");

const BN = (n: any) => BigNumber.from(n.toString());

export const addr0 = "0x0000000000000000000000000000000000000000";

export const erc20Utils = (decimals: number) => {
  const one = BN("10").pow(BN(decimals));
  const toUnits = (v: any) => BN(v).div(one);
  const toUnitsS = (v: any) => toUnits(BN(v)).toString();
  const fromUnits = (u: any) => BN(u).mul(one);

  return {
    toUnits,
    toUnitsS,
    fromUnits,
  }
}

export const prompt = async (question: string) => {
  // if (hre.network.name === "hardhat") {
  //   return;
  // }

  const r = rl.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  const answer = await new Promise((resolve, error) => {
    r.question(`${question} [y/n]: `, (answer: string) => {
      r.close();
      resolve(answer);
    });
  });

  if (answer !== "y" && answer !== "yes") {
    console.log("exiting...");
    process.exit(1);
  }

  console.log();
};

export const prettyNum = (_n: number) => {
  const n = _n.toString();
  let s = "";
  for (let i = 0; i < n.length; i++) {
    if (i != 0 && i % 3 == 0) {
      s = "_" + s;
    }

    s = n[n.length - 1 - i] + s;
  };

  return s;
}
