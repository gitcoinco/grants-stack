import { AddressAndRole } from "data-layer";
import { Program, ProgressStatus, ProgressStep } from "../api/types";
import { useMemo, useState } from "react";
import { useEnsName } from "wagmi";
import { Button } from "common/src/styles";
import { XIcon } from "@heroicons/react/outline";
import ConfirmationModal from "../common/ConfirmationModal";
import ProgressModal from "../common/ProgressModal";
import ErrorModal from "../common/ErrorModal";
import { datadogLogs } from "@datadog/browser-logs";
import { useAllo } from "common";
import {
  AddOrRemove,
  useUpdateRoles,
} from "../../context/program/UpdateRolesContext";
import { Hex, isAddress } from "viem";
import { PlusIcon } from "@heroicons/react/solid";

const sortDataByRole = (data: AddressAndRole[]): AddressAndRole[] => {
  return data.sort((a, b) => {
    if (a.role === "OWNER") return -1;
    if (b.role === "OWNER") return 1;
    return a.role.localeCompare(b.role);
  });
};

const filterRoles = (data: AddressAndRole[]): AddressAndRole[] => {
  return data.reduce((acc: AddressAndRole[], current) => {
    const existingIndex = acc.findIndex(
      (item) => item.address === current.address
    );

    // Check if this address is already included
    if (existingIndex === -1) {
      // If not included, simply add the current item
      acc.push(current);
    } else if (
      acc[existingIndex].role !== "OWNER" &&
      current.role === "OWNER"
    ) {
      // If the existing item is not an Owner but the current is, replace it
      acc[existingIndex] = current;
    }
    return acc;
  }, []);
};

export function ViewManageProgram(props: {
  program: Program | undefined;
  userAddress: string;
}) {
  const [member, setMember] = useState<string>();
  const [addOrRemove, setAddOrRemove] = useState<AddOrRemove>(AddOrRemove.ADD);

  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [openProgressModal, setOpenProgressModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);

  const allo = useAllo();

  const { updateRoles, contractUpdatingStatus, indexingStatus } =
    useUpdateRoles();

  const isOwner = props.program?.roles?.some(
    (role) =>
      role.address.toLowerCase() === props.userAddress.toLowerCase() &&
      role.role === "OWNER"
  );

  // Show Owner role first, then Operator
  const sortedRoles = useMemo(() => {
    return sortDataByRole(props.program?.roles || []);
  }, [props.program?.roles]);

  // If an address is an Owner & Operator, only show Owner in the UI
  const filteredRoles = useMemo(() => {
    return filterRoles(sortedRoles);
  }, [sortedRoles]);

  const isTeamMembersLoading = indexingStatus == ProgressStatus.IN_PROGRESS;

  const progressSteps: ProgressStep[] = [
    {
      name: "Updating",
      description: `Updating the team members for the profile`,
      status: contractUpdatingStatus,
    }
  ];

  const handleUpdateTeam = async () => {
    if (!allo || !member || !props.program?.id) {
      return;
    }

    try {
      setOpenProgressModal(true);
      setOpenConfirmationModal(false);
      await updateRoles({
        profileId: props.program.id as Hex,
        members: [member] as unknown as Hex[],
        addOrRemove,
        allo,
      });
      setOpenProgressModal(false);
      handleDone();
    } catch (error) {
      datadogLogs.logger.error(
        `error: handleUpdateTeam - ${error}, id: ${props.program?.id}`
      );
      console.error("handleUpdateTeam", error);
    }
  };

  const handleDone = () => {
    window.location.reload();
  };

  return (
    <div>
      <p className="font-bold text-lg mt-2 mb-2">Manage Team</p>
      <div className="overflow-x-auto">
        {isOwner && (
          <div className="my-4 w-100 max-w-[32rem]">
            <p className="text-gray-400 text-md mb-5">Invite Member</p>
            <div className="text-sm leading-5 pb-1 items-center gap-1 mb-2">
              <span>Wallet address</span>
              <span className="text-right text-violet-400 float-right text-xs mt-1">
                *Required
              </span>
            </div>
            <div className="flex items-center gap-2">
              <input
                className="border border-gray-200 rounded-lg h-10 px-3 py-2 text-sm leading-5 flex-grow"
                type="text"
                placeholder="0x"
                value={member || ""}
                onChange={(e) => setMember(e.target.value)}
              />
            </div>
            {member && !isAddress(member) && (
              <p className="mt-3 text-xs text-pink-500">
                Invalid wallet address. Please try again.
              </p>
            )}
            {filteredRoles.some(
              (role) => role.address.toLowerCase() === member?.toLowerCase()
            ) && (
              <p className="mt-3 text-xs text-pink-500">
                Duplicate wallet address. Please try again.
              </p>
            )}

            <Button
              type="button"
              className="mt-3 text-sm inline-flex bg-violet-100 text-violet-600 justify-center"
              onClick={() => {
                setAddOrRemove(AddOrRemove.ADD);
                setOpenConfirmationModal(true);
              }}
            >
              <div className="flex flex-row justify-center">
                <PlusIcon className="h-5 w-5 text-violet-400 font-medium align-middle mt-[1px]" />
                <span className="ml-2 text-violet-400 font-medium">
                  Add Member
                </span>
              </div>
            </Button>
          </div>
        )}

        <p className="text-gray-400 text-md my-5">View Members</p>

        <table className="min-w-full">
          <thead>
            <tr>
              <th
                scope="col"
                className="w-2/3 py-3 text-left text-base font-medium text-gray-500 tracking-wider"
              >
                Wallet address
              </th>
              <th
                scope="col"
                className="w-1/4 px-6 py-3 text-left text-base font-medium text-gray-500 tracking-wider"
              >
                Role
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {filteredRoles.map((item: AddressAndRole, index) => (
              <tr key={index}>
                <AddressRow address={item.address} />
                <td className="w-1/4 px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {item.role === "OWNER" ? "Owner" : "Member"}
                </td>
                {isOwner && item.role !== "OWNER" ? (
                  <td>
                    <XIcon
                      className="text-red-100 w-6 cursor-pointer"
                      onClick={() => {
                        setMember(item.address);
                        setAddOrRemove(AddOrRemove.REMOVE);
                        setOpenConfirmationModal(true);
                      }}
                    />
                  </td>
                ) : 
                <td className="bg-white"></td>}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmationModal
        title={"Confirm Decision"}
        confirmButtonText={isTeamMembersLoading ? "Confirming..." : "Confirm"}
        confirmButtonAction={handleUpdateTeam}
        body={
          <p className="text-sm text-grey-400">
            Are you sure you want
            {addOrRemove == AddOrRemove.ADD ? " add " : " remove "}
            {member} as a team member?
          </p>
        }
        isOpen={openConfirmationModal}
        setIsOpen={setOpenConfirmationModal}
      />
      <ProgressModal
        isOpen={openProgressModal}
        subheading={"Please hold while update the team members."}
        steps={progressSteps}
      />
      <ErrorModal
        isOpen={openErrorModal}
        setIsOpen={setOpenErrorModal}
        tryAgainFn={handleUpdateTeam}
        doneFn={handleDone}
      />
    </div>
  );
}

function AddressRow(props: { address: string }) {
  const { data: ensName } = useEnsName({
    address: props.address as `0x${string}`,
    chainId: 1,
  });

  return (
    <td className="w-2/4 py-4 pl-4 whitespace-nowrap text-sm text-gray-400">
      {ensName || props.address}
    </td>
  );
}
