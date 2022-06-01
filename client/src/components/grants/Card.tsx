import Lightning from "../icons/Lightning";
import colors from "../../styles/colors";

function Card() {
  return (
    <div className="max-w-sm rounded overflow-hidden shadow-lg">
      <img
        className="w-full"
        src="./assets/card-img.png"
        alt="project banner"
      />
      <div className="py-4 relative text-center">
        <div className="flex w-full justify-center absolute -top-6">
          <div className="rounded-full h-12 w-12 bg-quaternary-text border border-tertiary-text flex justify-center items-center">
            <Lightning color={colors["primary-text"]} />
          </div>
        </div>
        <div className="px-6 pt-4">
          <div className="font-bold text-xl mb-2">The Coldest Sunset</div>
          <p className="text-gray-700 text-base">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit.
            Voluptatibus quia, nulla! Maiores et perferendis eaque,
            exercitationem praesentium nihil.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Card;
