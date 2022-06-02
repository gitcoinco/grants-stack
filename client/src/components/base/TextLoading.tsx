function TextLoading() {
  return (
    <div className="my-6 mx-3 animate-pulse flex space-x-4 h-full">
      <div className="flex-1 space-y-6 py-1">
        <div className="h-2 bg-text rounded" />
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div className="h-2 bg-primary-text rounded col-span-2" />
            <div className="h-2 bg-primary-text rounded col-span-1" />
          </div>
          <div className="h-2 bg-primary-text rounded" />
        </div>
      </div>
    </div>
  );
}

export default TextLoading;
