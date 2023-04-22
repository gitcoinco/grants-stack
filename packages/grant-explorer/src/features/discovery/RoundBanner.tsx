import { ethers } from "ethers";
import Stock1 from "../../assets/landing/stock1.png";
import Stock10 from "../../assets/landing/stock10.png";
import Stock11 from "../../assets/landing/stock11.png";
import Stock12 from "../../assets/landing/stock12.png";
import Stock13 from "../../assets/landing/stock13.png";
import Stock14 from "../../assets/landing/stock14.png";
import Stock15 from "../../assets/landing/stock15.png";
import Stock16 from "../../assets/landing/stock16.png";
import Stock17 from "../../assets/landing/stock17.png";
import Stock18 from "../../assets/landing/stock18.png";
import Stock19 from "../../assets/landing/stock19.png";
import Stock2 from "../../assets/landing/stock2.png";
import Stock20 from "../../assets/landing/stock20.png";
import Stock21 from "../../assets/landing/stock21.png";
import Stock22 from "../../assets/landing/stock22.png";
import Stock23 from "../../assets/landing/stock23.png";
import Stock24 from "../../assets/landing/stock24.png";
import Stock3 from "../../assets/landing/stock3.png";
import Stock4 from "../../assets/landing/stock4.png";
import Stock5 from "../../assets/landing/stock5.png";
import Stock6 from "../../assets/landing/stock6.png";
import Stock7 from "../../assets/landing/stock7.png";
import Stock8 from "../../assets/landing/stock8.png";
import Stock9 from "../../assets/landing/stock9.png";
const stockImages = [
  Stock1,
  Stock2,
  Stock3,
  Stock4,
  Stock5,
  Stock6,
  Stock7,
  Stock8,
  Stock9,
  Stock10,
  Stock11,
  Stock12,
  Stock13,
  Stock14,
  Stock15,
  Stock16,
  Stock17,
  Stock18,
  Stock19,
  Stock20,
  Stock21,
  Stock22,
  Stock23,
  Stock24,
];

function generateRandomNumber(address: string) {
  const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(address));
  const randomByte = parseInt(hash.slice(2, 4), 16);
  const randomNumber = randomByte % 24;
  return randomNumber;
}

function RoundBanner(props: { roundId: string }) {
  const stockId = generateRandomNumber(props.roundId);
  const stockImage = stockImages[stockId];

  return (
    <div>
      <img
        src={stockImage}
        className="bg-black h-[140px] w-full object-cover rounded-t"
      />
    </div>
  );
}

export default RoundBanner;
