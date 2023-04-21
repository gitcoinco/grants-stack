import { ethers } from "ethers";
import { ReactComponent as Stock1 } from "../../assets/landing/stock1.svg";
import { ReactComponent as Stock2 } from "../../assets/landing/stock2.svg";
import { ReactComponent as Stock3 } from "../../assets/landing/stock3.svg";
import { ReactComponent as Stock4 } from "../../assets/landing/stock4.svg";
import { ReactComponent as Stock5 } from "../../assets/landing/stock5.svg";
import { ReactComponent as Stock6 } from "../../assets/landing/stock6.svg";
import {
  ReactComponent as Stock10,
  ReactComponent as Stock11,
  ReactComponent as Stock12,
  ReactComponent as Stock13,
  ReactComponent as Stock14,
  ReactComponent as Stock15,
  ReactComponent as Stock16,
  ReactComponent as Stock17,
  ReactComponent as Stock18,
  ReactComponent as Stock19,
  ReactComponent as Stock20,
  ReactComponent as Stock21,
  ReactComponent as Stock22,
  ReactComponent as Stock23,
  ReactComponent as Stock24,
  ReactComponent as Stock25,
  ReactComponent as Stock7,
  ReactComponent as Stock8,
  ReactComponent as Stock9,
} from "../../assets/landing/stock7.svg";

function generateRandomNumber(address: string) {
  const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(address));
  const randomByte = parseInt(hash.slice(2, 4), 16); // get the second byte of the hash
  const randomNumber = (randomByte % 25) + 1;
  return randomNumber;
}

function RoundBanner(props: { roundId: string }) {
  const stockId = generateRandomNumber(props.roundId);

  return (
    <div>
      {stockId === 1 && (
        <Stock1 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 2 && (
        <Stock2 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 3 && (
        <Stock3 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 4 && (
        <Stock4 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 5 && (
        <Stock5 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 6 && (
        <Stock6 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 7 && (
        <Stock7 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 8 && (
        <Stock8 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 9 && (
        <Stock9 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 10 && (
        <Stock10 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 11 && (
        <Stock11 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 12 && (
        <Stock12 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 13 && (
        <Stock13 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 14 && (
        <Stock14 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 15 && (
        <Stock15 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 16 && (
        <Stock16 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 17 && (
        <Stock17 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 18 && (
        <Stock18 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 19 && (
        <Stock19 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 20 && (
        <Stock20 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 21 && (
        <Stock21 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 22 && (
        <Stock22 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 23 && (
        <Stock23 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 24 && (
        <Stock24 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
      {stockId === 25 && (
        <Stock25 className="bg-black h-[140px] w-full object-cover rounded-t" />
      )}
    </div>
  );
}

export default RoundBanner;
