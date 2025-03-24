export const StatCard = ({
  statValue,
  secondaryStatValue,
  statName,
  isValueLoading,
}: {
  statValue: string;
  secondaryStatValue?: string;
  statName: string;
  isValueLoading?: boolean;
}): JSX.Element => {
  return (
    <div className="bg-grey-50 p-4 sm:p-6 rounded-2xl flex flex-col justify-between w-full">
      {isValueLoading ? (
        <div className="w-[80%] rounded text-5 sm:h-9 mb-4 bg-grey-200 animate-pulse" />
      ) : (
        <div className="pb-4">
          <p className="text-xl sm:text-3xl font-mono prose tracking-tighter">
            {statValue}
          </p>
          {!!secondaryStatValue?.length && (
            <p className="text-sm font-mono font-medium prose tracking-tighter">
              {secondaryStatValue}
            </p>
          )}
        </div>
      )}

      <p className="text-sm text-grey-400 font-bold max-w-[20ch]">{statName}</p>
    </div>
  );
};
