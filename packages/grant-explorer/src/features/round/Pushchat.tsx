import React, { Dispatch, SetStateAction, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useRoundById } from "../../context/RoundContext";
import Auth from "../common/Auth";
import {
  getGroupChatID,
  fetchHistoryMsgs,
  getUserDetails,
  getGroupInfo,
  sendMsg,
} from "../api/pushChat";
import { createSocketConnection, EVENTS } from "@pushprotocol/socket";
import { Button } from "common/src/styles";

export default function PushChat(props: {
  pgpKeys: string;
  pushChatId: string;
  position: string;
  setPosition: Dispatch<SetStateAction<string>>;
  handlePushChatID: (e: string) => void;
  handlePgpKeys: () => void;
}) {
  const { chainId, roundId, applicationId } = useParams();
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const { round } = useRoundById(chainId!, roundId!);
  const project = round?.approvedProjects?.find(
    (project) => project.grantApplicationId === applicationId
  );
  const [msgs, setMsgs] = useState<
    { fromCAIP10: string; profile: string; messageContent: string }[]
  >([]);
  const [inputMsg, setInputMsg] = useState<string>("");
  const [isPresent, setIsPreset] = useState<boolean>(false);

  const wallet = Auth();

  useEffect(() => {
    fetchMsgs();
    handleWebSockets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchMsgs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.pushChatId]);

  useEffect(() => {
    const scrollDiv = document.getElementById("chat-scroll");
    if (scrollDiv) {
      scrollDiv.scrollTop = 0;
    }
  }, [msgs]);

  const fetchMsgs = async () => {
    if (!wallet || !project) {
      return;
    }
    const { props: walletProps } = wallet;
    const {
      context: { address },
    } = walletProps;

    const pushChatId =
      (await getGroupChatID(project.projectMetadata.title)) || null;
    const chatHistory: {
      profile: string;
      fromCAIP10: string;
      messageContent: string;
    }[] = await fetchHistoryMsgs(address, pushChatId as string, props.pgpKeys);
    const newMsgArr = [];
    if (chatHistory.length) {
      for (let i = 0; i < chatHistory.length; i++) {
        const userDetails =
          (await getUserDetails(chatHistory[i].fromCAIP10)) || ("" as string);
        newMsgArr.push({
          ...chatHistory[i],
          messageContent: chatHistory[i].messageContent,
          profile: userDetails,
        });
      }
    }

    let isMem = false;
    const groupInfo = await getGroupInfo(pushChatId as string);
    groupInfo?.members.forEach((mem) => {
      if (mem.wallet === `eip155:${address}`) {
        isMem = true;
      }
    });
    setIsPreset(isMem);
    setMsgs(newMsgArr);
  };

  const handleMsgSent = async () => {
    if (project) {
      const oldMsgs = [...msgs];
      const { props: walletProps } = wallet;
      const {
        context: { address },
      } = walletProps;

      const pushChatId =
        (await getGroupChatID(project.projectMetadata.title)) || null;
      const res = await sendMsg(
        inputMsg,
        address,
        props.pgpKeys,
        pushChatId as string
      );

      const profileImage = await getUserDetails(`eip155:${address}`);

      if (res) {
        setMsgs([
          {
            fromCAIP10: `eip155:${address}`,
            messageContent: inputMsg,
            profile: profileImage as string,
          },
          ...oldMsgs,
        ]);
      }
      setInputMsg("");
    }
  };

  const handleInputMsg = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMsg(e.target.value);
  };

  const handleWebSockets = () => {
    if (!wallet) {
      return;
    }
    const { props: walletProps } = wallet;
    if (!wallet.props.context) {
      return;
    }
    const {
      context: { address },
    } = walletProps;
    const pushSDKSocket = createSocketConnection({
      user: `eip155:${address}`, // Not CAIP-10 format
      env: "staging",
      apiKey:
        "jVPMCRom1B.iDRMswdehJG7NpHDiECIHwYMMv6k2KzkPJscFIDyW8TtSnk4blYnGa8DIkfuacU0",
      socketType: "chat",
      socketOptions: { autoConnect: true, reconnectionAttempts: 3 },
    });

    pushSDKSocket?.on(EVENTS.CHAT_RECEIVED_MESSAGE, async () => {
      await fetchMsgs();
    });
  };

  const textBoxLeft = (e: {
    fromCAIP10: string;
    profile: string;
    messageContent: string;
  }) => {
    const addOfUser = e.fromCAIP10
      ? `${e.fromCAIP10.substring(7, 12)}...${e.fromCAIP10.substring(
          e.fromCAIP10.length - 5,
          e.fromCAIP10.length
        )} `
      : null;
    return (
      <div className={`flex flex-row`}>
        <div className="flex justify-center align-center rounded-full w-9 h-9 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <img className="rounded-full" src={e.profile} />
        </div>
        <div
          className={`flex flex-col my-2 rounded hover:cursor-pointer ml-2.5 ${
            e.fromCAIP10 === `eip155:${wallet.props.context.address}`
              ? "self-end"
              : "self-start"
          }`}
        >
          <p className="text-xs">{addOfUser}</p>
          <p className="text-sm rounded-tr-2xl border border-solid  rounded-br-2xl rounded-bl-2xl py-1 px-3 pb-3">
            {e.messageContent}
          </p>
        </div>
      </div>
    );
  };

  const textBoxRight = (e: {
    fromCAIP10: string;
    profile: string;
    messageContent: string;
  }) => {
    const addOfUser = e.fromCAIP10
      ? `${e.fromCAIP10.substring(7, 12)}...${e.fromCAIP10.substring(
          e.fromCAIP10.length - 5,
          e.fromCAIP10.length
        )} `
      : null;

    return (
      <div className={`flex flex-row self-end`}>
        <div
          className={`flex flex-col my-2 rounded hover:cursor-pointer mr-2.5 self-end`}
        >
          <p className="text-xs text-[#6F3FF5] self-end">{addOfUser}</p>
          <p className="text-xs bg-[#6F3FF5] text-white rounded-tl-2xl border border-solid  rounded-br-2xl rounded-bl-2xl pt-2 px-3 pb-3">
            {e.messageContent}
          </p>
        </div>
        <div className="rounded-full flex justify-center align-center w-9 h-9 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          <img className="rounded-full" src={e.profile} />
        </div>
      </div>
    );
  };

  return (
    <div className="py-4 mt-4" id="push-chat">
      <div className="flex flex-row justify-between">
        <h4 className="text-2xl mb-2">Grant Group Chat</h4>
        {!props.pgpKeys && (
          <Button
            className="text-sm px-10 py-2.5"
            onClick={props.handlePgpKeys}
          >
            Decrypt keys to view group chat
          </Button>
        )}
      </div>

      {!props.pgpKeys && (
        <div>Get Decrypted PGP keys first to see the chat!</div>
      )}
      {props.pgpKeys ? (
        props.pushChatId.length ? (
          // return chats for the user
          <>
            {isPresent && (
              <div className="w-100 flex flex-col relative">
                <div className="border h-16 px-2 rounded-xl relative border-[#DEE2E6]">
                  <input
                    className="pt-0 px-1 h-8 w-full bg-transparent relative z-10 flex flex-row text-xs  outline-none"
                    onChange={(e) => {
                      handleInputMsg(e);
                    }}
                    value={inputMsg}
                    onKeyDown={({ key }) => {
                      if (key === "Enter") handleMsgSent();
                    }}
                  />

                  {!inputMsg.length && (
                    <span className="px-2 absolute top-2 left-2 text-xs text-[#DEE2E6]">
                      Write on a grants group chat...
                    </span>
                  )}
                </div>

                <button
                  onClick={handleMsgSent}
                  className={
                    "self-end bg-[#6F3FF5] mt-3.5 rounded-sm text-white text-xs cursor-pointer px-4 py-2"
                  }
                >
                  Send Message
                </button>
              </div>
            )}
            <div
              id="chat-scroll"
              className="h-96 flex flex-auto flex-col overflow-auto mt-6"
            >
              {msgs?.map(
                (e: {
                  fromCAIP10: string;
                  profile: string;
                  messageContent: string;
                }) => {
                  const newAdd = "eip155:" + wallet.props.context.address;
                  return newAdd === e.fromCAIP10
                    ? textBoxRight(e)
                    : textBoxLeft(e);
                }
              )}
            </div>
            <div className="flex flex-row"></div>
          </>
        ) : (
          // return no group has present
          <div>Chat group hasn't been created yet!</div>
        )
      ) : null}
    </div>
  );
}
