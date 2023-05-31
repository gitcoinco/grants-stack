import { yupResolver } from "@hookform/resolvers/yup";
import { merge } from 'lodash';
import { useContext } from "react";
import {
  SubmitHandler,
  useForm,
} from "react-hook-form";
import ReactTooltip from "react-tooltip";
import { PayoutToken, getPayoutTokenOptions } from "../api/utils";
import { useWallet } from "../common/Auth";
import { FormStepper } from "../common/FormStepper";
import { FormContext } from "../common/FormWizard";
import { quadraticFundingValidationSchema } from "./formValidators";
import { MatchingCap, MatchingFundsAvailable, MinDonationThreshold, PayoutTokenDropdown, SybilDefense } from "./ApplicationFormComponents";
interface QuadraticFundingFormProps {
  stepper: typeof FormStepper;
}

export interface QuadraticFundingFormFields {
  matchingFundsAvailable: number;
  matchingCap: boolean;
  matchingCapAmount?: number;
  minDonationThreshold: boolean;
  minDonationThresholdAmount?: number;
  sybilDefenseEnabled: boolean;
  token: string;
}

export default function QuadraticFundingForm(props: QuadraticFundingFormProps) {
  const { currentStep, setCurrentStep, stepsCount, formData, setFormData } = useContext(FormContext);
  const { chain } = useWallet();
  const payoutTokenOptions: PayoutToken[] = getPayoutTokenOptions(chain.id); 

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<QuadraticFundingFormFields>({
    defaultValues: {
      ...formData,
    },
    resolver: yupResolver(quadraticFundingValidationSchema),
  });

  const FormStepper = props.stepper;

  const next: SubmitHandler<QuadraticFundingFormFields> = async (values) => {
    const data = merge(formData, values);
    setFormData(data);
    setCurrentStep(currentStep + 1);
  };
  const prev = () => setCurrentStep(currentStep - 1);

  return (
    <div>
      <div className="md:grid md:grid-cols-3 md:gap-10">
        <LeftSidebar />

        <div className="mt-5 md:mt-0 md:col-span-2">
          <form
            onSubmit={handleSubmit(next, (errors) => {
              console.log(errors);
            })}
            className="shadow-sm text-grey-500"
          >
            {/* QF Settings */}
            <div className="p-6 bg-white">
              <p className="text-grey-400 mb-4">Quadratic Funding Settings</p>
              <div className="grid grid-cols-6 gap-6">
                <PayoutTokenDropdown
                  register={register("token")}
                  errors={errors}
                  control={control}
                  payoutTokenOptions={payoutTokenOptions}
                />
                <MatchingFundsAvailable
                  errors={errors}
                  register={register(
                    "matchingFundsAvailable"
                  )}
                  token={watch("token")}
                  payoutTokenOptions={payoutTokenOptions}
                />
              </div>
            </div>

            {/* Matching Cap */}
            <div className="p-6 bg-white">
              <p className="text-grey-400 mb-4 mt-4">Matching Cap</p>
              <div className="grid grid-cols-6 gap-6">
                <MatchingCap
                  errors={errors}
                  register={register(
                    "matchingCapAmount",
                    {
                      valueAsNumber: true,
                    }
                  )}
                  control={control}
                  token={watch("token")}
                  payoutTokenOptions={payoutTokenOptions}
                />
              </div>
            </div>

            {/* Minimum Donation Threshold */}
            <div className="p-6 bg-white">
              <p className="text-grey-400 mb-4 mt-4">
                Minimum Donation Threshold
              </p>
              <div className="grid grid-cols-6 gap-6">
                <MinDonationThreshold
                  errors={errors}
                  register={register(
                    "minDonationThresholdAmount",
                    {
                      valueAsNumber: true,
                    }
                  )}
                  control={control}
                />
              </div>
            </div>

            {/* Sybil Defense */}
            <div className="p-6 bg-white">
              <div className="grid grid-rows-1 grid-cols-2">
                <div>
                  <p className="text-grey-400">Sybil Defense</p>
                </div>
                <div>
                  <p className="text-sm justify-end">
                    <span className="text-right text-violet-400 float-right text-xs mt-3">
                      *Required
                    </span>
                  </p>
                </div>
                <ReactTooltip
                  id="matching-cap-tooltip"
                  place="bottom"
                  type="dark"
                  effect="solid"
                >
                  <p className="text-xs">
                    This will cap the percentage <br />
                    of your overall matching pool <br />
                    that a single grantee can receive.
                  </p>
                </ReactTooltip>
              </div>
              <p className="text-grey-400 mb-2 mt-1 text-sm">
                Ensure that project supporters are not bots or sybil with
                Gitcoin Passport. Learn more about Gitcoin Passport{" "}
                <a 
                  href="https://docs.passport.gitcoin.co/overview/readme" 
                  className="text-violet-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  here
                </a>
                .
              </p>
              <div className="flex">
                <SybilDefense
                  control={control}
                />
              </div>
            </div>

            {/* FormStepper */}
            <div className="px-6 align-middle py-3.5 shadow-md">
              <FormStepper
                currentStep={currentStep}
                stepsCount={stepsCount}
                prev={prev}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function LeftSidebar() {
  return (
    <div className="md:col-span-1">
      <p className="text-base leading-6">Funding Settings</p>
      <p className="mt-1 text-sm text-grey-400">
        What is the Round name, when do applications open/close, and when does
        it start and end?
      </p>
      <p className="mt-1 text-sm text-grey-400 pt-4">
        You can change this settings anytime before the round starts. Learn more
        about QF <a href="https://wtfisqf.com">here</a>.
      </p>
    </div>
  );
}
