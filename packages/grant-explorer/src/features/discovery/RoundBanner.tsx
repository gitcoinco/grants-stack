import Stock1 from "../../assets/landing/stock1.jpg";
import Stock10 from "../../assets/landing/stock10.jpg";
import Stock11 from "../../assets/landing/stock11.jpg";
import Stock12 from "../../assets/landing/stock12.jpg";
import Stock13 from "../../assets/landing/stock13.jpg";
import Stock14 from "../../assets/landing/stock14.jpg";
import Stock15 from "../../assets/landing/stock15.jpg";
import Stock16 from "../../assets/landing/stock16.jpg";
import Stock17 from "../../assets/landing/stock17.jpg";
import Stock18 from "../../assets/landing/stock18.jpg";
import Stock19 from "../../assets/landing/stock19.jpg";
import Stock2 from "../../assets/landing/stock2.jpg";
import Stock20 from "../../assets/landing/stock20.jpg";
import Stock21 from "../../assets/landing/stock21.jpg";
import Stock22 from "../../assets/landing/stock22.jpg";
import Stock23 from "../../assets/landing/stock23.jpg";
import Stock24 from "../../assets/landing/stock24.jpg";
import Stock3 from "../../assets/landing/stock3.jpg";
import Stock4 from "../../assets/landing/stock4.jpg";
import Stock5 from "../../assets/landing/stock5.jpg";
import Stock6 from "../../assets/landing/stock6.jpg";
import Stock7 from "../../assets/landing/stock7.jpg";
import Stock8 from "../../assets/landing/stock8.jpg";
import Stock9 from "../../assets/landing/stock9.jpg";
import { keccak256, toBytes } from "viem";
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
  const hash = keccak256(toBytes(address));
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
