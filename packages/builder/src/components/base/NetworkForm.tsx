import { useState } from "react";
import { shallowEqual, useSelector } from "react-redux";
import { useSwitchNetwork } from "wagmi";
import { RootState } from "../../reducers";
import { ChangeHandlers, ProjectFormStatus } from "../../types";
import { Select } from "../grants/inputs";
import Button, { ButtonVariants } from "./Button";
import NetworkSwitchModal from "./NetworkSwitchModal";

function NetworkForm({
  setVerifying,
}: {
  setVerifying: (verifying: ProjectFormStatus) => void;
}) {
  const props = useSelector(
    (state: RootState) => ({
      currentChain: state.web3.chainID,
    }),
    shallowEqual
  );
  const [switchTo, setSwitchTo] = useState<number | undefined>(
    props.currentChain
  );
  const [showModal, setShowModal] = useState<boolean>(false);
  const { chains } = useSwitchNetwork();

  const handleNetworkSelect = async (e: ChangeHandlers) => {
    const { value } = e.target;
    setSwitchTo(parseInt(value, 10));

    if (value !== props.currentChain?.toString()) {
      setShowModal(true);
    }
  };

  const nextStep = () => {
    setVerifying(ProjectFormStatus.Metadata);
  };

  return (
    <div
      className="border-0 sm:border sm:border-solid border-tertiary-text rounded text-primary-text p-0 sm:p-4"
      data-testid="network-form"
    >
      <form onSubmit={(e) => e.preventDefault()}>
        <div className="relative mt-4 w-full sm:w-1/2">
          <Select
            name="network"
            defaultValue={props.currentChain?.toString()}
            label={
              <span className="text-[15px]">
                Which network would you like to create this project on?
              </span>
            }
            options={chains.map((i) => ({
              id: i.id.toString(),
              title: i.name,
            }))}
            changeHandler={handleNetworkSelect}
            required
            feedback={{ type: "none", message: "" }}
          />
        </div>
        <div className="flex w-full justify-end mt-6">
          <Button
            disabled={switchTo !== props.currentChain}
            variant={ButtonVariants.primary}
            onClick={nextStep}
            dataTrackEvent="project-create-network-next"
          >
            Next
          </Button>
        </div>
      </form>
      <NetworkSwitchModal
        modalOpen={showModal}
        toggleModal={setShowModal}
        networkId={switchTo}
        onSwitch={() => setShowModal(false)}
      />
    </div>
  );
}

export default NetworkForm;
