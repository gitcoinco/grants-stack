function LoadingCard() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="w-full h-32 bg-gitcoin-grey-50" />
      <div className="flex p-6 relative">
        <div className="flex w-full justify-between absolute -top-6">
          <div className="rounded-full h-12 w-12 bg-gitcoin-grey-50 border-2 border-white flex justify-center items-center" />
        </div>
      </div>
      <div className="-mt-2 px-6 w-full mb-8">
        <div className="h-6 bg-gitcoin-grey-50 w-full" />
        <div className="h-6 bg-gitcoin-grey-50 mt-2 w-4/5" />
        <div className="h-16 bg-gitcoin-grey-50 mt-3 w-full" />
      </div>
    </div>
  );
}

export default LoadingCard;
