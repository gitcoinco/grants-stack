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
import Stock25 from "../../assets/landing/stock25.jpg";
import Stock26 from "../../assets/landing/stock26.jpg";
import Stock27 from "../../assets/landing/stock27.jpg";
import Stock28 from "../../assets/landing/stock28.jpg";
import Stock29 from "../../assets/landing/stock29.jpg";
import Stock30 from "../../assets/landing/stock30.jpg";
import Stock31 from "../../assets/landing/stock31.jpg";
import Stock32 from "../../assets/landing/stock32.jpg";
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
  Stock25,
  Stock26,
  Stock27,
  Stock28,
  Stock29,
  Stock30,
  Stock31,
  Stock32,
];

function generateRandomNumber(address: string) {
  const hash = keccak256(toBytes(address));
  const randomByte = parseInt(hash.slice(2, 4), 16);
  const randomNumber = randomByte % stockImages.length;
  return randomNumber;
}

export function RoundBanner(props: { roundId: string }) {
  const stockId = generateRandomNumber(props.roundId);
  const stockImage = stockImages[stockId];

  return (
    <div className="overflow-hidden h-32">
      <div
        className="bg-black blur w-[120%] h-[120%] -mt-4 -ml-4 brightness-[40%] object-cover"
        style={{ backgroundImage: `url(${stockImage})` }}
      />
    </div>
  );
}

export function CollectionBanner({ images }: { images: string[] }) {
  return (
    <div className="overflow-hidden h-[192px]">
      {images.map((image, i) => {
        return (
          <div
            key={i}
            className={`bg-grey-100 h-[48px] bg-no-repeat bg-center w-full bg-cover`}
            style={{
              backgroundImage: `url(${image})`,
            }}
          />
        );
      })}
    </div>
  );
}

export function CategoryBanner({ images }: { images: string[] }) {
  return (
    <div className="overflow-hidden grid grid-cols-2">
      {images.map((image, i) => {
        return (
          <div
            key={i}
            className={`bg-grey-100 aspect-square w-full bg-no-repeat bg-cover`}
            style={{
              backgroundImage: `url(${image})`,
            }}
          />
        );
      })}
    </div>
  );
}

export default RoundBanner;
