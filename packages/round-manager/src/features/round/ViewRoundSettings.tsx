/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Listbox, RadioGroup, Tab, Transition } from "@headlessui/react";
import { CheckIcon, InformationCircleIcon } from "@heroicons/react/solid";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  AnyJson,
  ChainId,
  RoundVisibilityType,
  classNames,
  getUTCDate,
  getUTCTime,
  useAllo,
} from "common";
import { Button } from "common/src/styles";
import _ from "lodash";
import moment, { Moment } from "moment";
import { Fragment, useEffect, useState } from "react";
import Datetime from "react-datetime";
import {
  Control,
  Controller,
  ControllerRenderProps,
  FieldErrors,
  SubmitHandler,
  UseFormRegister,
  UseFormRegisterReturn,
  UseFormResetField,
  UseFormSetValue,
  useController,
  useForm,
} from "react-hook-form";
import { FaEdit, FaPlus } from "react-icons/fa";
import ReactTooltip from "react-tooltip";
import { useNetwork } from "wagmi";
import * as yup from "yup";
import { maxDateForUint256 } from "../../constants";
import { useRoundById } from "../../context/round/RoundContext";
import { useUpdateRound } from "../../context/round/UpdateRoundContext";
import { getPayoutTokenOptions, payoutTokens } from "../api/payoutTokens";
import { ProgressStatus, ProgressStep, Round } from "../api/types";
import { CHAINS, SupportType } from "../api/utils";
import ConfirmationModal from "../common/ConfirmationModal";
import ErrorModal from "../common/ErrorModal";
import FormValidationErrorList from "../common/FormValidationErrorList";
import ProgressModal from "../common/ProgressModal";
import { horizontalTabStyles } from "../common/Utils";
import { PayoutTokenInformation } from "./QuadraticFundingForm";
import {
  RoundValidationSchema,
  SupportTypeButton,
  supportTypes,
} from "./RoundDetailForm";
import { isDirectRound } from "./ViewRoundPage";
import { RoundCategory, UpdateRoundParams } from "common/dist/types";
import { ethers } from "ethers";
import { getConfig } from "common/src/config";
import { zeroAddress } from "viem";
import { NATIVE } from "common/dist/allo/common";

type EditMode = {
  canEdit: boolean;
  canEditOnlyRoundEndDate: boolean;
};

const isV2 = getConfig().allo.version === "allo-v2";

const generateUpdateRoundData = (
  oldRoundData: Round,
  newRoundData: Round
): UpdateRoundParams => {
  // create deterministic copies of the data
  const dOldRound: Round = _.cloneDeep(oldRoundData);
  const dNewRound: Round = _.cloneDeep(newRoundData);

  const updateRoundData: UpdateRoundParams = {};

  if (
    !_.isEqual(dOldRound.applicationMetadata, dNewRound.applicationMetadata)
  ) {
    updateRoundData.applicationMetadata =
      dNewRound.applicationMetadata as AnyJson;

    if (isV2) {
      updateRoundData.roundMetadata = dNewRound.roundMetadata as AnyJson;
    }
  }

  if (!_.isEqual(dOldRound.roundMetadata, dNewRound.roundMetadata)) {
    updateRoundData.roundMetadata = dNewRound.roundMetadata as AnyJson;

    if (isV2) {
      updateRoundData.applicationMetadata =
        dNewRound.applicationMetadata as AnyJson;
    }
  }

  if (
    dNewRound.chainId &&
    !_.isEqual(
      dOldRound?.roundMetadata?.quadraticFundingConfig?.matchingFundsAvailable,
      dNewRound?.roundMetadata?.quadraticFundingConfig?.matchingFundsAvailable
    )
  ) {
    const decimals = getPayoutTokenOptions(dNewRound.chainId).find(
      (token) => token.address === dNewRound.token
    )?.decimal;

    const matchAmount = ethers.utils.parseUnits(
      dNewRound?.roundMetadata?.quadraticFundingConfig?.matchingFundsAvailable.toString(),
      decimals
    );

    updateRoundData.matchAmount = matchAmount;
  }

  if (
    !(
      _.isEqual(dOldRound.roundStartTime, dNewRound.roundStartTime) &&
      _.isEqual(dOldRound.roundEndTime, dNewRound.roundEndTime) &&
      _.isEqual(
        dOldRound.applicationsStartTime,
        dNewRound.applicationsStartTime
      ) &&
      _.isEqual(dOldRound.applicationsEndTime, dNewRound.applicationsEndTime)
    )
  ) {
    updateRoundData.roundStartTime = dNewRound.roundStartTime;
    updateRoundData.roundEndTime = dNewRound.roundEndTime;
    updateRoundData.applicationsStartTime = dNewRound.applicationsStartTime;
    updateRoundData.applicationsEndTime = dNewRound.applicationsEndTime;
  }

  return updateRoundData;
};

export default function ViewRoundSettings(props: { id?: string }) {
  const { round } = useRoundById(props.id?.toLowerCase());
  const allo = useAllo();
  const [editMode, setEditMode] = useState<EditMode>({
    canEdit: false,
    canEditOnlyRoundEndDate: false,
  });

  const [editedRound, setEditedRound] = useState<Round | undefined>({
    ..._.cloneDeep(round!),
  });
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const { updateRound, IPFSCurrentStatus, roundUpdateStatus, indexingStatus } =
    useUpdateRound();
  const [ipfsStep, setIpfsStep] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  const [noRoundEndDate, setNoRoundEndDate] = useState(false);

  const [rollingApplicationsEnabled, setRollingApplicationsEnabled] =
    useState(false);

  useEffect(() => {
    setNoRoundEndDate(moment(round?.roundEndTime).isSame(maxDateForUint256));
  }, [round?.roundEndTime]);

  useEffect(() => {
    if (
      round?.roundEndTime.toISOString() !== "" &&
      round?.applicationsEndTime.toISOString() ===
        round?.roundEndTime.toISOString()
    ) {
      setRollingApplicationsEnabled(true);
    }
  }, [round?.applicationsEndTime, round?.roundEndTime]);

  /* All DG rounds have rolling applications enabled */
  useEffect(() => {
    if (round && isDirectRound(round)) {
      setRollingApplicationsEnabled(true);
    }
  }, [round]);

  const ValidationSchema = !isDirectRound(round!)
    ? RoundValidationSchema.shape({
        // Overrides for validation schema that was not included in imported schema.
        roundMetadata: yup.object({
          name: yup
            .string()
            .required("This field is required.")
            .min(8, "Round name must be at least 8 characters."),
          roundType: yup.string().required("You must select the round type."),
          support: yup.object({
            type: yup
              .string()
              .required("You must select a support type.")
              .notOneOf(
                ["Select what type of input."],
                "You must select a support type."
              ),
            info: yup
              .string()
              .required("This field is required.")
              .when("type", {
                is: "Email",
                then: yup
                  .string()
                  .email()
                  .required("You must provide a valid email address."),
              })
              .when("type", {
                is: (val: string) => val && val != "Email",
                then: yup
                  .string()
                  .url()
                  .required("You must provide a valid URL."),
              }),
          }),
          eligibility: yup.object({
            description: yup
              .string()
              .required("A round description is required."),
            requirements: yup.array().of(
              yup.object({
                requirement: yup
                  .string()
                  .required("This field cannot be left blank."),
              })
            ),
          }),
          quadraticFundingConfig: yup.object({
            matchingFundsAvailable: yup
              .number()
              .typeError("Invalid value.")
              .min(
                round?.roundMetadata?.quadraticFundingConfig
                  ?.matchingFundsAvailable ?? 0,
                `Must be greater than previous value of ${round?.roundMetadata?.quadraticFundingConfig?.matchingFundsAvailable}.`
              ),
            matchingCapAmount: yup.number().when("matchingCap", {
              is: (val: string) => val === "yes",
              then: yup
                .number()
                .typeError("Invalid value.")
                .positive()
                .required("This field is required.")
                .moreThan(0.001, "Must be greater than zero (0).")
                .lessThan(101, "Must be equal or less than 100."),
              otherwise: yup.number().notRequired(),
            }),
            minDonationThresholdAmount: yup
              .number()
              .when("minDonationThreshold", {
                is: (val: string) => val === "yes",
                then: yup
                  .number()
                  .typeError("Invalid value.")
                  .positive()
                  .required("This field is required.")
                  .moreThan(0, "Must be greater than 0."),
                otherwise: yup.number().notRequired(),
              }),
          }),
        }),
      })
    : RoundValidationSchema.shape({
        // Overrides for validation schema that was not included in imported schema.
        roundMetadata: yup.object({
          name: yup
            .string()
            .required("This field is required.")
            .min(8, "Round name must be at least 8 characters."),
          roundType: yup.string().required("You must select the round type."),
          support: yup.object({
            type: yup
              .string()
              .required("You must select a support type.")
              .notOneOf(
                ["Select what type of input."],
                "You must select a support type."
              ),
            info: yup
              .string()
              .required("This field is required.")
              .when("type", {
                is: "Email",
                then: yup
                  .string()
                  .email()
                  .required("You must provide a valid email address."),
              })
              .when("type", {
                is: (val: string) => val && val != "Email",
                then: yup
                  .string()
                  .url()
                  .required("You must provide a valid URL."),
              }),
          }),
          eligibility: yup.object({
            description: yup
              .string()
              .required("A round description is required."),
            requirements: yup.array().of(
              yup.object({
                requirement: yup
                  .string()
                  .required("This field cannot be left blank."),
              })
            ),
          }),
        }),
      });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
    resetField,
    setValue,
  } = useForm<Round>({
    defaultValues: {
      ...round,
    },
    resolver: yupResolver(ValidationSchema),
  });

  useEffect(() => {
    setHasChanged(!_.isEmpty(generateUpdateRoundData(round!, editedRound!)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editedRound]);

  const submit: SubmitHandler<Round> = async (values: Round) => {
    const data = _.merge(editedRound, values);
    setEditedRound(data);
  };

  if (!round) {
    return <></>;
  }
  const roundEndDateTime = noRoundEndDate
    ? ""
    : round.roundEndTime
    ? `${getUTCDate(round.roundEndTime)} ${getUTCTime(round.roundEndTime)}`
    : "...";

  const hasRoundEnded = moment().isAfter(moment(round.roundEndTime));
  const canEditOnlyRoundEndDate = moment().isAfter(
    moment(round.roundStartTime)
  );

  const onCancelEdit = () => {
    reset(round);
    setEditedRound(round);
    setEditMode({
      canEdit: false,
      canEditOnlyRoundEndDate,
    });
  };

  const onEditClick = () => {
    setEditMode({
      canEdit: true,
      canEditOnlyRoundEndDate,
    });
  };

  const updateRoundHandler = async () => {
    if (!allo) return;
    try {
      // @ts-expect-error TS upgrade broke this, TODO fix this
      handleSubmit(submit(editedRound as Round));
      const data = generateUpdateRoundData(round!, editedRound!);

      setIpfsStep(
        !_.isNil(data?.applicationMetadata) || !_.isNil(data?.roundMetadata)
      );

      setEditMode({ ...editMode, canEdit: false });
      setIsConfirmationModalOpen(false);
      setIsProgressModalOpen(true);

      await updateRound({
        roundId: round.id!,
        roundAddress: round.payoutStrategy.id as `0x${string}`,
        data,
        allo,
        roundCategory: isDirectRound(round)
          ? RoundCategory.Direct
          : RoundCategory.QuadraticFunding,
      });

      setTimeout(() => {
        setIsProgressModalOpen(false);
        window.location.reload();
        setIpfsStep(false);
      }, 2000);
    } catch (e) {
      console.log("error", e);
    }
  };

  const onUpdateRound = () => {
    setIsConfirmationModalOpen(true);
  };

  const confirmationModalBody = (
    <p className="text-md text-center font-normal mb-4">
      You will need to sign a transaction to update your round with the latest
      changes. Please note that once the round starts, you will not be able to
      make any more changes to your round settings.
    </p>
  );

  const addRequirement = () => {
    const newRequirements = [
      ...(editedRound?.roundMetadata?.eligibility?.requirements || []),
      { requirement: "" },
    ];
    setEditedRound({
      ...editedRound!,
      roundMetadata: {
        ...editedRound!.roundMetadata,
        eligibility: {
          ...editedRound?.roundMetadata.eligibility,
          description:
            editedRound?.roundMetadata?.eligibility?.description ?? "",
          requirements: newRequirements,
        },
      },
    });
  };

  const isFinished = (): ProgressStatus => {
    const ipfsSuccess = ipfsStep
      ? IPFSCurrentStatus === ProgressStatus.IS_SUCCESS
      : true;
    const roundSuccess = roundUpdateStatus === ProgressStatus.IS_SUCCESS;
    const indexingSuccess = indexingStatus === ProgressStatus.IS_SUCCESS;
    return ipfsSuccess && roundSuccess && indexingSuccess
      ? ProgressStatus.IS_SUCCESS
      : ProgressStatus.NOT_STARTED;
  };

  const progressSteps: ProgressStep[] = [
    ...(ipfsStep
      ? [
          {
            name: "Storing",
            description: "The metadata is being saved in a safe place.",
            status: IPFSCurrentStatus,
          },
        ]
      : []),
    {
      name: "Submitting",
      description: `Sending transaction to update the round contract.`,
      status: roundUpdateStatus,
    },
    {
      name: "Reindexing",
      description: "Making sure our data is up to date.",
      status: indexingStatus,
    },
    {
      name: "Finishing Up",
      description: "We’re wrapping up.",
      status: isFinished(),
    },
  ];

  return (
    <div
      key={editedRound?.id}
      className="flex flex-center flex-col mx-auto mt-3 mb-[212px]"
    >
      <form onSubmit={handleSubmit(onUpdateRound)}>
        <div className="flex flex-row items-center justify-between">
          <p className="text-xl font-semibold leading-6 mb-4">Round Settings</p>
          <div>
            {editMode.canEdit ? (
              <>
                <Button
                  className="mr-4"
                  type="button"
                  $variant="outline"
                  onClick={onCancelEdit}
                  data-testid="cancel-button"
                >
                  Cancel
                </Button>
                <Button
                  data-testid="update-round-button"
                  disabled={!hasChanged}
                  type="submit"
                >
                  Update Round
                </Button>
              </>
            ) : (
              <Button
                data-testid="edit-round-button"
                type="button"
                $variant="outline"
                onClick={onEditClick}
                disabled={hasRoundEnded}
              >
                <span className="flex flex-row items-center">
                  <FaEdit className="mr-2 mb-1" />
                  <span>Edit Round</span>
                </span>
              </Button>
            )}
          </div>
        </div>
        <div className="mb-8">
          <p className="text-sm text-gray-400">
            Changes can be made up until the round ends
            {noRoundEndDate ? "" : " (" + roundEndDateTime + ")"}.
          </p>
          <p className="text-sm text-gray-400">
            The round will be locked after the round ends, so be sure to make
            any edits before then.
          </p>
        </div>
        <FormValidationErrorList errors={errors} />
        <Tab.Group>
          <div className="justify-end grow relative">
            <Tab.List className="border-b mb-6 flex items-center justify-between">
              <div className="space-x-8">
                <Tab
                  className={({ selected }) => horizontalTabStyles(selected)}
                >
                  {({ selected }) => (
                    <div className={selected ? "text-violet-500" : ""}>
                      Round Details
                    </div>
                  )}
                </Tab>
                <Tab
                  className={({ selected }) => horizontalTabStyles(selected)}
                >
                  {({ selected }) => (
                    <div className={selected ? "text-violet-500" : ""}>
                      {!isDirectRound(round)
                        ? "Round & Application Period"
                        : "Round Period"}
                    </div>
                  )}
                </Tab>
                {!isDirectRound(round) && (
                  <Tab
                    className={({ selected }) => horizontalTabStyles(selected)}
                  >
                    {({ selected }) => (
                      <div className={selected ? "text-violet-500" : ""}>
                        Funding Settings
                      </div>
                    )}
                  </Tab>
                )}
              </div>
            </Tab.List>
          </div>
          <div>
            <Tab.Panels>
              <Tab.Panel>
                <DetailsPage
                  editMode={editMode}
                  editedRound={editedRound as Round}
                  setEditedRound={setEditedRound}
                  control={control}
                  register={register}
                  errors={errors}
                  onAddRequirement={() => {
                    addRequirement();
                  }}
                />
              </Tab.Panel>
              <Tab.Panel>
                <RoundApplicationPeriod
                  setValue={setValue}
                  editMode={editMode}
                  editedRound={editedRound as Round}
                  setEditedRound={setEditedRound}
                  noRoundEndDate={noRoundEndDate}
                  rollingApplicationsEnabled={rollingApplicationsEnabled}
                  setRollingApplicationsEnabled={setRollingApplicationsEnabled}
                  control={control}
                  register={register}
                  errors={errors}
                />
              </Tab.Panel>
              <Tab.Panel>
                <Funding
                  editMode={editMode}
                  editedRound={editedRound as Round}
                  setEditedRound={setEditedRound}
                  control={control}
                  register={register}
                  errors={errors}
                  resetField={resetField}
                />
              </Tab.Panel>
            </Tab.Panels>
          </div>
        </Tab.Group>
        <ConfirmationModal
          title={"Update Round?"}
          body={confirmationModalBody}
          isOpen={isConfirmationModalOpen}
          setIsOpen={() => {
            /**/
          }}
          confirmButtonText={"Proceed to Update"}
          confirmButtonAction={() => {
            updateRoundHandler();
          }}
          cancelButtonAction={() => {
            setIsConfirmationModalOpen(false);
          }}
          modalStyle="wide"
        />
        <ProgressModal
          isOpen={isProgressModalOpen}
          subheading="Please hold while we update your round settings"
          steps={progressSteps}
        />
        <ErrorModal
          isOpen={isErrorModalOpen}
          setIsOpen={() => {
            /**/
          }}
          tryAgainFn={() => {
            /**/
          }}
          doneFn={() => {
            setIsErrorModalOpen(false);
          }}
        />
      </form>
      <hr className="mt-4" />
    </div>
  );
}

function DetailsPage(props: {
  editMode: EditMode;
  editedRound: Round;
  setEditedRound: (round: Round) => void;
  control: Control<Round, unknown>;
  register: UseFormRegister<Round>;
  errors: FieldErrors<Round>;
  onAddRequirement: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const { chain } = useNetwork();

  const numOfRequirements =
    props.editedRound?.roundMetadata.eligibility?.requirements?.length || 0;
  const lastRequirement =
    props.editedRound?.roundMetadata.eligibility?.requirements?.[
      props.editedRound?.roundMetadata.eligibility?.requirements?.length - 1
    ];
  const isValidLastRequirement =
    numOfRequirements === 0 ||
    (lastRequirement && lastRequirement.requirement !== "");

  function Cross({ color, size = "12" }: { color: string; size?: string }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          // eslint-disable-next-line max-len
          d="M0.292893 0.292893C0.683417 -0.0976311 1.31658 -0.0976311 1.70711 0.292893L6 4.58579L10.2929 0.292893C10.6834 -0.0976311 11.3166 -0.0976311 11.7071 0.292893C12.0976 0.683417 12.0976 1.31658 11.7071 1.70711L7.41421 6L11.7071 10.2929C12.0976 10.6834 12.0976 11.3166 11.7071 11.7071C11.3166 12.0976 10.6834 12.0976 10.2929 11.7071L6 7.41421L1.70711 11.7071C1.31658 12.0976 0.683417 12.0976 0.292893 11.7071C-0.0976311 11.3166 -0.0976311 10.6834 0.292893 10.2929L4.58579 6L0.292893 1.70711C-0.0976311 1.31658 -0.0976311 0.683417 0.292893 0.292893Z"
          fill={color}
        />
      </svg>
    );
  }

  return (
    <div className="w-10/12">
      <div className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
        <div>
          <div className="text-sm leading-5 pb-1 items-center gap-1 mb-2">
            <span>Round Name</span>
            <span className="text-right text-violet-400 float-right text-xs mt-1">
              *Required
            </span>
          </div>
          <div className="leading-8 font-normal">
            <Controller
              name="roundMetadata.name"
              control={props.control}
              render={({ field }) => (
                <input
                  {...field}
                  {...props.register("roundMetadata.name")}
                  type="text"
                  className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50 disabled:text-gray-400"
                  disabled={!props.editMode.canEdit}
                  data-testid={"round-name-input"}
                  onChange={(e) => {
                    field.onChange(e);
                    props.setEditedRound({
                      ...props.editedRound,
                      roundMetadata: {
                        ...props.editedRound.roundMetadata,
                        name: e.target.value,
                      },
                    });
                  }}
                />
              )}
            />
          </div>
          {props.errors.roundMetadata && (
            <p
              className="text-xs text-pink-500 mt-1"
              data-testid="round-name-error"
            >
              {props.errors.roundMetadata.name?.message}
            </p>
          )}
        </div>
        <div>
          <div
            className={"text-sm leading-5 pb-1 flex items-center gap-1 mb-2"}
          >
            Program Chain
          </div>
          <div
            className={`border border-gray-400 bg-gray-50 pl-2 rounded-lg py-0.5 opacity-50 leading-8 font-normal ${
              !props.editMode.canEdit ||
              (props.editMode.canEditOnlyRoundEndDate && "text-grey-400")
            }`}
          >
            <span className="flex items-center">
              {chain && CHAINS[chain.id as ChainId]?.logo && (
                <img
                  src={CHAINS[chain.id as ChainId]?.logo}
                  alt="chain logo"
                  data-testid="chain-logo"
                  className="h-5 w-5 flex-shrink-0 rounded-full"
                />
              )}
              {<span className="ml-3 block truncate">{chain?.name}</span>}
            </span>
          </div>
        </div>
      </div>
      <div className="text-sm leading-5 pb-1 items-center gap-1 mb-2">
        <span>Round Description</span>
        <span className="text-right text-violet-400 float-right text-xs mt-1">
          *Required
        </span>
      </div>
      <div className="leading-8 font-normal">
        <Controller
          name="roundMetadata.eligibility.description"
          control={props.control}
          render={({ field }) => (
            <input
              {...field}
              {...props.register("roundMetadata.eligibility.description")}
              type="text"
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50 disabled:text-gray-400"
              disabled={!props.editMode.canEdit}
              onChange={(e) => {
                field.onChange(e);
                props.setEditedRound({
                  ...props.editedRound,
                  roundMetadata: {
                    ...props.editedRound.roundMetadata,
                    eligibility: {
                      description: e.target.value,
                      requirements:
                        props.editedRound.roundMetadata.eligibility
                          ?.requirements ?? [],
                    },
                  },
                });
              }}
            />
          )}
        />
        {props.errors.roundMetadata && (
          <p
            className="text-xs text-pink-500 mt-1"
            data-testid="round-description-error"
          >
            {props.errors.roundMetadata.eligibility?.description?.message}
          </p>
        )}
      </div>
      <span className="mt-8 inline-flex text-gray-400 mb-4">
        Where can applicants reach you and/or your team if support is needed?
      </span>
      <div className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
        <div>
          <div className="text-sm leading-5 pb-1 items-center gap-1 mb-2">
            <span>Support Input</span>
            <span className="text-right text-violet-400 float-right text-xs mt-1">
              *Required
            </span>
          </div>
          <div className="leading-8 font-normal">
            {!props.editMode.canEdit ? (
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50 disabled:text-gray-400"
                defaultValue={props.editedRound?.roundMetadata.support?.type}
                disabled={!props.editMode.canEdit}
              />
            ) : (
              <Controller
                control={props.control}
                name="roundMetadata.support.type"
                render={({ field }) => (
                  <SupportTypeDropdown
                    register={props.register("roundMetadata.support.type")}
                    control={props.control}
                    supportTypes={supportTypes}
                    errors={props.errors}
                    editedRound={props.editedRound}
                    setEditedRound={props.setEditedRound}
                    field={field}
                    disabled={!props.editMode.canEdit}
                  />
                )}
              />
            )}
          </div>
          {props.errors.roundMetadata && (
            <p
              className="text-xs text-pink-500 mt-1"
              data-testid="support-type-error"
            >
              {props.errors.roundMetadata.support?.types?.message}
            </p>
          )}
        </div>
        <div>
          <div className="text-sm leading-5 pb-1 items-center gap-1 mb-2">
            <span>Contact Information</span>
            <span className="text-right text-violet-400 float-right text-xs mt-1">
              *Required
            </span>
          </div>
          <div className="leading-8 font-normal">
            <Controller
              name="roundMetadata.support.info"
              control={props.control}
              render={({ field }) => (
                <input
                  {...field}
                  {...props.register("roundMetadata.support.info")}
                  type="text"
                  className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50 disabled:text-gray-400"
                  disabled={!props.editMode.canEdit}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    props.setEditedRound({
                      ...props.editedRound,
                      roundMetadata: {
                        ...props.editedRound.roundMetadata,
                        support: {
                          ...props.editedRound.roundMetadata.support,
                          type:
                            props.editedRound.roundMetadata.support?.type ?? "",
                          info: e.target.value ?? "",
                        },
                      },
                    });
                  }}
                />
              )}
            />
          </div>
          {props.errors.roundMetadata && (
            <p
              className="text-xs text-pink-500 mt-1"
              data-testid="support-error"
            >
              {props.errors.roundMetadata?.support?.info?.message}
            </p>
          )}
        </div>
      </div>
      <div className="mt-6">
        <span className="text-sm text-gray-600 mb-10">
          Do you want to show your round on the Gitcoin Explorer homepage?
        </span>
        <RoundType
          control={props.control}
          register={props.register("roundMetadata.roundType")}
          editMode={props.editMode}
          editedRound={props.editedRound}
          setEditedRound={props.setEditedRound}
          errors={props.errors}
        />
      </div>
      <span className="mt-8 flex flex-col text-gray-400 mb-4">
        What requirements do you have for applicants?
      </span>
      {props.editedRound?.roundMetadata.eligibility?.requirements?.map(
        (_req, i) => (
          <div key={i} className="grid grid-cols-1 grid-rows-1 gap-4 mb-4">
            <div>
              <div
                key={i}
                className="text-sm leading-5 pb-1 items-center gap-1 mb-2"
              >
                Requirement {i + 1}
                <span className="text-right text-gray-400 float-right text-xs mt-1">
                  Optional
                </span>
              </div>
              <div className="leading-8 font-normal">
                <Controller
                  control={props.control}
                  name={`roundMetadata.eligibility.requirements.${i}.requirement`}
                  render={({ field }) => (
                    <div className="flex flex-row">
                      <input
                        {...field}
                        {...props.register(
                          `roundMetadata.eligibility.requirements.${i}.requirement`
                        )}
                        type="text"
                        className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50 disabled:text-gray-400"
                        disabled={!props.editMode.canEdit}
                        onChange={(e) => {
                          field.onChange(e);
                          const updatedRequirements = [
                            ...(props.editedRound?.roundMetadata.eligibility
                              ?.requirements || []),
                          ];
                          updatedRequirements[i] = {
                            requirement: e.target.value,
                          };
                          props.setEditedRound({
                            ...props.editedRound,
                            roundMetadata: {
                              ...props.editedRound?.roundMetadata,
                              eligibility: {
                                ...props.editedRound?.roundMetadata.eligibility,
                                requirements: updatedRequirements,
                                description:
                                  props.editedRound?.roundMetadata.eligibility
                                    ?.description || "",
                              },
                            },
                          });
                        }}
                      />
                      {props.editMode.canEdit && (
                        <button
                          data-testid="remove-requirement-button"
                          className="ml-4"
                          onClick={() => {
                            const updatedRequirements = [
                              ...(props.editedRound!.roundMetadata.eligibility!
                                .requirements || []),
                            ];
                            updatedRequirements.splice(i, 1);
                            props.control.unregister(
                              `roundMetadata.eligibility.requirements.${i}.requirement`
                            );
                            props.setEditedRound({
                              ...props.editedRound,
                              roundMetadata: {
                                ...props.editedRound?.roundMetadata,
                                eligibility: {
                                  ...props.editedRound?.roundMetadata
                                    .eligibility,
                                  requirements: updatedRequirements,
                                  description:
                                    props.editedRound?.roundMetadata.eligibility
                                      ?.description || "",
                                },
                              },
                            });
                          }}
                        >
                          <Cross color="red" />
                        </button>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
            {props.errors.roundMetadata && (
              <p
                className="text-xs text-pink-500 mt-1"
                data-testid="requirement-error"
              >
                <span>
                  {props.errors.roundMetadata.eligibility?.requirements
                    ? props.errors.roundMetadata.eligibility?.requirements[i]
                        ?.requirement?.message
                    : ""}
                </span>
              </p>
            )}
          </div>
        )
      )}
      <Button
        type="button"
        disabled={!props.editMode.canEdit || !isValidLastRequirement}
        $variant="secondary"
        $hidden={!props.editMode.canEdit}
        className="mb-4"
        data-testid="add-requirement-button"
        onClick={(e) => {
          props.onAddRequirement(e);
        }}
      >
        <span className="flex flex-row items-center">
          <FaPlus className="mr-2 mb-1" />
          Add A Requirement
        </span>
      </Button>
    </div>
  );
}

function RoundType(props: {
  register: UseFormRegisterReturn<string>;
  control?: Control<Round>;
  editMode: EditMode;
  editedRound: Round;
  errors: FieldErrors<Round>;
  setEditedRound: (round: Round) => void;
}) {
  const { field: roundTypeField } = useController({
    name: "roundMetadata.roundType",
    defaultValue: "public",
    control: props.control,
    rules: {
      required: true,
    },
  });

  const roundTypes = [
    {
      value: "public",
      label: "Yes, make my round public",
      description:
        "Anyone on the Gitcoin Explorer homepage will be able to see your round.",
    },
    {
      value: "private",
      label: "No, keep my round private",
      description: "Only people with the round link can see your round.",
    },
  ];

  const setType = (type: RoundVisibilityType) => {
    roundTypeField.onChange(type);
    props.setEditedRound({
      ...props.editedRound,
      roundMetadata: {
        ...props.editedRound.roundMetadata,
        roundType: type,
      },
    });
  };

  return (
    <>
      {" "}
      <div className="flex flex-row">
        <RadioGroup
          {...roundTypeField}
          data-testid="round-type-selection"
          disabled={!props.editMode.canEdit}
          value={props.editedRound.roundMetadata.roundType}
          onChange={setType}
        >
          <div>
            {roundTypes.map((type) => (
              <RadioGroup.Option
                {...roundTypeField}
                {...props.register}
                value={type.value}
                key={type.value}
              >
                {({ checked, active }) => (
                  <span className="flex items-center text-sm mt-2">
                    <span
                      className={classNames(
                        checked
                          ? "bg-indigo-600 border-transparent"
                          : "bg-white border-gray-300",
                        active ? "ring-2 ring-offset-2 ring-indigo-500" : "",
                        "h-4 w-4 rounded-full border flex items-center justify-center"
                      )}
                      aria-hidden="true"
                    >
                      <span className="rounded-full bg-white w-1.5 h-1.5" />
                    </span>
                    <RadioGroup.Label
                      as="span"
                      className="ml-3 block text-sm text-gray-700"
                      data-testid="round-type-private"
                    >
                      {type.label}
                      <p className="text-xs text-gray-400">
                        {type.description}
                      </p>
                    </RadioGroup.Label>
                  </span>
                )}
              </RadioGroup.Option>
            ))}
          </div>

          <p
            className="text-xs text-pink-500 mt-1"
            data-testid="round-start-date-error"
          >
            {props.errors.roundMetadata?.roundType
              ? props.errors.roundMetadata?.roundType?.message
              : " "}
          </p>
        </RadioGroup>
      </div>
    </>
  );
}

function SupportTypeDropdown(props: {
  register: UseFormRegisterReturn<string>;
  errors: FieldErrors<Round>;
  control: Control<Round>;
  supportTypes: SupportType[];
  showLabel?: boolean;
  editedRound: Round;
  setEditedRound: (round: Round) => void;
  field: ControllerRenderProps<Round, "roundMetadata.support.type">;
  disabled: boolean;
}) {
  return (
    <div
      className={`col-span-6 sm:col-span-3 relative mt-2 ${
        props.disabled && "text-grey-400"
      }`}
    >
      <Listbox
        disabled={props.disabled}
        {...props.field}
        onChange={(e) => {
          props.field.onChange(e);
          props.setEditedRound({
            ...props.editedRound,
            roundMetadata: {
              ...props.editedRound?.roundMetadata,
              support: {
                info: props.editedRound?.roundMetadata.support?.info ?? "",
                type: e,
              },
            },
          });
        }}
      >
        {({ open }) => (
          <div>
            <div className="mt-1 mb-2 shadow-sm block rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
              <SupportTypeButton
                errors={props.errors}
                supportType={props.supportTypes.find(
                  (supportType) => supportType.name === props.field.value
                )}
              />
              <Transition
                show={open}
                as={Fragment}
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <Listbox.Options className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                  {props.supportTypes.map(
                    (type) =>
                      !type.default && (
                        <Listbox.Option
                          key={type.name}
                          className={({ active }) =>
                            classNames(
                              active
                                ? "text-white bg-indigo-600"
                                : "text-gray-900",
                              "relative cursor-default select-none py-2 pl-3 pr-9"
                            )
                          }
                          value={type.name}
                          data-testid="support-type-option"
                        >
                          {({ selected, active }) => (
                            <>
                              <div className="flex items-center">
                                <span
                                  className={classNames(
                                    selected ? "font-semibold" : "font-normal",
                                    "ml-3 block truncate"
                                  )}
                                >
                                  {type.name}
                                </span>
                              </div>

                              {selected ? (
                                <span
                                  className={classNames(
                                    active ? "text-white" : "text-indigo-600",
                                    "absolute inset-y-0 right-0 flex items-center pr-4"
                                  )}
                                >
                                  <CheckIcon
                                    className="h-5 w-5"
                                    aria-hidden="true"
                                  />
                                </span>
                              ) : null}
                            </>
                          )}
                        </Listbox.Option>
                      )
                  )}
                </Listbox.Options>
              </Transition>
            </div>
          </div>
        )}
      </Listbox>
    </div>
  );
}

function RoundApplicationPeriod(props: {
  editMode: EditMode;
  editedRound: Round;
  setEditedRound: (round: Round) => void;
  noRoundEndDate: boolean;
  rollingApplicationsEnabled: boolean;
  setRollingApplicationsEnabled: (value: boolean) => void;
  control: Control<Round, unknown>;
  register: UseFormRegister<Round>;
  errors: FieldErrors<Round>;
  setValue: UseFormSetValue<Round>;
}) {
  const {
    editedRound,
    noRoundEndDate,
    rollingApplicationsEnabled,
    setRollingApplicationsEnabled,
  } = props;

  const [applicationStartDate, setApplicationStartDate] = useState(moment());
  const [applicationEndDate, setApplicationEndDate] = useState(moment());
  const [roundStartDate, setRoundStartDate] = useState(applicationStartDate);

  const yesterday = moment().subtract(1, "day");

  const disablePastDate = (current: moment.Moment) => {
    return current.isAfter(yesterday);
  };

  const disableBeforeApplicationStartDate = (current: moment.Moment) => {
    return current.isAfter(applicationStartDate);
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const disableBeforeApplicationEndDate = (current: moment.Moment) => {
    return current.isAfter(applicationEndDate);
  };

  const disableBeforeRoundStartDate = (current: moment.Moment) => {
    return current.isAfter(roundStartDate);
  };

  const timeHasPassed = (inputTime: moment.Moment) => {
    return inputTime.isBefore(moment());
  };

  return (
    <div className="w-full w-10/12">
      <span className="mt-4 inline-flex text-gray-400 mb-4">
        What are the dates for the{" "}
        {!isDirectRound(editedRound) ? "Applications and" : ""} Round voting
        period(s)?
      </span>
      <div className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
        {!isDirectRound(editedRound) && (
          <>
            <div>
              <div
                className={
                  "text-sm leading-5 pb-1 flex items-center gap-1 mb-2"
                }
              >
                Applications
              </div>
              <div className="leading-8 font-normal">
                <div>
                  {props.editMode.canEdit &&
                  (isV2 ||
                    !moment(editedRound.applicationsStartTime).isBefore(
                      new Date()
                    )) ? (
                    <div className="col-span-6 sm:col-span-3">
                      <div
                        className={`${
                          !props.editMode.canEdit ? "bg-grey-50 " : ""
                        } relative border rounded-md px-3 pb-2 mb-2 shadow-sm focus-within:ring-1 ${
                          props.errors.applicationsStartTime
                            ? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
                            : " border-gray-300 focus-within:border-indigo-600 focus-within:ring-indigo-600"
                        }`}
                      >
                        <p className="block text-[10px]">Start Date</p>
                        <Controller
                          name="applicationsStartTime"
                          control={props.control}
                          render={({ field }) => (
                            <Datetime
                              {...field}
                              {...props.register("applicationsStartTime")}
                              closeOnSelect
                              onChange={(date) => {
                                setApplicationStartDate(moment(date));
                                field.onChange(moment(date).toDate());
                                props.setEditedRound({
                                  ...props.editedRound,
                                  applicationsStartTime: moment(date).toDate(),
                                });
                              }}
                              utc={true}
                              dateFormat={"YYYY/MM/DD"}
                              timeFormat={"HH:mm UTC"}
                              isValidDate={
                                isV2
                                  ? (current: Moment) => true
                                  : disablePastDate
                              }
                              inputProps={{
                                id: "applicationsStartTime",
                                placeholder: "",
                                className: `${
                                  props.editMode.canEdit &&
                                  (isV2 ||
                                    !timeHasPassed(
                                      moment(
                                        props.editedRound.applicationsStartTime
                                      )
                                    ))
                                    ? ""
                                    : "bg-grey-50"
                                } block w-full border-0 p-0 text-gray-900 placeholder-grey-400 focus:ring-0 text-sm`,
                              }}
                            />
                          )}
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                      {props.errors.applicationsStartTime && (
                        <p
                          className="text-xs text-pink-500 mt-1"
                          data-testid="application-start-date-error"
                        >
                          {props.errors.applicationsStartTime?.message}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="col-span-6 sm:col-span-3">
                      <div
                        className={`${
                          !props.editMode.canEdit ||
                          timeHasPassed(
                            moment(props.editedRound.applicationsStartTime)
                          )
                            ? "bg-grey-50"
                            : ""
                        } relative border rounded-md shadow-sm focus-within:ring-1 ${
                          props.errors.applicationsStartTime
                            ? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
                            : "border-gray-300 focus-within:border-indigo-600 focus-within:ring-indigo-600"
                        }`}
                      >
                        <p className="text-[10px] pl-2 -mb-[7px]">Start Date</p>
                        <input
                          type="text"
                          className={`border-0 pt-0 ml-2 pl-0 -mt-2 text-sm ${
                            !props.editMode.canEdit ||
                            timeHasPassed(
                              moment(props.editedRound.applicationsStartTime)
                            )
                              ? "bg-grey-50 text-gray-400"
                              : ""
                          }`}
                          defaultValue={`${getUTCDate(
                            editedRound.applicationsStartTime
                          )} ${getUTCTime(editedRound.applicationsStartTime)}`}
                          disabled
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center mt-2">
                    <input
                      id="rollingApplications"
                      name="rollingApplications"
                      type="checkbox"
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked={rollingApplicationsEnabled}
                      disabled={
                        !props.editMode.canEdit ||
                        moment(editedRound.applicationsEndTime).isBefore(
                          new Date()
                        )
                      }
                      onChange={() => {
                        setRollingApplicationsEnabled(
                          !rollingApplicationsEnabled
                        );
                        props.setEditedRound({
                          ...props.editedRound,
                          applicationsEndTime: props.editedRound.roundEndTime,
                        });
                        props.setValue(
                          "applicationsEndTime",
                          props.editedRound.roundEndTime
                        );
                      }}
                    />
                    <label
                      htmlFor="rollingApplications"
                      className="ml-2 block text-sm text-grey-400"
                    >
                      Enable rolling applications
                    </label>
                    <InformationCircleIcon
                      data-tip
                      data-for="rollingApplicationsTooltip"
                      className="h-4 w-4 ml-1 text-grey-400"
                    />
                    <ReactTooltip
                      id="rollingApplicationsTooltip"
                      place="top"
                      effect="solid"
                      className="text-grey-400"
                    >
                      <span>
                        If enabled, applications will be accepted until the
                        round ends.
                      </span>
                    </ReactTooltip>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <div
                className={
                  "text-sm leading-5 pb-1 flex items-center gap-1 mb-2"
                }
              >
                &nbsp;
              </div>
              <div className="leading-8 font-normal">
                {props.editMode.canEdit &&
                !rollingApplicationsEnabled &&
                !moment(editedRound.applicationsEndTime).isBefore(
                  new Date()
                ) ? (
                  <div className="col-span-6 sm:col-span-3">
                    <div
                      className={`${
                        !props.editMode.canEdit ? "bg-grey-50" : ""
                      } relative border rounded-md px-3 pb-2 mb-2 shadow-sm focus-within:ring-1 ${
                        props.errors.applicationsEndTime
                          ? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
                          : "border-gray-300 focus-within:border-indigo-600 focus-within:ring-indigo-600"
                      }`}
                    >
                      <p className="block text-[10px]">End Date</p>
                      <Controller
                        name="applicationsEndTime"
                        control={props.control}
                        render={({ field }) => (
                          <Datetime
                            {...field}
                            {...props.register("applicationsEndTime")}
                            closeOnSelect
                            onChange={(date) => {
                              setApplicationEndDate(moment(date));
                              field.onChange(moment(date).toDate());
                              props.setEditedRound({
                                ...props.editedRound,
                                applicationsEndTime: moment(date).toDate(),
                              });
                            }}
                            utc={true}
                            dateFormat={"YYYY/MM/DD"}
                            timeFormat={"HH:mm UTC"}
                            isValidDate={disableBeforeApplicationStartDate}
                            inputProps={{
                              id: "applicationsEndTime",
                              placeholder: "",
                              className: `${
                                !props.editMode.canEdit ? "bg-grey-50" : ""
                              } block w-full border-0 p-0 text-gray-900 placeholder-grey-400 focus:ring-0 text-sm`,
                            }}
                          />
                        )}
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                    {props.errors.applicationsEndTime && (
                      <p
                        className="text-xs text-pink-500 mt-1"
                        data-testid="application-end-date-error"
                      >
                        {props.errors.applicationsEndTime?.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <div
                    className={`${
                      !props.editMode.canEdit ||
                      rollingApplicationsEnabled ||
                      timeHasPassed(
                        moment(props.editedRound.applicationsEndTime)
                      )
                        ? "bg-grey-50"
                        : ""
                    } relative border rounded-md shadow-sm focus-within:ring-1 ${
                      props.errors.applicationsEndTime
                        ? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
                        : "border-gray-300 focus-within:border-indigo-600 focus-within:ring-indigo-600"
                    }`}
                  >
                    <p className="text-[10px] pl-2 -mb-[7px]">End Date</p>
                    <input
                      type="text"
                      className={`${
                        !props.editMode.canEdit ||
                        rollingApplicationsEnabled ||
                        timeHasPassed(
                          moment(props.editedRound.applicationsEndTime)
                        )
                          ? "bg-grey-50 text-gray-400"
                          : ""
                      } border-0 pt-0 ml-2 pl-0 -mt-2 text-sm`}
                      defaultValue={`${getUTCDate(
                        editedRound.applicationsEndTime
                      )} ${getUTCTime(editedRound.applicationsEndTime)}`}
                      value={`${getUTCDate(
                        editedRound.applicationsEndTime
                      )} ${getUTCTime(editedRound.applicationsEndTime)}`}
                      disabled
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <div>
          <div
            className={"text-sm leading-5 pb-1 flex items-center gap-1 mb-2"}
          >
            Round
          </div>
          <div className="leading-8 font-normal">
            {props.editMode.canEdit &&
            (isV2 ||
              !moment(editedRound.roundStartTime).isBefore(new Date())) ? (
              <div className="col-span-6 sm:col-span-3">
                <div
                  className={`${
                    !props.editMode.canEdit ? "bg-grey-50" : ""
                  } relative border rounded-md px-3 pb-2 mb-2 shadow-sm focus-within:ring-1 ${
                    props.errors.roundStartTime
                      ? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
                      : "border-gray-300 focus-within:border-indigo-600 focus-within:ring-indigo-600"
                  }`}
                >
                  <p className="block text-[10px]">Start Date</p>
                  <Controller
                    name="roundStartTime"
                    control={props.control}
                    render={({ field }) => (
                      <div>
                        <Datetime
                          {...field}
                          {...props.register("roundStartTime")}
                          closeOnSelect
                          onChange={(date) => {
                            setRoundStartDate(moment(date));
                            field.onChange(moment(date).toDate());
                            props.setEditedRound({
                              ...props.editedRound,
                              roundStartTime: moment(date).toDate(),
                            });
                          }}
                          utc={true}
                          dateFormat={"YYYY/MM/DD"}
                          timeFormat={"HH:mm UTC"}
                          isValidDate={
                            isV2 ? (current: Moment) => true : disablePastDate
                          }
                          inputProps={{
                            id: "roundStartTime",
                            placeholder: "",
                            className: `${
                              !props.editMode.canEdit ? "bg-grey-50" : ""
                            } block w-full border-0 p-0 text-gray-900 placeholder-grey-400 focus:ring-0 text-sm`,
                          }}
                        />
                        <div className="absolute inset-y-2 right-0 pr-3 flex items-center pointer-events-none">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  />
                </div>
                {props.errors.roundStartTime && (
                  <p
                    className="text-xs text-pink-500 mt-1"
                    data-testid="round-start-date-error"
                  >
                    {props.errors.roundStartTime?.message}
                  </p>
                )}
              </div>
            ) : (
              <div
                className={`${
                  !props.editMode.canEdit ||
                  timeHasPassed(moment(props.editedRound.roundStartTime))
                    ? "bg-grey-50"
                    : ""
                } relative border rounded-md shadow-sm focus-within:ring-1 ${
                  props.errors.roundStartTime
                    ? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
                    : "border-gray-300 focus-within:border-indigo-600 focus-within:ring-indigo-600"
                }`}
              >
                <p className="text-[10px] pl-2 -mb-[7px]">Start Date</p>
                <input
                  type="text"
                  className={`${
                    !props.editMode.canEdit ||
                    timeHasPassed(moment(props.editedRound.roundStartTime))
                      ? "bg-grey-50 text-gray-400"
                      : ""
                  } border-0 pt-0 ml-2 pl-0 -mt-2 text-sm`}
                  defaultValue={`${getUTCDate(
                    editedRound.roundStartTime
                  )} ${getUTCTime(editedRound.roundStartTime)}`}
                  disabled
                />
              </div>
            )}
          </div>
        </div>
        <div>
          <div
            className={"text-sm leading-5 pb-1 flex items-center gap-1 mb-2"}
          >
            &nbsp;
          </div>
          <div className="leading-8 font-normal">
            {props.editMode.canEdit &&
            !moment(editedRound.roundEndTime).isBefore(new Date()) ? (
              <div className="col-span-6 sm:col-span-3">
                <div
                  className={`${
                    !props.editMode.canEdit ? "bg-grey-50 text-gray-400" : ""
                  } relative border rounded-md px-3 pb-2 mb-2 shadow-sm focus-within:ring-1 ${
                    props.errors.roundEndTime
                      ? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
                      : "border-gray-300 focus-within:border-indigo-600 focus-within:ring-indigo-600"
                  }`}
                >
                  <p className="block text-[10px]">End Date</p>
                  <Controller
                    name="roundEndTime"
                    control={props.control}
                    render={({ field }) => (
                      <div>
                        <Datetime
                          {...field}
                          {...props.register("roundEndTime")}
                          value={
                            noRoundEndDate
                              ? ""
                              : `${getUTCDate(
                                  editedRound.roundEndTime
                                )} ${getUTCTime(editedRound.roundEndTime)}`
                          }
                          closeOnSelect
                          onChange={(date) => {
                            field.onChange(moment(date).toDate());
                            !rollingApplicationsEnabled
                              ? props.setEditedRound({
                                  ...props.editedRound,
                                  roundEndTime: moment(date).toDate(),
                                })
                              : props.setEditedRound({
                                  ...props.editedRound,
                                  roundEndTime: moment(date).toDate(),
                                  applicationsEndTime: moment(date).toDate(),
                                });
                          }}
                          utc={true}
                          dateFormat={"YYYY/MM/DD"}
                          timeFormat={"HH:mm UTC"}
                          isValidDate={disableBeforeRoundStartDate}
                          inputProps={{
                            id: "roundEndTime",
                            placeholder: "",
                            className: `${
                              !props.editMode.canEdit
                                ? "bg-grey-50"
                                : "text-gray-900"
                            } block w-full border-0 p-0 placeholder-grey-400 focus:ring-0 text-sm`,
                          }}
                        />
                        <div className="absolute inset-y-2 right-0 pr-3 flex items-center pointer-events-none">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  />
                </div>
                {props.errors.roundEndTime && (
                  <p
                    className="text-xs text-pink-500 mt-1"
                    data-testid="round-end-date-error"
                  >
                    {props.errors.roundEndTime?.message}
                  </p>
                )}
              </div>
            ) : (
              <div
                className={`${
                  !props.editMode.canEdit ? "bg-grey-50 text-gray-400" : ""
                } relative border rounded-md shadow-sm focus-within:ring-1 ${
                  props.errors.roundEndTime
                    ? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
                    : "border-gray-300 focus-within:border-indigo-600 focus-within:ring-indigo-600"
                }`}
              >
                <p className="text-[10px] pl-2 -mb-[7px]">End Date</p>
                <input
                  type="text"
                  className={`${
                    !props.editMode.canEdit ? "bg-grey-50 text-gray-400" : ""
                  } border-0 pt-0 pl-2 -mt-2 text-sm`}
                  value={
                    noRoundEndDate
                      ? ""
                      : `${getUTCDate(editedRound.roundEndTime)} ${getUTCTime(
                          editedRound.roundEndTime
                        )}`
                  }
                  disabled
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function getMatchingFundToken(
  tokenAddress: string,
  chainId: number | undefined
) {
  return payoutTokens.filter(
    (t) =>
      t.address.toLowerCase() ==
        (tokenAddress == NATIVE ? zeroAddress : tokenAddress.toLowerCase()) &&
      t.chainId == chainId
  )[0];
}

function Funding(props: {
  editMode: EditMode;
  editedRound: Round;
  setEditedRound: (round: Round) => void;
  control: Control<Round, unknown>;
  register: UseFormRegister<Round>;
  resetField: UseFormResetField<Round>;
  errors: FieldErrors<Round>;
}) {
  const { editedRound } = props;

  const matchingFundPayoutToken =
    editedRound && getMatchingFundToken(editedRound.token, editedRound.chainId);

  const matchingFunds =
    (editedRound &&
      editedRound.roundMetadata.quadraticFundingConfig
        ?.matchingFundsAvailable) ??
    0;

  return (
    <div className="w-10/12">
      <span className="mt-4 inline-flex font-light text-gray-400 mb-4">
        Funding Amount
      </span>
      <div className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
        <div>
          <div className="text-sm leading-5 pb-1 items-center gap-1 mb-2">
            <span>Payout Token</span>
            <PayoutTokenInformation />
          </div>
          <div
            className={`leading-8 font-normal ${
              !props.editMode.canEdit ||
              (props.editMode.canEditOnlyRoundEndDate && "text-grey-400")
            }`}
          >
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50 disabled:text-gray-400"
              defaultValue={matchingFundPayoutToken.name}
              disabled
            />
          </div>
        </div>
        <div>
          <div className="text-sm leading-5 pb-1 items-center gap-1 mb-2">
            <span>Matching Funds Available</span>
            <span className="text-right text-violet-400 float-right text-xs mt-1">
              *Required
            </span>
          </div>

          <div className="leading-8 flex font-normal">
            <input
              size={matchingFundPayoutToken?.name?.length ?? 3}
              type="text"
              className="text-grey-400 disabled:bg-gray-50 rounded-l-md border border-gray-300 shadow-sm py-2 text-center bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              defaultValue={matchingFundPayoutToken.name}
              disabled
            />
            <Controller
              control={props.control}
              name="roundMetadata.quadraticFundingConfig.matchingFundsAvailable"
              render={({ field }) => (
                <input
                  {...field}
                  {...props.register(
                    "roundMetadata.quadraticFundingConfig.matchingFundsAvailable"
                  )}
                  value={field.value}
                  type="number"
                  step="any"
                  className={classNames(
                    "w-[88%] rounded-r-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out",
                    !props.editMode.canEdit
                      ? "disabled:bg-gray-50 disabled:text-gray-400"
                      : "bg-red"
                  )}
                  disabled={!props.editMode.canEdit}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    props.setEditedRound({
                      ...props.editedRound,
                      roundMetadata: {
                        ...props.editedRound?.roundMetadata,
                        quadraticFundingConfig: {
                          matchingFundsAvailable: Number(e.target.value),
                          matchingCap:
                            props.editedRound?.roundMetadata
                              .quadraticFundingConfig.matchingCap,
                          matchingCapAmount:
                            props.editedRound?.roundMetadata
                              .quadraticFundingConfig.matchingCapAmount,
                        },
                      },
                    });
                  }}
                />
              )}
            />
          </div>
          {props.errors.roundMetadata && (
            <p
              className="text-xs text-pink-500 mt-1"
              data-testid="matching-funds-available-error"
            >
              {
                props.errors.roundMetadata.quadraticFundingConfig
                  ?.matchingFundsAvailable?.message
              }
            </p>
          )}
        </div>
      </div>

      <span className="mt-4 inline-flex font-light text-gray-400 mb-4">
        Matching Cap
      </span>
      <div className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
        <div>
          <div className="text-sm leading-5 pb-1 items-center gap-1 mb-2">
            <span>Do you want a matching cap for projects?</span>
            <InformationCircleIcon
              data-tip
              data-background-color="#0E0333"
              data-for="matching-cap-tooltip"
              className="inline h-4 w-4 ml-2 mr-3 mb-1"
              data-testid={"matching-cap-tooltip"}
            />
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
          <div className="leading-8 font-normal">
            <Controller
              control={props.control}
              name="roundMetadata.quadraticFundingConfig.matchingCap"
              render={({ field }) => (
                <input
                  {...field}
                  {...props.register(
                    "roundMetadata.quadraticFundingConfig.matchingCap"
                  )}
                  type="radio"
                  className="mr-2"
                  value={"yes"}
                  disabled={
                    !props.editMode.canEdit &&
                    !props.editedRound?.roundMetadata?.quadraticFundingConfig
                      ?.matchingCap
                  }
                  checked={
                    props.editedRound?.roundMetadata?.quadraticFundingConfig
                      ?.matchingCap ?? true
                  }
                  readOnly={!props.editMode.canEdit}
                  onChange={(e) => {
                    props.resetField(
                      "roundMetadata.quadraticFundingConfig.matchingCapAmount"
                    );
                    field.onChange(e.target.value);
                    props.setEditedRound({
                      ...props.editedRound,
                      roundMetadata: {
                        ...props.editedRound?.roundMetadata,
                        quadraticFundingConfig: {
                          ...props.editedRound?.roundMetadata
                            .quadraticFundingConfig,
                          matchingCap: e.target.value === "yes",
                        },
                      },
                    });
                  }}
                />
              )}
            />{" "}
            Yes
            <Controller
              control={props.control}
              name="roundMetadata.quadraticFundingConfig.matchingCap"
              render={({ field }) => (
                <input
                  {...field}
                  {...props.register(
                    "roundMetadata.quadraticFundingConfig.matchingCap"
                  )}
                  type="radio"
                  className="ml-4"
                  value={"no"}
                  disabled={
                    !props.editMode.canEdit &&
                    props.editedRound?.roundMetadata?.quadraticFundingConfig
                      ?.matchingCap !== true
                  }
                  checked={
                    !props.editedRound?.roundMetadata?.quadraticFundingConfig
                      ?.matchingCap ?? false
                  }
                  onChange={(e) => {
                    props.resetField(
                      "roundMetadata.quadraticFundingConfig.matchingCapAmount"
                    );
                    field.onChange(e.target.value);
                    props.setEditedRound({
                      ...props.editedRound,
                      roundMetadata: {
                        ...props.editedRound?.roundMetadata,
                        quadraticFundingConfig: {
                          ...props.editedRound?.roundMetadata
                            .quadraticFundingConfig,
                          matchingCap: e.target.value === "yes",
                        },
                      },
                    });
                  }}
                />
              )}
            />{" "}
            No
          </div>
        </div>
        <div>
          <div className="text-sm leading-5 pb-1 gap-1 mb-2">
            <span>If so, how much?</span>
            <span className="text-right text-violet-400 float-right text-xs mt-1">
              *Required
            </span>
          </div>
          <div className="leading-8 flex font-normal">
            <input
              size={1}
              type="text"
              className="text-gray-400 disabled:bg-gray-50 text-center rounded-l-md border border-gray-300 shadow-sm py-2 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
              defaultValue={"%"}
              disabled
            />
            <Controller
              control={props.control}
              name="roundMetadata.quadraticFundingConfig.matchingCapAmount"
              render={({ field }) => (
                <input
                  {...field}
                  {...props.register(
                    "roundMetadata.quadraticFundingConfig.matchingCapAmount"
                  )}
                  type="number"
                  className={classNames(
                    "w-[88%] rounded-r-md border border-gray-300 shadow-sm py-2 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out",
                    !props.editMode.canEdit ||
                      !props.editedRound?.roundMetadata.quadraticFundingConfig
                        .matchingCap
                      ? "disabled:bg-gray-50 disabled:text-gray-400"
                      : "bg-red"
                  )}
                  disabled={
                    !props.editMode.canEdit ||
                    !props.editedRound?.roundMetadata.quadraticFundingConfig
                      .matchingCap
                  }
                  value={field.value}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    props.setEditedRound({
                      ...props.editedRound,
                      roundMetadata: {
                        ...props.editedRound?.roundMetadata,
                        quadraticFundingConfig: {
                          ...props.editedRound?.roundMetadata
                            .quadraticFundingConfig,
                          matchingCapAmount: Number(e.target.value),
                        },
                      },
                    });
                  }}
                />
              )}
            />
          </div>
          {props.errors.roundMetadata && (
            <p
              className="text-xs text-pink-500 mt-1"
              data-testid="matching-cap-amount-error"
            >
              {
                props.errors.roundMetadata?.quadraticFundingConfig
                  ?.matchingCapAmount?.message
              }
            </p>
          )}
        </div>
      </div>
      <div
        className={
          props.editedRound?.roundMetadata?.quadraticFundingConfig?.matchingCap
            ? ""
            : "hidden"
        }
      >
        <span className="mt-4 inline-flex text-sm text-gray-600 mb-8 bg-grey-50 p-2 w-full rounded-lg">
          A single project can only receive a maximum of{" "}
          {props.editedRound?.roundMetadata?.quadraticFundingConfig
            ?.matchingCapAmount ?? 0}
          % of the matching fund (
          {(
            (matchingFunds / 100) *
            (props.editedRound?.roundMetadata?.quadraticFundingConfig
              ?.matchingCapAmount ?? 0)
          ).toFixed(2)}{" "}
          {matchingFundPayoutToken.name}).
        </span>
      </div>
      <span className="mt-4 inline-flex font-light text-gray-400 mb-4">
        Minimum Donation Threshold
      </span>
      <div className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
        <div>
          <div className="text-sm leading-5 pb-1 items-center gap-1 mb-2">
            <span className="text-sm">
              Do you want a minimum donation threshold for projects?
            </span>
          </div>
          <div className="leading-8 font-normal">
            <Controller
              control={props.control}
              name="roundMetadata.quadraticFundingConfig.minDonationThreshold"
              render={({ field }) => (
                <input
                  {...field}
                  {...props.register(
                    "roundMetadata.quadraticFundingConfig.minDonationThreshold"
                  )}
                  type="radio"
                  className="mr-2"
                  value={"yes"}
                  disabled={
                    !props.editMode.canEdit &&
                    !props.editedRound?.roundMetadata?.quadraticFundingConfig
                      ?.minDonationThreshold
                  }
                  checked={
                    props.editedRound?.roundMetadata?.quadraticFundingConfig
                      ?.minDonationThreshold
                  }
                  readOnly={!props.editMode.canEdit}
                  onChange={(e) => {
                    props.resetField(
                      "roundMetadata.quadraticFundingConfig.minDonationThresholdAmount"
                    );
                    field.onChange(e.target.value);
                    props.setEditedRound({
                      ...props.editedRound,
                      roundMetadata: {
                        ...props.editedRound?.roundMetadata,
                        quadraticFundingConfig: {
                          ...props.editedRound?.roundMetadata
                            .quadraticFundingConfig,
                          minDonationThreshold: e.target.value === "yes",
                        },
                      },
                    });
                  }}
                />
              )}
            />{" "}
            Yes
            <Controller
              control={props.control}
              name="roundMetadata.quadraticFundingConfig.minDonationThreshold"
              render={({ field }) => (
                <input
                  {...field}
                  {...props.register(
                    "roundMetadata.quadraticFundingConfig.minDonationThreshold"
                  )}
                  type="radio"
                  className="ml-4"
                  value={"no"}
                  checked={
                    !props.editedRound?.roundMetadata?.quadraticFundingConfig
                      ?.minDonationThreshold || false
                  }
                  disabled={
                    !props.editMode.canEdit &&
                    props.editedRound?.roundMetadata?.quadraticFundingConfig
                      ?.minDonationThreshold
                  }
                  onChange={(e) => {
                    props.resetField(
                      "roundMetadata.quadraticFundingConfig.minDonationThresholdAmount"
                    );
                    field.onChange(e.target.value);
                    props.setEditedRound({
                      ...props.editedRound,
                      roundMetadata: {
                        ...props.editedRound?.roundMetadata,
                        quadraticFundingConfig: {
                          ...props.editedRound?.roundMetadata
                            .quadraticFundingConfig,
                          minDonationThreshold: e.target.value === "yes",
                        },
                      },
                    });
                  }}
                />
              )}
            />{" "}
            No
          </div>
        </div>
        <div>
          <div className="text-sm leading-5 pb-1 gap-1 mb-2">
            <span>If so, how much?</span>
            <span className="text-right text-violet-400 float-right text-xs mt-1">
              *Required
            </span>
          </div>
          <div className="leading-8 flex font-normal">
            <input
              type="text"
              size={3}
              className="disabled:bg-gray-50 text-gray-400 rounded-l-md border border-gray-300 shadow-sm py-2 text-center
               bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition
                duration-150 ease-in-out"
              defaultValue={"USD"}
              disabled
            />
            <Controller
              control={props.control}
              name="roundMetadata.quadraticFundingConfig.minDonationThresholdAmount"
              render={({ field }) => (
                <input
                  {...field}
                  {...props.register(
                    "roundMetadata.quadraticFundingConfig.minDonationThresholdAmount"
                  )}
                  type="number"
                  className={classNames(
                    "w-10/12 rounded-r-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5" +
                      " focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out",
                    !props.editMode.canEdit ||
                      !props.editedRound?.roundMetadata.quadraticFundingConfig
                        .minDonationThreshold
                      ? "disabled:bg-gray-50 disabled:text-gray-400"
                      : "bg-red"
                  )}
                  value={field.value}
                  disabled={
                    !props.editMode.canEdit ||
                    !props.editedRound?.roundMetadata.quadraticFundingConfig
                      .minDonationThreshold
                  }
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    props.setEditedRound({
                      ...props.editedRound,
                      roundMetadata: {
                        ...props.editedRound.roundMetadata,
                        quadraticFundingConfig: {
                          ...props.editedRound.roundMetadata
                            .quadraticFundingConfig,
                          minDonationThresholdAmount: Number(e.target.value),
                        },
                      },
                    });
                  }}
                />
              )}
            />
          </div>
          {props.errors.roundMetadata && (
            <p
              className="text-xs text-pink-500 mt-1"
              data-testid="min-donation-threshold-amount-error"
            >
              {
                props.errors.roundMetadata?.quadraticFundingConfig
                  ?.minDonationThresholdAmount?.message
              }
            </p>
          )}
        </div>
      </div>
      <div
        className={
          props.editedRound?.roundMetadata?.quadraticFundingConfig
            ?.minDonationThreshold
            ? ""
            : "hidden"
        }
      >
        <span className="mt-4 inline-flex text-sm text-gray-600 mb-8 bg-grey-50 p-2 w-full rounded-lg">
          Each donation has to be a minimum of{" "}
          {props.editedRound?.roundMetadata?.quadraticFundingConfig
            ?.minDonationThresholdAmount ?? 0}{" "}
          USD equivalent for it to be eligible for matching.
        </span>
      </div>
      <div>
        <span className="mt-2 inline-flex font-light text-gray-400 mb-2">
          Sybil Defense
        </span>
      </div>
      <div>
        <span className="inline-flex text-sm font-light text-gray-600 mb-4">
          Ensure that project supporters are not bots or sybil with Gitcoin
          Passport. Learn more about Gitcoin Passport here.
        </span>
      </div>
      <div className="grid grid-cols-1 gap-4 mb-4">
        <div>
          <div
            className={"text-sm leading-5 pb-1 flex items-center gap-1 mb-2"}
          >
            <Controller
              control={props.control}
              name="roundMetadata.quadraticFundingConfig.sybilDefense"
              render={({ field }) => (
                <input
                  {...field}
                  {...props.register(
                    "roundMetadata.quadraticFundingConfig.sybilDefense"
                  )}
                  type="radio"
                  value="yes"
                  disabled={
                    !props.editMode.canEdit &&
                    !props.editedRound?.roundMetadata?.quadraticFundingConfig
                      ?.sybilDefense
                  }
                  checked={
                    props.editedRound?.roundMetadata?.quadraticFundingConfig
                      ?.sybilDefense
                  }
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    props.setEditedRound({
                      ...props.editedRound,
                      roundMetadata: {
                        ...props.editedRound?.roundMetadata,
                        quadraticFundingConfig: {
                          ...props.editedRound?.roundMetadata
                            .quadraticFundingConfig,
                          sybilDefense: e.target.value === "yes",
                        },
                      },
                    });
                  }}
                />
              )}
            />
            Yes, enable Gitcoin Passport (Recommended)
            <br />
            Allow matching only for donation from project supporters that have
            verified their identity on Gitcoin Passport.
          </div>
          <div
            className={"text-sm leading-5 pb-1 flex items-center gap-1 mb-2"}
          >
            <Controller
              control={props.control}
              name="roundMetadata.quadraticFundingConfig.sybilDefense"
              render={({ field }) => (
                <input
                  {...field}
                  {...props.register(
                    "roundMetadata.quadraticFundingConfig.sybilDefense"
                  )}
                  type="radio"
                  value="no"
                  checked={
                    !props.editedRound?.roundMetadata?.quadraticFundingConfig
                      ?.sybilDefense
                  }
                  disabled={
                    !props.editMode.canEdit &&
                    props.editedRound?.roundMetadata?.quadraticFundingConfig
                      ?.sybilDefense
                  }
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    props.setEditedRound({
                      ...props.editedRound,
                      roundMetadata: {
                        ...props.editedRound?.roundMetadata,
                        quadraticFundingConfig: {
                          ...props.editedRound?.roundMetadata
                            .quadraticFundingConfig,
                          sybilDefense: e.target.value === "yes",
                        },
                      },
                    });
                  }}
                />
              )}
            />
            No, disable Gitcoin Passport
            <br />
            Allow matching for all donation, including potentially sybil ones.
          </div>
        </div>
        {props.errors.roundMetadata && (
          <p
            className="text-xs text-pink-500 mt-1"
            data-testid="sybil-defense-error"
          >
            {
              props.errors.roundMetadata?.quadraticFundingConfig?.sybilDefense
                ?.message
            }
          </p>
        )}
      </div>
    </div>
  );
}
