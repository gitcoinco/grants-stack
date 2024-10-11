import { useGetImages } from "../../../../hooks/attestations/useGetImages";
import { ImageWithLoading } from "../../../common/components/ImageWithLoading";

export type ViewAttestationImageProps = {
  impactImageCid?: string;
};

export function ViewAttestationImage({
  impactImageCid,
}: ViewAttestationImageProps) {
  const {
    data: image,
    isLoading: imagesIsLoading,
    isFetching,
  } = useGetImages(impactImageCid ? [impactImageCid] : [], !!impactImageCid);

  const isLoading = imagesIsLoading || !image || !impactImageCid || isFetching;
  const imageSrc = image?.[0];

  return (
    <ImageWithLoading
      sizeClass="w-full max-w-[400px] aspect-square relative"
      src={imageSrc}
      isLoading={isLoading}
    />
  );
}
