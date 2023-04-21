import { ethers } from "ethers";
import { ReactComponent as Stock1 } from "../../assets/landing/stock1.svg";
import { ReactComponent as Stock2 } from "../../assets/landing/stock2.svg";
import { ReactComponent as Stock3 } from "../../assets/landing/stock3.svg";
import { ReactComponent as Stock4 } from "../../assets/landing/stock4.svg";
import { ReactComponent as Stock5 } from "../../assets/landing/stock5.svg";
import { ReactComponent as Stock6 } from "../../assets/landing/stock6.svg";
import { ReactComponent as Stock7 } from "../../assets/landing/stock7.svg";

function generateRandomNumber(address: string) {
  const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(address));
  const randomByte = parseInt(hash.slice(2, 4), 16); // get the second byte of the hash
  const randomNumber = (randomByte % 7) + 1;
  return randomNumber;
}

function RoundBanner(props: {
  roundId: string;
}) {

  const stockId = generateRandomNumber(props.roundId);

  return (
    <div>
      {stockId === 1 && <Stock1 className="bg-black h-[140px] w-full object-cover rounded-t"/>}
      {stockId === 2 && <Stock2 className="bg-black h-[140px] w-full object-cover rounded-t"/>}
      {stockId === 3 && <Stock3 className="bg-black h-[140px] w-full object-cover rounded-t"/>}
      {stockId === 4 && <Stock4 className="bg-black h-[140px] w-full object-cover rounded-t"/>}
      {stockId === 5 && <Stock5 className="bg-black h-[140px] w-full object-cover rounded-t"/>}
      {stockId === 6 && <Stock6 className="bg-black h-[140px] w-full object-cover rounded-t"/>}
      {stockId === 7 && <Stock7 className="bg-black h-[140px] w-full object-cover rounded-t"/>}
    </div>
  );
}

export default RoundBanner;