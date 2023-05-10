/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Tab } from "@headlessui/react";
import { yupResolver } from "@hookform/resolvers/yup";
import { getUTCDate, getUTCTime } from "common";
import { Button } from "common/src/styles";
import _ from "lodash";
import moment from "moment";
import { useState } from "react";
import Datetime from "react-datetime";
import {
  Control,
  Controller,
  SubmitHandler,
  UseFormHandleSubmit,
  UseFormRegister,
  useForm,
} from "react-hook-form";
import { useNetwork } from "wagmi";
import { useRoundById } from "../../context/round/RoundContext";
import { ProgressStatus, ProgressStep, Round } from "../api/types";
import { payoutTokens } from "../api/utils";
import ConfirmationModal from "../common/ConfirmationModal";
import ErrorModal from "../common/ErrorModal";
import ProgressModal from "../common/ProgressModal";
import { horizontalTabStyles } from "../common/Utils";
import {
  RoundValidationSchema,
  SupportTypeDropdown,
  supportTypes,
} from "./RoundDetailForm";

const ValidationSchema = RoundValidationSchema.shape({
  // todo:
});

export default function ViewRoundSettings(props: { id?: string }) {
  const { round, fetchRoundStatus, error } = useRoundById(
    props.id?.toLowerCase()
  );
  const [editMode, setEditMode] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const [existingRound] = useState<Round>({ ...round! });
  const [editedRound, setEditedRound] = useState<Round | undefined>(undefined);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

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
    // todo: trigger confirm modal
    // todo: trigger progress modal
    // todo: update metadata pointer in IPFS call
    // todo: categorize tx's
    // todo: send tx's
    const data = _.merge(round, values);
    console.log("submit values merged (prev, new)", {
      existingRound,
      mergedRoundData: data,
    });
    setEditedRound(data);
  };

  if (!round) {
    return <></>;
  }
  const roundStartDateTime = round.roundStartTime
    ? `${getUTCDate(round.roundStartTime)} ${getUTCTime(round.roundStartTime)}`
    : "...";
  // const hasRoundStarted = round.roundStartTime < new Date();

  const onCancelEdit = () => {
    reset(round);
    setEditMode(!editMode);
  };

  const onEditClick = () => {
    setEditMode(!editMode);
  };

  const updateRound = async () => {
    try {
      submit(editedRound as Round);
      setEditMode(!editMode);
      setIsConfirmationModalOpen(false);
      setIsProgressModalOpen(true);
    } catch (e) {
      console.log("error", e);
    }
  }

  const onUpdateRound = () => {
    setIsConfirmationModalOpen(true);
  };

  const confirmationModalBody = (
    <p className="text-md">
      You will need to sign 3 transactions to update your round with the latest
      changes. Please note that once the round starts, you will not be able to
      make any more changes to your round settings.
    </p>
  );

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
              <Button type="button" onClick={onUpdateRound}>
                Update Round
              </Button>
            </>
          ) : (
            <Button
              data-testid="edit-round-button"
              type="button"
              $variant="outline"
              onClick={onEditClick}
            >
              Edit Round
            </Button>
          )}
        </div>
      </div>
      {/* todo: update the below copy when ready */}
      <div className="mb-8">
        <p className="text-sm text-gray-600">
          Changes can be made up until the round starts ({roundStartDateTime}).
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
              <Tab className={({ selected }) => horizontalTabStyles(selected)}>
                {({ selected }) => (
                  <div className={selected ? "text-violet-500" : ""}>
                    Round Details
                  </div>
                )}
              </Tab>
              <Tab className={({ selected }) => horizontalTabStyles(selected)}>
                {({ selected }) => (
                  <div className={selected ? "text-violet-500" : ""}>
                    Round & Application Period
                  </div>
                )}
              </Tab>
              <Tab className={({ selected }) => horizontalTabStyles(selected)}>
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
                handleSubmit={handleSubmit}
                submitHandler={submit}
                errors={errors}
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
                handleSubmit={handleSubmit}
                submitHandler={submit}
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
                handleSubmit={handleSubmit}
                submitHandler={submit}
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
  handleSubmit: UseFormHandleSubmit<Round>;
  submitHandler: SubmitHandler<Round>;
  errors: any;
}) {
  const { round } = props;
  const { chain } = useNetwork();

  console.log("errooooors", props.errors);

  return (
    <div className="w-full">
      <form>
        <div className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
          <div>
            <div
              className={
                "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
              }
            >
              Round Name
            </div>
            <div className={"leading-8 font-normal text-grey-400"}>
              <Controller
                name="roundMetadata.name"
                control={props.control}
                render={({ field }) => (
                  <input
                    {...props.register("roundMetadata.name")}
                    type="text"
                    className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
                    defaultValue={round.roundMetadata.name}
                    disabled={!props.editMode}
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
          </div>
          <div>
            <div
              className={
                "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
              }
            >
              Program Chain
            </div>
            <div className={"leading-8 font-normal text-grey-400"}>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
                defaultValue={chain?.name}
                disabled
              />
            </div>
          </div>
        </div>
        <div
          className={
            "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
          }
        >
          Round Description
        </div>
        <div className={"leading-8 font-normal text-grey-400"}>
          <Controller
            name="roundMetadata.eligibility.description"
            control={props.control}
            render={({ field }) => (
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
                defaultValue={round.roundMetadata.eligibility?.description}
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
        </div>
        <span className="mt-8 inline-flex text-sm text-gray-600 mb-8">
          Where can applicants reach you and/or your team if support is needed?
        </span>
        <div className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
          <div>
            <div
              className={
                "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
              }
            >
              Support Input
            </div>
            <div className={"leading-8 font-normal text-grey-400"}>
              {!props.editMode ? (
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
                  defaultValue={round.roundMetadata.support?.type}
                  disabled={!props.editMode}
                />
              ) : (
                <SupportTypeDropdown
                  register={props.register("roundMetadata.support.type")}
                  control={props.control}
                  supportTypes={supportTypes}
                  errors={props.errors}
                />
              )}
            </div>
          </div>
          <div>
            <div
              className={
                "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
              }
            >
              Contact Information
            </div>
            <div className={"leading-8 font-normal text-grey-400"}>
              <Controller
                name="roundMetadata.support.info"
                control={props.control}
                render={({ field }) => (
                  <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
                    defaultValue={round.roundMetadata.support?.info}
                    disabled={!props.editMode}
                    onChange={(e) => {
                      field.onChange(e);
                      props.setEditedRound({
                        ...props.editedRound,
                        roundMetadata: {
                          ...props.editedRound.roundMetadata,
                          support: {
                            ...props.editedRound.roundMetadata.support,
                            type:
                              props.editedRound.roundMetadata.support?.type ??
                              "",
                            info: e.target.value ?? "",
                          },
                        },
                      });
                    }}
                  />
                )}
              />
            </div>
          </div>
        </div>
        {/* todo: */}
        <span className="mt-8 inline-flex text-sm text-gray-600 mb-8">
          What requirements do you have for applicants?
        </span>
        {round.roundMetadata.eligibility?.requirements?.map((req, i) => (
          <div key={i} className="grid grid-cols-1 grid-rows-1 gap-4 mb-4">
            <div>
              <div
                className={
                  "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
                }
              >
                Requirement {i + 1}
              </div>
              <div className={"leading-8 font-normal text-grey-400"}>
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
                  defaultValue={req.requirement}
                  disabled={!props.editMode}
                />
              </div>
            </div>
          </div>
        ))}
      </form>
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
  handleSubmit: UseFormHandleSubmit<Round>;
  submitHandler: SubmitHandler<Round>;
  errors: any;
}) {
  const { round } = props;

  return (
    <div className="w-full">
      <form>
        <span className="mt-4 inline-flex text-sm text-gray-600 mb-8">
          What are the dates for the Applications and Round voting period(s)?
        </span>
        <div className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
          <div>
            <div
              className={
                "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
              }
            >
              Applications
            </div>
            <div className={"leading-8 font-normal text-grey-400"}>
              {props.editMode ? (
                <Controller
                  name="applicationsStartTime"
                  control={props.control}
                  render={({ field }) => (
                    <Datetime
                      {...field}
                      onChange={(date) => {
                        field.onChange(moment(date).toDate());
                        props.setEditedRound({
                          ...props.editedRound,
                          applicationsStartTime: moment(date).toDate(),
                        });
                      }}
                      utc={true}
                      dateFormat={"YYYY-MM-DD"}
                      timeFormat={"HH:mm UTC"}
                      inputProps={{
                        id: "applicationsStartTime",
                        placeholder: "",
                        className:
                          "block w-full border-1 rounded-md border-grey-300 py-2 px-3 text-gray-900 placeholder-grey-400 focus:ring-0 text-sm",
                      }}
                    />
                  )}
                />
              ) : (
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
                  defaultValue={`${getUTCDate(
                    props.editedRound.applicationsStartTime ??
                      round.applicationsStartTime
                  )} ${getUTCTime(round.applicationsStartTime)}`}
                  disabled={!props.editMode}
                />
              )}
            </div>
          </div>
          <div>
            <div
              className={
                "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
              }
            >
              &nbsp;
            </div>
            <div className={"leading-8 font-normal text-grey-400"}>
              {props.editMode ? (
                <Controller
                  name="applicationsEndTime"
                  control={props.control}
                  render={({ field }) => (
                    <Datetime
                      {...field}
                      onChange={(date) => {
                        field.onChange(moment(date).toDate());
                        props.setEditedRound({
                          ...round,
                          applicationsEndTime: moment(date).toDate(),
                        });
                      }}
                      utc={true}
                      dateFormat={"YYYY-MM-DD"}
                      timeFormat={"HH:mm UTC"}
                      inputProps={{
                        id: "applicationsEndTime",
                        placeholder: "",
                        className:
                          "block w-full border-1 rounded-md border-grey-300 py-2 px-3 text-gray-900 placeholder-grey-400 focus:ring-0 text-sm",
                      }}
                    />
                  )}
                />
              ) : (
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
                  defaultValue={`${getUTCDate(
                    props.editedRound.applicationsEndTime ??
                      round.applicationsEndTime
                  )} ${getUTCTime(round.applicationsEndTime)}`}
                  disabled={!props.editMode}
                />
              )}
            </div>
          </div>

          <div>
            <div
              className={
                "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
              }
            >
              Round
            </div>
            <div className={"leading-8 font-normal text-grey-400"}>
              {props.editMode ? (
                <Controller
                  name="roundStartTime"
                  control={props.control}
                  render={({ field }) => (
                    <Datetime
                      {...field}
                      onChange={(date) => {
                        field.onChange(moment(date).toDate());
                        props.setEditedRound({
                          ...props.editedRound,
                          roundStartTime: moment(date).toDate(),
                        });
                      }}
                      utc={true}
                      dateFormat={"YYYY-MM-DD"}
                      timeFormat={"HH:mm UTC"}
                      inputProps={{
                        id: "roundStartTime",
                        placeholder: "",
                        className:
                          "block w-full border-1 rounded-md border-grey-300 py-2 px-3 text-gray-900 placeholder-grey-400 focus:ring-0 text-sm",
                      }}
                    />
                  )}
                />
              ) : (
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
                  defaultValue={`${getUTCDate(
                    props.editedRound.roundStartTime ?? round.roundStartTime
                  )} ${getUTCTime(round.roundStartTime)}`}
                  disabled={!props.editMode}
                />
              )}
            </div>
          </div>
          <div>
            <div
              className={
                "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
              }
            >
              &nbsp;
            </div>
            <div className={"leading-8 font-normal text-grey-400"}>
              {props.editMode ? (
                <Controller
                  name="roundEndTime"
                  control={props.control}
                  render={({ field }) => (
                    <Datetime
                      {...field}
                      onChange={(date) => {
                        field.onChange(moment(date).toDate());
                        props.setEditedRound({
                          ...round,
                          roundEndTime: moment(date).toDate(),
                        });
                      }}
                      utc={true}
                      dateFormat={"YYYY-MM-DD"}
                      timeFormat={"HH:mm UTC"}
                      inputProps={{
                        id: "roundEndTime",
                        placeholder: "",
                        className:
                          "block w-full border-1 rounded-md border-grey-300 py-2 px-3 text-gray-900 placeholder-grey-400 focus:ring-0 text-sm",
                      }}
                    />
                  )}
                />
              ) : (
                <input
                  type="text"
                  className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
                  defaultValue={`${getUTCDate(round.roundEndTime)} ${getUTCTime(
                    props.editedRound.roundEndTime ?? round.roundEndTime
                  )}`}
                  disabled={!props.editMode}
                />
              )}
            </div>
          </div>
        </div>
      </form>
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
  handleSubmit: UseFormHandleSubmit<Round>;
  submitHandler: SubmitHandler<Round>;
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
      <form>
        <span className="mt-4 inline-flex text-lg font-light text-gray-600 mb-4">
          Funding Amount
        </span>
        <div className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
          <div>
            <div
              className={
                "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
              }
            >
              Payout Token
            </div>
            <div className={"leading-8 font-normal text-grey-400"}>
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
                "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
              }
            >
              Matching Funds Available
            </div>
            <div className={"leading-8 font-normal text-grey-400"}>
              <input
                type="text"
                className="w-2/12 rounded-l-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                defaultValue={matchingFundPayoutToken.name}
                disabled
              />
              <Controller
                control={props.control}
                name="roundMetadata.quadraticFundingConfig.matchingFundsAvailable"
                render={({ field }) => (
                  <input
                    type="text"
                    className="w-10/12 rounded-r-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out"
                    defaultValue={matchingFunds}
                    disabled={!props.editMode}
                    onChange={(e) => {
                      // todo: matching funds available cannot be changed to be less than the amount already allocated
                      console.log("Matching Funds Available", e.target.value);
                      field.onChange(e.target.value);
                      props.setEditedRound({
                        ...props.round,
                        roundMetadata: {
                          ...props.round.roundMetadata,
                          quadraticFundingConfig: {
                            matchingFundsAvailable: Number(e.target.value),
                            matchingCap:
                              props.round.roundMetadata.quadraticFundingConfig
                                .matchingCap,
                          },
                        },
                      });
                    }}
                  />
                )}
              />
            </div>
          </div>
        </div>

        <span className="mt-4 inline-flex text-lg font-light text-gray-600 mb-4">
          Matching Cap
        </span>
        <div className="grid grid-cols-2 grid-rows-1 gap-4 mb-4">
          <div>
            <div
              className={
                "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
              }
            >
              Do you want a matching cap for projects?
            </div>
            <div className={"leading-8 font-normal text-grey-400"}>
              <input
                type="radio"
                className="mr-2"
                checked={round.roundMetadata.quadraticFundingConfig.matchingCap}
                disabled={!props.editMode}
                onChange={() => {
                  console.log("Do you want a matching cap for projects? YES");
                }}
              />{" "}
              Yes
              <input
                type="radio"
                className="ml-4 mr-2"
                checked={
                  !round.roundMetadata.quadraticFundingConfig.matchingCap
                }
                disabled={!props.editMode}
                onChange={() => {
                  console.log("Do you want a matching cap for projects? NO");
                }}
              />{" "}
              No
            </div>
          </div>
          <div>
            <div
              className={
                "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
              }
            >
              If so, how much?
            </div>
            <div className={"leading-8 font-normal text-grey-400"}>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
                defaultValue={
                  round.roundMetadata.quadraticFundingConfig
                    .matchingCapAmount ?? 0
                }
                disabled={!props.editMode}
                onChange={() => {
                  console.log("If so, how much?");
                }}
              />
            </div>
          </div>
        </div>
        <div>
          <span className="mt-4 inline-flex text-sm text-gray-600 mb-8">
            A single project can only receive a maximum of{" "}
            {round.roundMetadata.quadraticFundingConfig.matchingCapAmount ?? 0}%
            of the matching fund (
            {matchingFunds *
              (round.roundMetadata.quadraticFundingConfig.matchingCapAmount ??
                0)}{" "}
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
                "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
              }
            >
              Do you want a minimum donation threshold for projects?
            </div>
            <div className={"leading-8 font-normal text-grey-400"}>
              <input
                type="radio"
                className="mr-2"
                checked={
                  round.roundMetadata.quadraticFundingConfig
                    .minDonationThreshold
                }
                disabled={!props.editMode}
                onChange={() => {
                  console.log(
                    "Do you want a minimum donation threshold for projects? YES"
                  );
                }}
              />{" "}
              Yes
              <input
                type="radio"
                className="ml-4 mr-2"
                checked={
                  !round.roundMetadata.quadraticFundingConfig
                    .minDonationThreshold
                }
                disabled={!props.editMode}
                onChange={() => {
                  console.log(
                    "Do you want a minimum donation threshold for projects? NO"
                  );
                }}
              />{" "}
              No
            </div>
          </div>
          <div>
            <div
              className={
                "text-sm leading-5 font-semibold pb-1 flex items-center gap-1 mb-2"
              }
            >
              If so, how much?
            </div>
            <div className={"leading-8 font-normal text-grey-400"}>
              <input
                type="text"
                className="w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 bg-white text-sm leading-5 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition duration-150 ease-in-out disabled:bg-gray-50"
                defaultValue={
                  round.roundMetadata.quadraticFundingConfig
                    .minDonationThresholdAmount ?? 0
                }
                disabled={!props.editMode}
                onChange={() => {
                  console.log("If so, how much?");
                }}
              />
            </div>
          </div>
        </div>
        <div>
          <span className="mt-4 inline-flex text-sm text-gray-600 mb-8">
            Each donation has to be a minimum of{" "}
            {props.editedRound?.roundMetadata.quadraticFundingConfig
              .minDonationThresholdAmount ?? 0}{" "}
            USD equivalent for it to be eligible for matching.
          </span>
        </div>

        <div>
          <span className="mt-4 inline-flex text-lg font-light text-gray-600 mb-2">
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
              <input
                type="radio"
                name="sybil"
                value="yes"
                checked={
                  round.roundMetadata.quadraticFundingConfig.sybilDefense
                }
                onChange={() => {
                  console.log("Sybil Defense? YES");
                }}
              />
              Yes, enable Gitcoin Passport (Recommended)
              <br />
              Allow matching only for donation from project supporters that have
              verified their identity on Gitcoin Passport.
            </div>
            <div
              className={"text-sm leading-5 pb-1 flex items-center gap-1 mb-2"}
            >
              <input
                type="radio"
                name="sybil"
                value="no"
                checked={
                  !round.roundMetadata.quadraticFundingConfig.sybilDefense
                }
                onChange={() => {
                  console.log("Sybil Defense? NO");
                }}
              />
              No, disable Gitcoin Passport
              <br />
              Allow matching for all donation, including potentially sybil ones.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
