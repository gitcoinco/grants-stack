import { createElement, useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { parseCollection } from "../collections/collections";
import xIcon from "../../assets/x-logo-black.png";
import PinataClient from "common/src/services/pinata";
import { getConfig } from "common/src/config";
import { AlloVersion } from "data-layer/src/data-layer.types";
import { collectionPath } from "common/src/routes/explorer";
import { Button } from "common/src/styles";

const config = getConfig();

class EmptyCollectionError extends Error {
  constructor() {
    super("Empty collection");
  }
}

class UndefinedCidError extends Error {
  constructor() {
    super("Undefined CID");
  }
}

interface Application {
  chainId: number;
  roundId: string;
  id: string;
}

type Props = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  applications: Application[];
};

const panels = {
  name: NamePanel,
  generate: CreatingLinkPanel,
  error: ErrorPanel,
  done: SharePanel,
} as const;

type State = {
  step: keyof typeof panels;
  collectionName: string | undefined;
  applications: Application[];
  cid: string | undefined;
  error: Error | undefined;
  closeModal: () => void;
  setState: (state: State) => void;
};

function initialState(
  applications: Application[],
  closeModal: () => void
): State {
  return {
    step: "name",
    collectionName: undefined,
    applications: [...applications],
    cid: undefined,
    error: undefined,
    closeModal,
    setState: (_: State) => {
      throw new Error("Not implemented");
    },
  };
}

export function CollectionShareDialog(props: Props) {
  const closeModal = () => {
    setState(initialState(props.applications, closeModal));
    props.setIsOpen(false);
  };

  const [state, setState] = useState<State>(
    initialState(props.applications, closeModal)
  );

  useEffect(() => {
    setState({ ...state, applications: [...props.applications] });
  }, [props.applications]);

  return (
    <>
      <DialogWrapper isOpen={props.isOpen} closeModal={closeModal}>
        <>{createElement(panels[state.step], { ...state, setState })}</>
      </DialogWrapper>
    </>
  );
}

function NamePanel(props: State) {
  const [name, setName] = useState("");
  const next = () => {
    props.setState({
      ...props,
      step: "generate",
      collectionName: name.trim().length > 0 ? name : undefined,
    });
  };

  return (
    <>
      <Dialog.Title
        as="h3"
        className="text-lg font-medium leading-6 text-gray-900"
      >
        Name your collection
      </Dialog.Title>
      <div className="mt-2">
        <input
          placeholder="Untitled"
          type="text"
          value={name}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              next();
            }
          }}
          onChange={(e) => setName(e.target.value)}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
        />
      </div>
      <div className="mt-4 sm:flex space-x-4">
        <DialogButton
          text="Cancel"
          theme="secondary"
          onClick={() => {
            props.closeModal();
          }}
        />
        <DialogButton
          theme="primary"
          text="Continue"
          onClick={() => {
            next();
          }}
        />
      </div>
    </>
  );
}

function ErrorPanel(props: State) {
  return (
    <div className="mt-2">
      <label className="text-sm font-medium text-gray-900 mb-2 block">
        {props.error instanceof EmptyCollectionError
          ? "You can't create an empty collection"
          : "Something went wrong "}
      </label>
    </div>
  );
}

function CreatingLinkPanel(props: State) {
  useEffect(() => {
    if (props.applications.length > 0) {
      const collection = parseCollection({
        version: "1.0.0",
        name: props.collectionName,
        applications: props.applications,
      });

      const pinataClient = new PinataClient(config);
      pinataClient
        .pinJSON(collection, {
          app: "explorer",
          type: "collection",
          version: "1.0.0",
        })
        .then((resp) => {
          props.setState({ ...props, step: "done", cid: resp.IpfsHash });
        })
        .catch((err) => {
          console.error(err);
          props.setState({ ...props, step: "error", error: err });
        });
    } else {
      props.setState({
        ...props,
        error: new EmptyCollectionError(),
        step: "error",
      });
    }
  }, [props]);
  return (
    <div className="mt-2 py-6 text-center">
      <div role="status">
        <svg
          aria-hidden="true"
          className="inline w-8 h-8 text-gray-200 animate-spin fill-blue-600"
          viewBox="0 0 100 101"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"
          />
          <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"
          />
        </svg>
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

function SharePanel(props: State) {
  const initialTooltipText = "Copy to clipboard";

  const [tooltipText, setTooltiptext] = useState(initialTooltipText);
  const [showTooltip, setShowTooltip] = useState(false);
  const [copied, setCopied] = useState(false);

  if (props.cid === undefined) {
    props.setState({ ...props, step: "error", error: new UndefinedCidError() });
    return;
  }

  const url = `${document.location.origin}${collectionPath(props.cid)}`;

  return (
    <div className="mt-2">
      <Dialog.Title
        as="h3"
        className="text-lg font-medium leading-6 text-gray-900"
      >
        Share your collection
      </Dialog.Title>
      <div className="relative mt-2">
        <input
          id="course-url"
          type="text"
          className="col-span-6 bg-gray-50 border border-gray-300 text-gray-500 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
          value={url}
          disabled
        />
        <button
          className="absolute end-2 top-1/2 -translate-y-1/2 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-lg p-2 inline-flex items-center justify-center"
          onClick={() => {
            navigator.clipboard.writeText(url);
            setTooltiptext("Link Copied!");
            setCopied(true);
            setTimeout(() => {
              setCopied(false);
              setTooltiptext(initialTooltipText);
            }, 1000);
          }}
          onMouseOver={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <span id="default-icon-course-url">
            <svg
              className="w-3.5 h-3.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 18 20"
            >
              <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z" />
            </svg>
          </span>
          <span
            id="success-icon-course-url"
            className="hidden inline-flex items-center"
          >
            <svg
              className="w-3.5 h-3.5 text-blue-700"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 16 12"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 5.917 5.724 10.5 15 1.5"
              />
            </svg>
          </span>
        </button>
        <div
          role="tooltip"
          className={
            "absolute z-10 -top-10 right-0 inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-gray-700 rounded-lg shadow-sm tooltip " +
            (copied || showTooltip ? " opacity-100" : " opacity-0")
          }
        >
          {tooltipText}
          <div className="absolute -bottom-2 right-3 w-0 h-0 border-l-[10px] border-l-transparent border-t-[10px] border-t-gray-700 border-r-[10px] border-r-transparent"></div>
        </div>
      </div>

      <div className="mt-4 sm:flex">
        <TwitterButton collectionUrl={url} />
      </div>
    </div>
  );
}

export function TwitterButton(props: { collectionUrl: string }) {
  const shareText = `Check out my favorite projects on @gitcoin's @grantsstack ${props.collectionUrl}`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText
  )}`;

  return (
    <DialogButton
      theme="primary"
      onClick={() => {
        window.open(url, "_blank");
      }}
      text="Share on X"
    >
      <img src={xIcon} alt="X logo" className="w-4 h-4 font-semibold" />
    </DialogButton>
  );
}

function DialogButton({
  children,
  text,
  theme,
  onClick,
}: {
  children?: JSX.Element;
  text: string;
  theme: "primary" | "secondary";
  onClick: () => void;
}) {
  const themes = {
    primary: "bg-blue-100",
    secondary: "bg-white border border-gray-100",
  };

  return (
    <button
      type="button"
      className={`${themes[theme]} text-gray-700 w-full rounded py-2 transition-colors focus:shadow-outline flex items-center justify-center shadow-sm px-4 sm:px-10 hover:shadow-md`}
      onClick={onClick}
    >
      {children !== undefined && <>{children}&nbsp;</>}
      <span className="ml-2">{text}</span>
    </button>
  );
}

function DialogWrapper({
  isOpen,
  closeModal,
  children,
}: {
  isOpen: boolean;
  closeModal: () => void;
  children: JSX.Element;
}) {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

export function CollectionShareButtonContainer({
  showOnlyInAlloVersion,
  applications,
}: {
  showOnlyInAlloVersion: AlloVersion;
  applications: Application[];
}) {
  const [showCollectionShareDialog, setShowCollectionShareDialog] =
    useState(false);

  if (config.allo.version !== showOnlyInAlloVersion) {
    return null;
  }

  return (
    <>
      {" "}
      <Button
        type="button"
        onClick={() => {
          setShowCollectionShareDialog(true);
        }}
        className="rainbow-button
            px-1 ml-4 items-center justify-center shadow-sm text-sm rounded border-1 text-black bg-[#C1E4FC] px-4 border-grey-100 hover:shadow-md"
        data-testid="twitter-button"
      >
        <span>Share your cart as a collection</span>
      </Button>
      <CollectionShareDialog
        isOpen={showCollectionShareDialog}
        setIsOpen={setShowCollectionShareDialog}
        applications={applications}
      />
    </>
  );
}
