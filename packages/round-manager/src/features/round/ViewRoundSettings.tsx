/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Listbox, Tab, Transition } from "@headlessui/react";
import { CheckIcon } from "@heroicons/react/solid";
import { yupResolver } from "@hookform/resolvers/yup";
import { classNames, getUTCDate, getUTCTime } from "common";
import { Button } from "common/src/styles";
import _ from "lodash";
import moment from "moment";
import { Fragment, useState } from "react";
import Datetime from "react-datetime";
import {
  Control,
  Controller,
  ControllerRenderProps,
  FieldErrors,
  SubmitHandler,
  UseFormRegister,
  UseFormRegisterReturn,
  useForm,
} from "react-hook-form";
import { FaEdit, FaInfoCircle, FaPlus } from "react-icons/fa";
import { useNetwork } from "wagmi";
import * as yup from "yup";
import { useRoundById } from "../../context/round/RoundContext";
import { ProgressStatus, ProgressStep, Round } from "../api/types";
import { CHAINS, SupportType, payoutTokens } from "../api/utils";
import ConfirmationModal from "../common/ConfirmationModal";
import ErrorModal from "../common/ErrorModal";
import ProgressModal from "../common/ProgressModal";
import { horizontalTabStyles } from "../common/Utils";
import {
  RoundValidationSchema,
  SupportTypeButton,
  supportTypes,
} from "./RoundDetailForm";

export default function ViewRoundSettings(props: { id?: string }) {
  const { round, fetchRoundStatus, error } = useRoundById(
    props.id?.toLowerCase()
  );
  const [editMode, setEditMode] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const [editedRound, setEditedRound] = useState<Round | undefined>({
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    ...round!,
  });
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  const matchAmount =
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    round?.roundMetadata.quadraticFundingConfig.matchingCapAmount!;

  const ValidationSchema = RoundValidationSchema.shape({
    // Overrides for validation schema that was not included in imported schema.
    roundMetadata: yup.object({
      name: yup
        .string()
        .required("This field is required.")
        .min(8, "Round name must be at least 8 characters."),
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
            then: yup.string().url().required("You must provide a valid URL."),
          }),
      }),
      eligibility: yup.object({
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
          .min(
            round?.roundMetadata?.quadraticFundingConfig
              ?.matchingFundsAvailable ?? 0,
            `Must be greater than previous value of ${round?.roundMetadata?.quadraticFundingConfig?.matchingFundsAvailable}.`
          ),
        matchingCapAmount: yup.number().when("matchingCap", {
          is: (val: any) => val === "yes",
          then: yup
            .number()
            .required("This field is required.")
            .moreThan(matchAmount, `Must be greater than ${matchAmount}`),
          otherwise: yup.number().notRequired(),
        }),
        minDonationThresholdAmount: yup
          .number()
          .when("mindonatationThreshold", {
            is: (val: any) => val === "yes",
            then: yup
              .number()
              .required("This field is required")
              .moreThan(0, "Must be greater than 0"),
            otherwise: yup.number().notRequired(),
          }),
      }),
    }),
  });

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<Round>({
    defaultValues: {
      ...round,
    },
    resolver: yupResolver(ValidationSchema),
  });

  const submit: SubmitHandler<Round> = async (values: Round) => {
    // todo: compare changes
    // todo: categorize tx's
    // todo: update metadata pointer in IPFS call
    // todo: send tx's
    const data = _.merge(editedRound, values);
    console.log("submit values", {
      values,
      editedRound,
      data,
    });
    setEditedRound(data);
  };

  if (!round) {
    return <></>;
  }
  const roundStartDateTime = round.roundStartTime
    ? `${getUTCDate(round.roundStartTime)} ${getUTCTime(round.roundStartTime)}`
    : "...";

  const onCancelEdit = () => {
    reset(round);
    setEditedRound(round);
    setEditMode(!editMode);
  };

  const onEditClick = () => {
    setEditMode(!editMode);
  };

  const updateRound = async () => {
    try {
      handleSubmit(submit(editedRound as Round));
      setEditMode(!editMode);
      setIsConfirmationModalOpen(false);
      setIsProgressModalOpen(true);
    } catch (e) {
      console.log("error", e);
    }
  };

  const onUpdateRound = () => {
    setIsConfirmationModalOpen(true);
  };

  // todo: update number of transactions based on actual number of transactions.
  const confirmationModalBody = (
    <p className="text-md">
      You will need to sign 3 transactions to update your round with the latest
      changes. Please note that once the round starts, you will not be able to
      make any more changes to your round settings.
    </p>
  );

  const addRequirement = () => {
    console.log("add requirement");
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

  // todo: update status's
  const progressSteps: ProgressStep[] = [
    {
      name: "Saving",
      description: `The round settings is being saved.`,
      status: ProgressStatus.IN_PROGRESS,
    },
    {
      name: "Submitting",
      description: `Sending transaction to update the round contract.`,
      status: ProgressStatus.IN_PROGRESS,
    },
    {
      name: "Reindexing",
      description: "Making sure our data is up to date.",
      status: ProgressStatus.IN_PROGRESS,
    },
    {
      name: "Finishing Up",
      description: "We’re wrapping up.",
      status: ProgressStatus.IS_SUCCESS,
    },
  ];

  return (
    <div className="flex flex-center flex-col mx-auto mt-3 mb-[212px]">
      <form onSubmit={handleSubmit(onUpdateRound)}>
        <div className="flex flex-row items-center justify-between">
          <p className="text-xl font-semibold leading-6 mb-4">Round Settings</p>
          <div>
            {editMode ? (
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
                <Button type="submit">Update Round</Button>
              </>
            ) : (
              <Button
                data-testid="edit-round-button"
                type="button"
                $variant="outline"
                onClick={onEditClick}
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
          <p className="text-sm text-gray-600">
            Changes can be made up until the round starts ({roundStartDateTime}
            ).
          </p>
          <p className="text-sm text-gray-600">
            Once the round starts, you’ll only be able to change the Round End
            Date.
          </p>
        </div>
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
                      Round & Application Period
                    </div>
                  )}
                </Tab>
                <Tab
                  className={({ selected }) => horizontalTabStyles(selected)}
                >
                  {({ selected }) => (
                    <div className={selected ? "text-violet-500" : ""}>
                      Funding Settings
                    </div>
                  )}
                </Tab>
              </div>
            </Tab.List>
          </div>
          <div>
            <Tab.Panels>
              <Tab.Panel>
                <DetailsPage
                  round={round}
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
                  round={round}
                  editMode={editMode}
                  editedRound={editedRound as Round}
                  setEditedRound={setEditedRound}
                  control={control}
                  register={register}
                  errors={errors}
                />
              </Tab.Panel>
              <Tab.Panel>
                <Funding
                  round={round}
                  editMode={editMode}
                  editedRound={editedRound as Round}
                  setEditedRound={setEditedRound}
                  control={control}
                  register={register}
                  errors={errors}
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
            updateRound();
          }}
          cancelButtonAction={() => {
            setIsConfirmationModalOpen(false);
            onCancelEdit();
          }}
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

//
function DetailsPage(props: {
  round: Round;
  editMode: boolean;
  editedRound: Round;
  setEditedRound: (round: Round) => void;
  control: Control<Round, any>;
  register: UseFormRegister<Round>;
  errors: FieldErrors<Round>;
  onAddRequirement: () => void;
}) {
  const { round } = props;
  const { chain } = useNetwork();

  console.log("errooooors", props.errors);

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
    <div className="w-full">
      <div className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
        <div>
          <div
            className={
              "text-sm leading-5 pb-1 flex items-center gap-1 mb-2"
            }
          >
            Round Name
          </div>
          <div className={`leading-8 font-normal ${!props.editMode && "text-grey-400"}`}>
            <Controller
              name="roundMetadata.name"
              control={props.control}
              render={({ field }) => (
                <input
                  {...field}
                  {...props.register("roundMetadata.name")}
                  type="text"
                  className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
                  disabled={!props.editMode}
                  data-testid={"round-name-input"}
                  onChange={(e) => {
                    field.onChange(e);
                    props.setEditedRound({
                      ...props.editedRound,
                      roundMetadata: {
                        ...props.editedRound.roundMetadata,
                        name: e.target.value,
                      }
                    });
                  }}
                />
              )}
            />
          </div>
          {props.errors.roundMetadata && (
            <p
              className="text-xs text-pink-500 mt-1"
              data-testid="application-end-date-error"
            >
              {props.errors.roundMetadata.name?.message}
            </p>
          )}
        </div>
        <div>
          <div
            className={
              "text-sm leading-5 pb-1 flex items-center gap-1 mb-2"
            }
          >
            Program Chain
          </div>
          <div className={`border pl-2 rounded-lg py-0.5 opacity-50 leading-8 font-normal ${!props.editMode && "text-grey-400"}`}>
            <span className="flex items-center">
              {chain && CHAINS[chain.id]?.logo && (
                <img
                  src={CHAINS[chain.id]?.logo}
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
      <div
        className={
          "text-sm leading-5 pb-1 flex items-center gap-1 mb-2"
        }
      >
        Round Description
      </div>
      <div className={`leading-8 font-normal ${!props.editMode && "text-grey-400"}`}>
        <Controller
          name="roundMetadata.eligibility.description"
          control={props.control}
          render={({ field }) => (
            <input
              {...field}
              {...props.register("roundMetadata.eligibility.description")}
              type="text"
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
              disabled={!props.editMode}
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
            data-testid="application-end-date-error"
          >
            {props.errors.roundMetadata.eligibility?.description?.message}
          </p>
        )}
      </div>
      <span className="mt-8 inline-flex text-sm text-gray-600 mb-8">
        Where can applicants reach you and/or your team if support is needed?
      </span>
      <div className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
        <div>
          <div
            className={
              "text-sm leading-5 pb-1 flex items-center gap-1 mb-2"
            }
          >
            Support Input
          </div>
          <div className={`leading-8 font-normal ${!props.editMode && "text-grey-400"}`}>
            {!props.editMode ? (
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
                defaultValue={props.editedRound?.roundMetadata.support?.type}
                disabled={!props.editMode}
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
                  />
                )}
              />
            )}
          </div>
          {props.errors.roundMetadata && (
            <p
              className="text-xs text-pink-500 mt-1"
              data-testid="application-end-date-error"
            >
              {props.errors.roundMetadata.support?.types?.message}
            </p>
          )}
        </div>
        <div>
          <div
            className={
              "text-sm leading-5 pb-1 flex items-center gap-1 mb-2"
            }
          >
            Contact Information
          </div>
          <div className={`leading-8 font-normal ${!props.editMode && "text-grey-400"}`}>
            <Controller
              name="roundMetadata.support.info"
              control={props.control}
              render={({ field }) => (
                <input
                  {...field}
                  {...props.register("roundMetadata.support.info")}
                  type="text"
                  className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
                  disabled={!props.editMode}
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
              data-testid="application-end-date-error"
            >
              {props.errors.roundMetadata?.support?.info?.message}
            </p>
          )}
        </div>
      </div>
      <span className="mt-8 flex flex-col text-sm text-gray-600 mb-8">
        What requirements do you have for applicants?
      </span>
      {props.editedRound?.roundMetadata.eligibility?.requirements?.map(
        (_req, i) => (
          <div key={i} className="grid grid-cols-1 grid-rows-1 gap-4 mb-4">
            <div>
              <div
                key={i}
                className={
                  "text-sm leading-5 pb-1 flex items-center gap-1 mb-2"
                }
              >
                Requirement {i + 1}
              </div>
              <div className={`leading-8 font-normal ${!props.editMode && "text-grey-400"}`}>
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
                        className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
                        disabled={!props.editMode}
                        onChange={(e) => {
                          field.onChange(e);
                          props.setEditedRound({
                            ...props.editedRound,
                            roundMetadata: {
                              ...props.editedRound?.roundMetadata,
                              eligibility: {
                                ...props.editedRound?.roundMetadata.eligibility,
                                requirements: [
                                  ...(props.editedRound?.roundMetadata
                                    .eligibility?.requirements || []),
                                ],
                                description:
                                  props.editedRound?.roundMetadata.eligibility
                                    ?.description || "",
                              },
                            },
                          });
                        }}
                      />
                      {props.editMode && (
                        <button
                          data-testid="remove-requirement-button"
                          className="ml-4"
                          onClick={(e) => {
                            const updatedRequirements =
                              props.editedRound!.roundMetadata.eligibility!
                                .requirements;
                            updatedRequirements?.splice(i, 1);

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
                data-testid="application-end-date-error"
              >
                {Array.isArray(
                  props.errors.roundMetadata.eligibility?.requirements
                )
                  ? props.errors.roundMetadata.eligibility?.requirements.map(
                      (err: any, _i: number) => {
                        return <span>{err.requirement.message}</span>;
                      }
                    )
                  : null}
              </p>
            )}
          </div>
        )
      )}
      <Button
        type="button"
        disabled={!props.editMode}
        $variant="secondary"
        $hidden={!props.editMode}
        className="mb-4"
        data-testid="add-requirement-button"
        onClick={() => {
          props.onAddRequirement();
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

function SupportTypeDropdown(props: {
  register: UseFormRegisterReturn<string>;
  errors: FieldErrors<Round>;
  control: Control<Round>;
  supportTypes: SupportType[];
  showLabel?: boolean;
  editedRound: Round;
  setEditedRound: (round: Round) => void;
  field: ControllerRenderProps<Round, "roundMetadata.support.type">;
}) {
  return (
    <div className="col-span-6 sm:col-span-3 relative mt-2">
      <Listbox
        {...props.field}
        onChange={(e: any) => {
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
  round: Round;
  editMode: boolean;
  editedRound: Round;
  setEditedRound: (round: Round) => void;
  control: Control<Round, any>;
  register: UseFormRegister<Round>;
  errors: FieldErrors<Round>;
}) {
  const { round } = props;

  const [applicationStartDate, setApplicationStartDate] = useState(moment());
  const [applicationEndDate, setApplicationEndDate] = useState(moment());
  const [roundStartDate, setRoundStartDate] = useState(applicationStartDate);

  const yesterday = moment().subtract(1, "day");

  const disablePastDate = (current: moment.Moment) => {
    return current.isAfter(yesterday);
  };

  function disableBeforeApplicationStartDate(current: moment.Moment) {
    return current.isAfter(applicationStartDate);
  }

  const disablePastAndBeforeRoundStartDate = (current: moment.Moment) => {
    return disablePastDate(current);
  };

  function disableBeforeApplicationEndDate(current: moment.Moment) {
    return current.isAfter(applicationEndDate);
  }

  function disableBeforeRoundStartDate(current: moment.Moment) {
    return current.isAfter(roundStartDate);
  }

  return (
    <div className="w-full">
      <span className="mt-4 inline-flex text-sm text-gray-600 mb-8">
        What are the dates for the Applications and Round voting period(s)?
      </span>
      <div className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
        <div>
          <div
            className={
              "text-sm leading-5 pb-1 flex items-center gap-1 mb-2"
            }
          >
            Applications
          </div>
          <div className={`leading-8 font-normal ${!props.editMode && "text-grey-400"}`}>
            {props.editMode ? (
              <div className="col-span-6 sm:col-span-3">
                <div
                  className={`relative border rounded-md px-3 pb-2 mb-2 shadow-sm focus-within:ring-1 ${
                    props.errors.applicationsStartTime
                      ? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
                      : "border-gray-300 focus-within:border-indigo-600 focus-within:ring-indigo-600"
                  }`}
                >
                  <p className="block text-[10px]">
                    Start Date
                  </p>
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
                        dateFormat={"YYYY-MM-DD"}
                        timeFormat={"HH:mm UTC"}
                        isValidDate={disablePastAndBeforeRoundStartDate}
                        inputProps={{
                          id: "applicationsStartTime",
                          placeholder: "",
                          className:
                            "block w-full border-0 p-0 text-gray-900 placeholder-grey-400 focus:ring-0 text-sm",
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
                    data-testid="application-end-date-error"
                  >
                    {props.errors.applicationsStartTime?.message}
                  </p>
                )}
              </div>
            ) : (
              <>
                <p className="block text-[10px] pl-2">
                  Start Date
                </p>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50 ml-2"
                  defaultValue={`${getUTCDate(
                    props.editedRound?.applicationsStartTime ??
                      round.applicationsStartTime
                  )} ${getUTCTime(
                    props.editedRound?.applicationsStartTime ??
                      round.applicationsStartTime
                  )}`}
                  disabled={!props.editMode}
                />
              </>
            )}
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
          <div className={`leading-8 font-normal ${!props.editMode && "text-grey-400"}`}>
            {props.editMode ? (
              <div className="col-span-6 sm:col-span-3">
                <div
                  className={`relative border rounded-md px-3 pb-2 mb-2 shadow-sm focus-within:ring-1 ${
                    props.errors.applicationsEndTime
                      ? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
                      : "border-gray-300 focus-within:border-indigo-600 focus-within:ring-indigo-600"
                  }`}
                >
                  <p className="block text-[10px]">
                    End Date
                  </p>
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
                        dateFormat={"YYYY-MM-DD"}
                        isValidDate={disableBeforeApplicationStartDate}
                        timeFormat={"HH:mm UTC"}
                        inputProps={{
                          id: "applicationsEndTime",
                          placeholder: "",
                          className:
                            "block w-full border-0 p-0 text-gray-900 placeholder-grey-400 focus:ring-0 text-sm",
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
              <>
                <p className="block text-[10px] pl-2">
                  End Date
                </p>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50 ml-2"
                  defaultValue={`${getUTCDate(
                    props.editedRound?.applicationsEndTime ??
                      round.applicationsEndTime
                  )} ${getUTCTime(
                    props.editedRound?.applicationsEndTime ??
                      round.applicationsEndTime
                  )}`}
                  disabled={!props.editMode}
                />
              </>
            )}
          </div>
        </div>

        <div>
          <div
            className={
              "text-sm leading-5 pb-1 flex items-center gap-1 mb-2"
            }
          >
            Round
          </div>
          <div className={`leading-8 font-normal ${!props.editMode && "text-grey-400"}`}>
            {props.editMode ? (
              <div className="col-span-6 sm:col-span-3">
                <div
                  className={`relative border rounded-md px-3 pb-2 mb-2 shadow-sm focus-within:ring-1 ${
                    props.errors.roundStartTime
                      ? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
                      : "border-gray-300 focus-within:border-indigo-600 focus-within:ring-indigo-600"
                  }`}
                >
                  <p className="block text-[10px]">
                    Start Date
                  </p>
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
                          dateFormat={"YYYY-MM-DD"}
                          timeFormat={"HH:mm UTC"}
                          isValidDate={disableBeforeApplicationEndDate}
                          inputProps={{
                            id: "roundStartTime",
                            placeholder: "",
                            className:
                              "block w-full border-0 p-0 text-gray-900 placeholder-grey-400 focus:ring-0 text-sm",
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
                    data-testid="application-end-date-error"
                  >
                    {props.errors.roundStartTime?.message}
                  </p>
                )}
              </div>
            ) : (
              <>
                <p className="block text-[10px] pl-2">
                  Start Date
                </p>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50 ml-2"
                  defaultValue={`${getUTCDate(
                    props.editedRound?.roundEndTime ?? round.roundEndTime
                  )} ${getUTCTime(
                    props.editedRound?.roundEndTime ?? round.roundEndTime
                  )}`}
                  disabled={!props.editMode}
                />
              </>
            )}
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
          <div className={`leading-8 font-normal ${!props.editMode && "text-grey-400"}`}>
            {props.editMode ? (
              <div className="col-span-6 sm:col-span-3">
                <div
                  className={`relative border rounded-md px-3 pb-2 mb-2 shadow-sm focus-within:ring-1 ${
                    props.errors.roundEndTime
                      ? "border-red-300 text-red-900 placeholder-red-300 focus-within:outline-none focus-within:border-red-500 focus-within: ring-red-500"
                      : "border-gray-300 focus-within:border-indigo-600 focus-within:ring-indigo-600"
                  }`}
                >
                  <p className="block text-[10px]">
                    End Date
                  </p>
                  <Controller
                    name="roundEndTime"
                    control={props.control}
                    render={({ field }) => (
                      <div>
                        <Datetime
                          {...field}
                          {...props.register("roundEndTime")}
                          closeOnSelect
                          onChange={(date) => {
                            field.onChange(moment(date).toDate());
                            props.setEditedRound({
                              ...props.editedRound,
                              roundEndTime: moment(date).toDate(),
                            });
                          }}
                          utc={true}
                          dateFormat={"YYYY-MM-DD"}
                          timeFormat={"HH:mm UTC"}
                          isValidDate={disableBeforeRoundStartDate}
                          inputProps={{
                            id: "roundEndTime",
                            placeholder: "",
                            className:
                              "block w-full border-0 p-0 text-gray-900 placeholder-grey-400 focus:ring-0 text-sm",
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
                    data-testid="application-end-date-error"
                  >
                    {props.errors.roundEndTime?.message}
                  </p>
                )}
              </div>
            ) : (
              <>
                <p className="block text-[10px] pl-2">
                  End Date
                </p>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50 ml-2"
                  defaultValue={`${getUTCDate(
                    props.editedRound?.roundEndTime ?? round.roundEndTime
                  )} ${getUTCTime(
                    props.editedRound?.roundEndTime ?? round.roundEndTime
                  )}`}
                  disabled={!props.editMode}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Funding(props: {
  round: Round;
  editMode: boolean;
  editedRound: Round;
  setEditedRound: (round: Round) => void;
  control: Control<Round, any>;
  register: UseFormRegister<Round>;
  errors: any;
}) {
  const { round } = props;

  const matchingFundPayoutToken =
    props.round &&
    payoutTokens.filter(
      (t) => t.address.toLocaleLowerCase() == round.token.toLocaleLowerCase()
    )[0];

  const matchingFunds =
    (props.round &&
      props.round.roundMetadata.quadraticFundingConfig
        ?.matchingFundsAvailable) ??
    0;

  return (
    <div className="w-full">
      <span className="mt-4 inline-flex text-lg font-light text-gray-600 mb-4">
        Funding Amount
      </span>
      <div className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
        <div>
          <div
            className={
              "text-sm leading-5 pb-1 flex items-center gap-1 mb-2"
            }
          >
            <span className="flex flex-row items-center">
              Payout Token
              <FaInfoCircle className="ml-2" />
            </span>
          </div>
          <div className={`leading-8 font-normal ${!props.editMode && "text-grey-400"}`}>
            <input
              type="text"
              className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
              defaultValue={matchingFundPayoutToken.name}
              disabled
            />
          </div>
        </div>
        <div>
          <div
            className={
              "text-sm leading-5 pb-1 flex items-center gap-1 mb-2"
            }
          >
            Matching Funds Available
          </div>
          <div className={`leading-8 font-normal ${!props.editMode && "text-grey-400"}`}>
            <input
              type="text"
              className="disabled:bg-gray-50 w-2/12 rounded-l-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
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
                  type="text"
                  className="w-10/12 rounded-r-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  disabled={!props.editMode}
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
              data-testid="application-end-date-error"
            >
              {
                props.errors.roundMetadata.quadraticFundingConfig
                  ?.matchingFundsAvailable?.message
              }
            </p>
          )}
        </div>
      </div>

      <span className="mt-4 inline-flex text-lg font-light text-gray-600 mb-4">
        Matching Cap
      </span>
      <div className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
        <div>
          <div
            className={
              "text-sm leading-5 pb-1 flex items-center gap-1 mb-2"
            }
          >
            <span className="flex flex-row items-center">
              Do you want a matching cap for projects?
              <FaInfoCircle className="ml-2" />
            </span>
          </div>
          <div className={`leading-8 font-normal ${!props.editMode && "text-grey-400"}`}>
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
                  checked={
                    props.editedRound?.roundMetadata?.quadraticFundingConfig
                      ?.matchingCap
                  }
                  readOnly={!props.editMode}
                  onChange={(e) => {
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
                  checked={
                    !props.editedRound?.roundMetadata?.quadraticFundingConfig
                      ?.matchingCap
                  }
                  disabled={!props.editMode}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    props.setEditedRound({
                      ...props.editedRound,
                      roundMetadata: {
                        ...props.editedRound?.roundMetadata,
                        quadraticFundingConfig: {
                          ...props.editedRound?.roundMetadata
                            .quadraticFundingConfig,
                          matchingCap: e.target.value === "yes",
                          matchingCapAmount: 0,
                        },
                      },
                    });
                  }}
                />
              )}
            />{" "}
            No
          </div>
          {props.errors.roundMetadata && (
            <p
              className="text-xs text-pink-500 mt-1"
              data-testid="application-end-date-error"
            >
              {
                props.errors.roundMetadata?.quadraticFundingConfig?.matchingCap
                  ?.message
              }
            </p>
          )}
        </div>
        <div>
          <div
            className={
              "text-sm leading-5 pb-1 flex items-center gap-1 mb-2"
            }
          >
            If so, how much?
          </div>
          <div className={`leading-8 font-normal ${!props.editMode && "text-grey-400"}`}>
            <input
              type="text"
              className="disabled:bg-gray-50 w-2/12 rounded-l-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
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
                  type="text"
                  className="w-10/12 rounded-r-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  disabled={
                    !props.editMode ||
                    !props.editedRound?.roundMetadata.quadraticFundingConfig
                      .matchingCap
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
              data-testid="application-end-date-error"
            >
              {
                props.errors.roundMetadata?.quadraticFundingConfig
                  ?.matchingCapAmount?.message
              }
            </p>
          )}
        </div>
      </div>
      <div>
        <span className="mt-4 inline-flex text-sm text-gray-600 mb-8 bg-grey-50 p-2 w-full rounded-lg">
          A single project can only receive a maximum of{" "}
          {props.editedRound?.roundMetadata?.quadraticFundingConfig
            ?.matchingCapAmount ?? 0}
          % of the matching fund (
          {matchingFunds *
            (props.editedRound?.roundMetadata?.quadraticFundingConfig
              ?.matchingCapAmount ?? 0)}{" "}
          {matchingFundPayoutToken.name}).
        </span>
      </div>
      <span className="mt-4 inline-flex text-lg font-light text-gray-600 mb-4">
        Minimum Donation Threshold
      </span>
      <div className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
        <div>
          <div
            className={
              "text-sm leading-5 pb-1 flex items-center gap-1 mb-2"
            }
          >
            <span className="flex flex-row items-center">
              Do you want a minimum donation threshold for projects?
              <FaInfoCircle className="ml-2" />
            </span>
          </div>
          <div className={`leading-8 font-normal ${!props.editMode && "text-grey-400"}`}>
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
                  checked={
                    props.editedRound?.roundMetadata?.quadraticFundingConfig
                      ?.minDonationThreshold
                  }
                  readOnly={!props.editMode}
                  onChange={(e) => {
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
                  disabled={!props.editMode}
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    props.setEditedRound({
                      ...props.editedRound,
                      roundMetadata: {
                        ...props.editedRound?.roundMetadata,
                        quadraticFundingConfig: {
                          ...props.editedRound?.roundMetadata
                            .quadraticFundingConfig,
                          minDonationThresholdAmount: 0,
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
        {props.errors.roundMetadata && (
          <p
            className="text-xs text-pink-500 mt-1"
            data-testid="application-end-date-error"
          >
            {
              props.errors.roundMetadata?.quadraticFundingConfig
                ?.minDonationThreshold?.message
            }
          </p>
        )}
        <div>
          <div
            className={
              "text-sm leading-5 pb-1 flex items-center gap-1 mb-2"
            }
          >
            If so, how much?
          </div>
          <div className={`leading-8 font-normal ${!props.editMode && "text-grey-400"}`}>
            <input
              type="text"
              className="disabled:bg-gray-50 w-2/12 rounded-l-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
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
                  type="text"
                  className="w-10/12 rounded-r-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                  value={
                    props.editedRound?.roundMetadata?.quadraticFundingConfig
                      ?.minDonationThreshold
                      ? round.roundMetadata.quadraticFundingConfig
                          .minDonationThresholdAmount
                      : 0
                  }
                  disabled={
                    !props.editMode ||
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
              data-testid="application-end-date-error"
            >
              {
                props.errors.roundMetadata?.quadraticFundingConfig
                  ?.minDonationThresholdAmount?.message
              }
            </p>
          )}
        </div>
      </div>
      <div>
        <span className="mt-4 inline-flex text-sm text-gray-600 mb-8 bg-grey-50 p-2 w-full rounded-lg">
          Each donation has to be a minimum of{" "}
          {props.editedRound?.roundMetadata?.quadraticFundingConfig
            ?.minDonationThresholdAmount ?? 0}{" "}
          USD equivalent for it to be eligible for matching.
        </span>
      </div>

      <div>
        <span className="mt-2 inline-flex text-lg font-light text-gray-600 mb-2">
          Sybil Defense
        </span>
      </div>
      <div>
        <span className="inline-flex text-sm font-light text-gray-600 mb-4">
          Ensure that project supporters are not bots or sybil with Gitcoin
          Passport. Learn more about Gitcoin Passport here.
        </span>
      </div>
      <div className="grid grid-cols-1 grid-rows-2 gap-4 mb-4">
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
                  readOnly={!props.editMode}
                  type="radio"
                  value="yes"
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
                  disabled={!props.editMode}
                  type="radio"
                  value="no"
                  checked={
                    !props.editedRound?.roundMetadata?.quadraticFundingConfig
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
            data-testid="application-end-date-error"
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
