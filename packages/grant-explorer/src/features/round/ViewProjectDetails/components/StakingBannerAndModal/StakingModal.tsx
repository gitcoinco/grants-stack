import { Button } from "common/src/styles";
import { BaseModal } from "../../../../common/BaseModal";
import { ArrowRightIcon } from "@heroicons/react/20/solid";

const TITLE = "You're about to stake GTC on this project";
const TITLE_ROUND_VIEW = "You're about to stake GTC in this round!";
const DESCRIPTION =
  "To complete your stake, you’ll be redirected to a new tab. Once you confirm your transaction, your support will be reflected on the round page.";

const CHECK_POINTS = [
  "Boost this project’s visibility",
  "Earn a share of the 3% rewards pool",
];

const Title = ({ isRoundView }: { isRoundView: boolean }) => (
  <div className="flex flex-col gap-2">
    <div className="text-3xl leading-[2.125rem] align-middle font-medium">
      {isRoundView ? TITLE_ROUND_VIEW : TITLE}
    </div>
    <div className="text-base leading-[1.625rem] align-middle font-normal">
      {DESCRIPTION}
    </div>
  </div>
);

const CheckPoints = () => (
  <div className="flex flex-col gap-4">
    {CHECK_POINTS.map((point, index) => (
      <div
        key={index + point}
        className="text-base leading-[1.625rem] align-middle font-normal"
      >{`✅ ${point}`}</div>
    ))}
  </div>
);

const Content = ({ isRoundView }: { isRoundView: boolean }) => (
  <div className="flex flex-col gap-6 font-sans text-black">
    <Title isRoundView={isRoundView} />
    <CheckPoints />
  </div>
);

const ActionButtons = ({
  onCancel,
  onStake,
}: {
  onCancel: () => void;
  onStake: () => void;
}) => (
  <div className="flex justify-center gap-6 font-mono font-medium text-sm leading-6">
    <Button
      type="button"
      $variant="outline"
      className={`inline-flex text-black py-2 px-4`}
      onClick={onCancel}
      data-testid={"modal-cancel"}
    >
      Cancel
    </Button>
    <Button
      type="button"
      className={`inline-flex bg-[#22635A] text-white py-2 px-4`}
      onClick={onStake}
      data-testid={"modal-stake"}
    >
      <div className="flex items-center gap-2">
        Stake GTC <ArrowRightIcon className="w-4 h-4 no-shrink" />
      </div>
    </Button>
  </div>
);

export const StakingModal = ({
  isOpen,
  onClose,
  onStake,
  isRoundView,
}: {
  isOpen: boolean;
  onClose: () => void;
  onStake: () => void;
  isRoundView: boolean;
}) => {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} size="2xl">
      <div className="flex flex-col gap-8">
        <Content isRoundView={isRoundView} />
        <ActionButtons onCancel={onClose} onStake={onStake} />
      </div>
    </BaseModal>
  );
};
