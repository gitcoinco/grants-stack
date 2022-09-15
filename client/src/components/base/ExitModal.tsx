import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { formReset } from "../../actions/projectForm";
import { slugs } from "../../routes";
import colors from "../../styles/colors";
import Shield from "../icons/Shield";
import { BaseModal } from "./BaseModal";
import Button, { ButtonVariants } from "./Button";

interface ExitProps {
  modalOpen: boolean;
  toggleModal: (status: boolean) => void;
}

export default function ExitModal({ modalOpen, toggleModal }: ExitProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const exitForm = () => {
    navigate(slugs.grants);
    dispatch(formReset());
  };

  return (
    <BaseModal isOpen={modalOpen} onClose={() => toggleModal(false)}>
      <>
        <div className="flex">
          <div className="w-1/5">
            <div className="rounded-full h-12 w-12 bg-primary-background/10 border flex justify-center items-center">
              <Shield color={colors["primary-background"]} />
            </div>
          </div>
          <div className="w-4/5">
            <h5 className="font-semibold mb-2">Save Changes?</h5>
            <p className="mb-4">You are about to lose any changes made.</p>
            <p className="mb-4">Are you sure you want to exit?</p>
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            variant={ButtonVariants.outline}
            onClick={() => toggleModal(false)}
          >
            Go Back
          </Button>
          <Button onClick={exitForm} variant={ButtonVariants.danger}>
            Yes, Exit
          </Button>
        </div>
      </>
    </BaseModal>
  );
}
