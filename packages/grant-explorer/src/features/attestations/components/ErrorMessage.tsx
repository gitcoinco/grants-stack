import warningIcon from "../../../assets/warning.svg";

export const ErrorMessage = () => (
  <div className="w-full flex flex-col rounded-lg p-2 text-left bg-[#FFD9CD]">
    <div className="flex items-center">
      <img src={warningIcon} alt="errorIcon" className="h-4 w-4 mr-2" />
      <div className="text-md font-modern-era-medium">Error</div>
    </div>
    <div className="text-sm font-modern-era-medium">
      Transaction failed. Please try again.
    </div>
  </div>
);
