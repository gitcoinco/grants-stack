import {screen} from "@testing-library/react"
import {renderWrapped} from "../../../test-utils";
import ProgressModal, {ProgressStatus} from "../ProgressModal";

describe('<ProgressModal />',  () => {

	it('shows error icon for the step when the step is in error', async () => {
		const steps: Array<{
			name: string;
			description: string;
			status: ProgressStatus
		}> = [
			{
			name: "storing",
			description: "",
			status: ProgressStatus.ERROR
		},
		{
			name: "deploying",
			description: "",
			status: ProgressStatus.UPCOMING
		}];

		renderWrapped(<ProgressModal isOpen={true} setIsOpen={() => {}} steps={steps} />);

		await screen.findByTestId('storing-error-icon');
	});

	it('does not show error icon for a step that is not in error', async () => {
		const steps: Array<{
			name: string;
			description: string;
			status: ProgressStatus
		}> = [
			{
				name: "storing",
				description: "",
				status: ProgressStatus.ERROR
			},
			{
				name: "deploying",
				description: "",
				status: ProgressStatus.UPCOMING
			}];

		renderWrapped(<ProgressModal isOpen={true} setIsOpen={() => {}} steps={steps} />);

		expect(screen.queryByTestId('deploying-error-icon')).not.toBeInTheDocument()
	});
});
