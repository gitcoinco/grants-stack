function RoundBanner() {
    // todo: update to store in repo, these expire.
    const BANNER_IMAGE = "https://s3-alpha-sig.figma.com/img/c71c/562a/94d2299f9156d7042db50416393a5b35?Expires=1682899200&Signature=B6jQh~BCXJo5H5Vx6OOP9nrsz9AuuH1y9xwtS36e2iO5j-2MBcSO4o2Ld45Eam1kh4wYxoVqEtDwB9Z0L3z69Xyk79vHw-SxVhTiSJTWM6RHR-ud1MSvZGGz-EiYr05TF7FeCKauQb3hOvtyBLs-w5kUpcThcTPBR8Lgq7nPHCQAPZJUnEnDnu7zwj-5qK64A6bVqHtvl8upKV1aFeDodi5W6dN8T-O~~B1bsRzWsLnsdowQfxgeUZ8ZWkg803YRV8XRMUbAlXN4~GZV2DV3SbJZDkQqB~o~PNPcERinOAz7BGrNK0IEykFTONeqhlrZGkADuVhdW08QQ5dVbyhPYw__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4"
  
    return (
      <div>
        <img
          className="bg-black h-[140px] w-full object-cover rounded-t"
          src={BANNER_IMAGE}
          alt="Round Banner"
        />
      </div>
    );
  }

  export default RoundBanner;
  