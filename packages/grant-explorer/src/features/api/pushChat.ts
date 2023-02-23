import * as PushApi from "@pushprotocol/restapi";
import { Project, Round } from "./types";
import { getQFVotesForProject } from "./round";

export async function getUserPgpKeys(address: string) {
  try {
    // fetching user pgp keys and returning decrypted keys
    let { encryptedPrivateKey: pgpKeys } =
      (await PushApi.user.get({
        account: address,
        env: "dev",
      })) || {};
    if (!pgpKeys) {
      const { encryptedPrivateKey } = await PushApi.user.create({
        account: address,
        env: "dev",
      });
      pgpKeys = encryptedPrivateKey;
    }
    const decryptedPgpKeys = await PushApi.chat.decryptWithWalletRPCMethod(
      pgpKeys,
      address
    );
    return decryptedPgpKeys || null;
  } catch (e) {
    console.error("Fetching user pgp keys", e);
    throw Error("Unable to fetch users PGP keys");
  }
}

export async function getGroupChatID(groupName: string, account: string) {
  try {
    const groupChatID = await PushApi.chat.getGroupByName({
      groupName,

      env: "dev",
    });

    return groupChatID.chatId; // have to check what is the response in case group is not present
  } catch (e) {
    console.log("Fetching Chat id for group", e);
    throw Error("Unable to fetch group ID");
  }
}

export async function getGroupInfo(chatId: string, account: string) {
  try {
    const groupInfo = await PushApi.chat.getGroup({
      chatId,
      env: "dev",
      // account,
    });
    return groupInfo ? groupInfo : null;
  } catch (e) {
    console.log(e);
  }
}

export async function verifyPushChatUser(project: Project, wallet: any) {
  try {
    // query based on group name to get chatID
    const {
      props: {
        context: {
          address: account,
          chain: { id: chainID },
        },
      },
    } = wallet;
    let isMember: any = false;
    const isOwner: any = false;
    let isContributor: any = false;
    let chatId: string | null = null;
    try {
      chatId = await getGroupChatID(project.projectMetadata.title, account);
    } catch (err) {
      console.log("Error in fetching group name", err);
      chatId = null;
    }
    console.log(chatId, "from verifier");
    if (chatId === null) {
      if (project.recipient === account || account.length) {
        return {
          isOwner: true,
          isMember: false,
          chatId: null,
          isContributor: false,
        };
      }
      // const totalVotes = await getQFVotesForProject(project, chainID);
      // const isContri = totalVotes.find((contri) => {
      //   if (contri.from === account) isContributor = true;
      // });
      const totalVotes = await getQFVotesForProject(project, chainID);
      const isContri = totalVotes.find((contri) => {
        if (contri.from === account) isContributor = true;
      });
      if (isContributor) {
        return {
          isOwner: false,
          isMember: false,
          chatId: null,
          isContributor: true,
        };
      }
    }

    const groupInfo = await getGroupInfo(chatId as string, account);
    if (!groupInfo) {
      return {
        isOwner,
        isMember,
        chatId,
        isContributor: false,
      };
    }
    if (groupInfo.groupCreator === `eip155:${account}`) {
      return {
        isOwner: true,
        isMember: false,
        chatId,
        isContributor: false,
      };
    }
    groupInfo.members.forEach((member) => {
      if (`eip155:${account}` === member.wallet) {
        isMember = true;
      }
    });
    return {
      isMember,
      isOwner,
      chatId,
      isContributor: true,
    };
  } catch (e) {
    console.log("Verifying Push User", e);

    throw Error("Error while verifying user");
  }
}

export async function createPushGroup(
  project: Project,
  account: string,
  round: Round
) {
  try {
    const decryptedPgpKeys = await getUserPgpKeys(account);
    const response = await PushApi.chat.createGroup({
      groupName: project.projectMetadata.title,
      groupDescription: "hey",
      members: ["0x8B786F4f9460A9e3E4238247FA520c73Ff6220B2"],
      groupImage: "https://picsum.photos/200/300",
      admins: [],
      isPublic: true,
      account: account,
      env: "dev",
      meta: `gitcoin:${project.projectRegistryId}:${round.id}`,
      pgpPrivateKey: decryptedPgpKeys, //decrypted private key
    });
    return response ? response.chatId : null;
  } catch (e) {
    console.log("Creating New group", e);
    throw Error("Unable to create PUSH group");
  }
}

export async function joinGroup(account: string, project: Project) {
  try {
    const decryptedPgpKeys = await getUserPgpKeys(account);
    const chatId = await getGroupChatID(project.projectMetadata.title, account);
    const groupInfo = await getGroupInfo(chatId, account);
    //
    const membersArray: any = groupInfo?.members.map((member) => {
      return member.wallet;
    });
    const adminsArray: any = groupInfo?.members.map(({ isAdmin, wallet }) => {
      return isAdmin && wallet;
    });
    const response = await PushApi.chat.updateGroup({
      chatId: chatId,
      groupName: groupInfo?.groupName as string,
      groupDescription: groupInfo?.groupDescription as string,
      members: [...membersArray, `eip155:${account}`],
      groupImage: groupInfo?.groupImage as string,
      admins: [...adminsArray, `eip155:${account}`],
      account: `eip155:${account}`,
      env: "dev",
      pgpPrivateKey: decryptedPgpKeys, //decrypted private key
    });
    return response ? response.chatId : null;
  } catch (e) {
    console.log("Joining chat Push group", e);
    throw Error("Unable to join group");
  }
}

export async function fetchHistoryMsgs(
  account: string,
  chatId: string,
  pgpKeys: any
) {
  try {
    const threadhash: any = await PushApi.chat.conversationHash({
      account: account,
      conversationId: chatId, // receiver's address or chatId of a group
      env: "dev",
    });
    const chatHistory = await PushApi.chat.history({
      threadhash: threadhash.threadHash,
      account,
      pgpPrivateKey: pgpKeys,
      limit: 20,
      toDecrypt: true,
      env: "dev",
    });
    return chatHistory || [];
  } catch (e) {
    console.log("Fetching History Msgs for chat", e);
    return [];
  }
}

export async function sendMsg(
  inputMsg: string,
  account: string,
  pgpKeys: any,
  chatId: string
) {
  try {
    const response = await PushApi.chat.send({
      messageContent: inputMsg,
      messageType: "Text",
      receiverAddress: chatId, // receiver's address or chatId of a group
      account: account,
      pgpPrivateKey: pgpKeys,
      apiKey:
        "tAWEnggQ9Z.UaDBNjrvlJZx3giBTIQDcT8bKQo1O1518uF1Tea7rPwfzXv2ouV5rX9ViwgJUrXm",
      env: "dev",
    });
    return response;
  } catch (e) {
    console.log("Sending msg in PUSH chat", e);
    throw Error("Unable to send msg");
  }
}
