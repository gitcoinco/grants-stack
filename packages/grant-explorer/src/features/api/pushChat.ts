import * as PushApi from "@pushprotocol/restapi";
import { Project, Round } from "./types";
import { getQFVotesForProject } from "./round";

export async function getUserPgpKeys(address: string) {
  try {
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
    return null;
  }
}

export async function getGroupChatID(groupName: string) {
  try {
    const groupChatID = await PushApi.chat.getGroupByName({
      groupName,
      env: "dev",
    });

    return groupChatID.chatId;
  } catch (e) {
    console.log("Fetching Chat id for group", e);
    return "";
    // throw Error("Unable to fetch group ID");
  }
}

export async function getGroupInfo(chatId: string) {
  try {
    const groupInfo = await PushApi.chat.getGroup({
      chatId,
      env: "dev",
    });
    return groupInfo ? groupInfo : null;
  } catch (e) {
    console.log(e);
  }
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function verifyPushChatUser(project: Project, wallet: any) {
  try {
    const {
      props: {
        context: {
          address: account,
          chain: { id: chainID },
        },
      },
    } = wallet;
    let isMember = false;
    const isOwner = false;
    let isContributor = false;
    let chatId: string | null = null;
    try {
      chatId = await getGroupChatID(project.projectMetadata.title);
    } catch (err) {
      console.log("Error in fetching group name", err);
      chatId = null;
    }
    const totalVotes = await getQFVotesForProject(
      chainID.toString(),
      project.projectRegistryId,
      account as string
    );

    if (totalVotes.length) {
      isContributor = true;
    }
    if (!chatId) {
      if (project.recipient === account || account.length) {
        return {
          isOwner: true,
          isMember: false,
          chatId: null,
          isContributor: false,
        };
      }

      if (isContributor) {
        return {
          isOwner: false,
          isMember: false,
          chatId: null,
          isContributor,
        };
      }
    }
    const groupInfo = await getGroupInfo(chatId as string);
    if (!groupInfo) {
      return {
        isOwner,
        isMember,
        chatId,
        isContributor,
      };
    }
    if (groupInfo.groupCreator === `eip155:${account}`) {
      return {
        isOwner: true,
        isMember: true,
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
      isContributor,
    };
  } catch (e) {
    console.log("Verifying Push User", e);
    return {
      isMember: false,
      isOwner: false,
      chatId: false,
      isContributor: false,
    };
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
      groupDescription: project.projectMetadata.description.slice(0, 149),
      members: [],
      groupImage: `https://ipfs.io/ipfs/${project.projectMetadata.logoImg}`,
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
    const chatId = await getGroupChatID(project.projectMetadata.title);
    const groupInfo = await getGroupInfo(chatId);
    //
    const membersArray = groupInfo?.members.map((member) => {
      return member.wallet;
    });
    const adminsArray = groupInfo?.members.map(({ isAdmin, wallet }) => {
      return isAdmin && wallet;
    });
    const response = await PushApi.chat.updateGroup({
      chatId: chatId,
      groupName: groupInfo?.groupName as string,
      groupDescription: groupInfo?.groupDescription as string,
      members: [...(membersArray as string[]), `eip155:${account}`],
      groupImage: groupInfo?.groupImage as string,
      admins: [...(adminsArray as string[]), `eip155:${account}`],
      account: `eip155:${account}`,
      env: "dev",
      pgpPrivateKey: decryptedPgpKeys, //decrypted private key
    });
    return response ? response.chatId : null;
  } catch (e) {
    console.log("Joining chat Push group", e);
  }
}

export async function fetchHistoryMsgs(
  account: string,
  chatId: string,
  pgpKeys: string
) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  pgpKeys: string,
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
  }
}

export async function getUserDetails(account: string) {
  try {
    const user = await PushApi.user.get({
      account,
      env: "dev",
    });
    // return user;
    return user.profilePicture;
  } catch (e) {
    console.log(e);
  }
}
