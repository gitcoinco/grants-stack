import { shallowEqual, useSelector } from "react-redux";
import { useState } from "react";
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
          <div className="mb-2">
            Which network would you like to create this project on?
          </div>
          <Select
            name="network"
            defaultValue={props.currentChain}
            label={
              <span className="text-xs">
                For more details on network selection,{" "}
                <a
                  href="https://support.gitcoin.co/gitcoin-knowledge-base/gitcoin-grants-protocol/what-is-grants-hub"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gitcoin-violet-400"
                >
                  read more.
                </a>
              </span>
            }
            options={chains.map((i) => ({ id: i.id, title: i.name }))}
            changeHandler={handleNetworkSelect}
            required
          />
        </div>
        <div className="flex w-full justify-end mt-6">
          <Button
            disabled={switchTo !== props.currentChain}
            variant={ButtonVariants.primary}
            onClick={nextStep}
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
