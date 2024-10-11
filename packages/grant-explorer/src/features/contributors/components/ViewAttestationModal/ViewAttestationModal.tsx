import { Link } from "react-router-dom";
import { useGetImages } from "../../../../hooks/attestations/useGetImages";
import { ImageWithLoading } from "../../../common/components/ImageWithLoading";
import Modal from "../../../common/components/Modal";
import { ShareButtons } from "../../../common/ShareButtons";
import { ViewTransactionButton } from "../Buttons";

export type ViewAttestationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  impactImageCid?: string;
  transactionUrl?: string;
};

export function ViewAttestationModal({
  isOpen,
  onClose,
  impactImageCid,
  transactionUrl = "",
}: ViewAttestationModalProps) {
  const {
    data: image,
    isLoading: imagesIsLoading,
    isFetching,
  } = useGetImages(impactImageCid ? [impactImageCid] : [], !!impactImageCid);

  const isLoading = imagesIsLoading || !image || !impactImageCid || isFetching;
  const imageSrc = image?.[0];
  const title = "Your donation impact";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center gap-6 mx-auto w-full h-full overflow-x-auto max-w-full md:w-[625px]">
        <h2 className="text-black text-3xl sm:text-4xl md:text-5xl/[52px] text-center font-medium font-sans  text-[clamp(1.5rem, 2vw + 1rem, 2rem)]">
          {title}
        </h2>
        <Link to={transactionUrl}>
          <ViewTransactionButton disabled={!transactionUrl} />
        </Link>
        <ImageWithLoading
          sizeClass="w-full max-w-[400px] aspect-square relative"
          src={imageSrc}
          isLoading={isLoading}
        />
        <ShareButtons />
      </div>
    </Modal>
  );
}
