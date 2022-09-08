import { useForm, SubmitHandler, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { PlusSmIcon, XIcon } from "@heroicons/react/solid";

import { useWallet } from "../common/Auth";
import { useCreateProgramMutation } from "../api/services/program";
import { useSaveToIPFSMutation } from "../api/services/ipfs";
import { Input, Button } from "../common/styles";
import Navbar from "../common/Navbar";
import Footer from "../common/Footer";
import ProgressModal, { ProgressStatus } from "../common/ProgressModal";
import { datadogLogs } from "@datadog/browser-logs";
import ErrorModal from "../common/ErrorModal";
import { errorModalDelayMs } from "../../constants";

type FormData = {
  name: string;
  operators: { wallet: string }[];
};

export default function CreateProgram() {
  datadogLogs.logger.info(`====> Route: ${window.location.href}`);
  datadogLogs.logger.info(`====> URL: ${window.location.href}`);

  const [openProgressModal, setOpenProgressModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);
  const { address, chain, signer } = useWallet();

  const [
    saveToIPFS,
    {
      isError: isIPFSError,
      isLoading: isSavingToIPFS,
      isSuccess: isSavedToIPFS,
    },
  ] = useSaveToIPFSMutation();

  const [createProgram, { isLoading, isSuccess, isError: isProgramError }] =
    useCreateProgramMutation();

  const navigate = useNavigate();
  const { register, control, formState, handleSubmit } = useForm<FormData>({
    defaultValues: {
      operators: [{ wallet: address }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    name: "operators",
    control,
  });

  const { errors } = formState;

  useEffect(() => {
    if (isSuccess) {
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }

    if (isLoading) {
      setOpenProgressModal(true);
    }
  }, [isSuccess, isLoading, navigate]);

  useEffect(() => {
    if (isIPFSError || isProgramError) {
      setTimeout(() => {
        setOpenProgressModal(false);
        setOpenErrorModal(true);
      }, errorModalDelayMs);
    }
  }, [isIPFSError, isProgramError]);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      setOpenProgressModal(true);

      // Save program metadata to IPFS
      const metadataPointer = await saveToIPFS({
        content: { name: data.name },
        metadata: {
          name: "program-metadata",
        },
      }).unwrap();

      // Deploy program contract
      await createProgram({
        program: {
          store: {
            protocol: 1, // IPFS protocol ID is 1
            pointer: metadataPointer,
          },
          operatorWallets: data.operators.map((op) => op.wallet),
        },
        signerOrProvider: signer,
      }).unwrap();
    } catch (e) {
      console.error(e);
    }
  };

  const progressSteps: any = [
    {
      name: "Storing",
      description: "The metadata is being saved in a safe place.",
      status: isSavedToIPFS
        ? ProgressStatus.COMPLETE
        : isIPFSError
        ? ProgressStatus.ERROR
        : isSavingToIPFS
        ? ProgressStatus.CURRENT
        : ProgressStatus.UPCOMING,
    },
    {
      name: "Deploying",
      description: `Connecting to the ${chain.name} blockchain.`,
      status: isSuccess
        ? ProgressStatus.COMPLETE
        : isProgramError
        ? ProgressStatus.ERROR
        : isLoading
        ? ProgressStatus.CURRENT
        : ProgressStatus.UPCOMING,
    },
    {
      name: "Redirecting",
      description: "Just another moment while we finish things up.",
      status: isSuccess ? ProgressStatus.CURRENT : ProgressStatus.UPCOMING,
    },
  ];

  return (
    <div className="bg-[#F3F3F5]">
      <Navbar />
      <div className="container mx-auto h-screen px-4 pt-8">
        <header>
          <div className="flow-root">
            <h1 className="float-left text-[32px] mb-7">
              Create a Grant Program
            </h1>
            <Button
              type="button"
              $variant="outline"
              className="inline-flex float-right py-2 px-4 text-sm text-pink-500"
              onClick={() => navigate("/")}
            >
              <XIcon className="h-5 w-5 mr-1" aria-hidden="true" />
              Exit
            </Button>
          </div>
        </header>

        <main className="grid md:grid-cols-3 gap-4">
          <div>
            <p className="text-base leading-6">Details</p>
            <p className="mt-1 text-sm text-grey-400">
              Provide the name of the program as well as the round operators'
              wallet addresses.
            </p>
          </div>

          <div className="col-span-2">
            <form
              className="grid grid-cols-1 gap-4 sm:items-start shadow-sm text-grey-500"
              onSubmit={handleSubmit(onSubmit)}
            >
              <div className="grid grid-cols-1 gap-4 sm:items-start pt-7 pb-3.5 sm:px-6 bg-white">
                <div className="sm:flex sm:flex-rows">
                  <div className="sm:basis-2/3">
                    <label htmlFor="name" className="block text-xs">
                      Program Name
                    </label>
                    <Input
                      {...register("name", { required: true })}
                      $hasError={errors.name}
                      type="text"
                      disabled={isLoading}
                      placeholder="Enter the name of the Grant Program."
                      className="placeholder:italic"
                      data-testid="program-name"
                    />
                    {errors.name && (
                      <p className="text-sm text-red-600">
                        {errors.name?.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="font-bold text-base mb-4">Add Operator(s)</p>
                  <label htmlFor="operators" className="block text-xs">
                    Wallet Address
                  </label>

                  <ul>
                    {fields.map((item, index) => (
                      <li key={item.id} className="flex flex-rows">
                        <Input
                          {...register(`operators.${index}.wallet`)}
                          type="text"
                          disabled={isLoading}
                          className="basis:3/4 md:basis-2/3 placeholder:italic"
                          placeholder="Enter a valid wallet address (32 characters)."
                        />

                        <div className="basis-1/4 ml-3">
                          <Button
                            type="button"
                            $variant="outline"
                            className="inline-flex items-center px-2 py-2 mt-1 border border-grey-100 shadow-sm rounded text-pink-500"
                            onClick={() => remove(index)}
                          >
                            <XIcon className="h-5 w-5" aria-hidden="true" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <Button
                    type="button"
                    $variant="outline"
                    className="inline-flex items-center px-3.5 py-2 mt-6 mb-8 border-none shadow-sm text-sm rounded text-violet-500 bg-violet-100"
                    onClick={() => {
                      append({ wallet: "" });
                    }}
                  >
                    <PlusSmIcon className="h-5 w-5 mr-1" aria-hidden="true" />
                    Add Operator
                  </Button>
                </div>
              </div>

              <div className="px-6 align-middle pb-3.5 shadow-md">
                <span className="italic text-grey-400">
                  Note: You can't edit operator wallets after the grant is
                  created.
                </span>
                <Button
                  className="float-right"
                  type="submit"
                  disabled={isLoading || isSavingToIPFS || isSuccess}
                  data-testid="save"
                >
                  {isLoading || isSavingToIPFS ? "Saving..." : "Save"}
                </Button>
              </div>
            </form>
          </div>
          <ProgressModal
            isOpen={openProgressModal}
            setIsOpen={setOpenProgressModal}
            subheading={"Please hold while we create your Grant Program."}
            steps={progressSteps}
          />

          <ErrorModal
            isOpen={openErrorModal}
            setIsOpen={setOpenErrorModal}
            tryAgainFn={handleSubmit(onSubmit)}
          />
        </main>
      </div>
      <Footer />
    </div>
  );
}
