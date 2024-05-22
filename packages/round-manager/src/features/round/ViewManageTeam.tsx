import { AddressAndRole } from "data-layer";
import { ProgressStatus, ProgressStep, Round } from "../api/types";
import { useMemo, useState } from "react";
import { useEnsName } from "wagmi";
import { Button } from "common/src/styles";
import { FaEdit } from "react-icons/fa";
import { XCircleIcon } from "@heroicons/react/outline";
import ConfirmationModal from "../common/ConfirmationModal";
import ProgressModal from "../common/ProgressModal";
import ErrorModal from "../common/ErrorModal";
import { datadogLogs } from "@datadog/browser-logs";

const sortDataByRole = (data: AddressAndRole[]): AddressAndRole[] => {
  return data.sort((a, b) => {
    if (a.role === "ADMIN") return -1;
    if (b.role === "ADMIN") return 1;
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
      acc[existingIndex].role !== "ADMIN" &&
      current.role === "ADMIN"
    ) {
      // If the existing item is not an Admin but the current is, replace it
      acc[existingIndex] = current;
    }
    return acc;
  }, []);
};

export default function ViewManageTeam(props: {
  round: Round | undefined;
  userAddress: string;
}) {

  const [editMode, setEditMode] = useState<boolean>(false);
  
  const [addTeamMember, setAddTeamMember] = useState(false);
  const [removeTeamMember, setRemoveTeamMember] = useState(false);

  const [openConfirmationModal, setOpenConfirmationModal] = useState(false);
  const [openProgressModal, setOpenProgressModal] = useState(false);
  const [openErrorModal, setOpenErrorModal] = useState(false);

  const onCancelEdit = () => {
    setEditMode(false);
  };

  const onEditClick = () => {
    setEditMode(true);
  };

  const isAdmin = props.round?.roles?.some(
    (role) =>
      role.address.toLowerCase() === props.userAddress.toLowerCase() &&
      role.role === "ADMIN"
  );

  // Show Admin role first, then Operator
  const sortedRoles = useMemo(() => {
    return sortDataByRole(props.round?.roles || []);
  }, [props.round?.roles]);

  // If an address is an Admin & Operator, only show Admin in the UI
  const filteredRoles = useMemo(() => {
    return filterRoles(sortedRoles);
  }, [sortedRoles]);


  // const isTeamMembersLoading =
  // contractUpdatingStatus == ProgressStatus.IN_PROGRESS ||
  // indexingStatus == ProgressStatus.IN_PROGRESS;

  const progressSteps : ProgressStep[] = [
    // {
    //   name: "Updating",
    //   description: `Updating the team members for the round`,
    //   status: contractUpdatingStatus,
    // },
    // {
    //   name: "Indexing",
    //   description: "Indexing the data.",
    //   status: indexingStatus,
    // },
    // {
    //   name: "Redirecting",
    //   description: "Just another moment while we finish things up.",
    //   status:
    //     indexingStatus === ProgressStatus.IS_SUCCESS
    //       ? ProgressStatus.IN_PROGRESS
    //       : ProgressStatus.NOT_STARTED,
    // },
  ];

  const handleUpdateTeam = async () => {
    if (!addTeamMember &&  !removeTeamMember) {
      return;
    }

    try {
      setOpenProgressModal(true);
      setOpenConfirmationModal(false);
  // ----------> MEH FIX
  //     await bulkUpdateGrantApplications({
  //       allo,
  //       roundId: id,
  //       applications: applications,
  //       roundStrategy: getRoundStrategyType(
  //         applications[0].payoutStrategy.strategyName
  //       ),
  //       roundStrategyAddress: applications[0].payoutStrategy.id,
  //       selectedApplications: selected.filter(
  //         (application) => application.status === "REJECTED"
  //       ),
  //     });
      setEditMode(false);
      setOpenProgressModal(false);
    } catch (error) {
      datadogLogs.logger.error(`error: handleUpdateTeam - ${error}, id: ${props.round?.id}`);
      console.error("handleUpdateTeam", error);
    }
  };

  const handleDone = () => {
    window.location.reload();
  };

  return (
    <div>
      <p className="font-bold text-lg mt-2 mb-2">Manage Team</p>
      <div className="flex flex-row items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-2">
            {isAdmin
              ? "Add or remove admins and operators to your team. "
              : "View who is on your team."}
          </p>
          <p className="text-sm text-gray-400 mb-2">
            {isAdmin
              ? "Make sure to have at least two admins at all times for security purposes."
              : "Admins and operators have the same privileges, but only admins can add or remove operators."}
          </p>
        </div>
        <div>
          {editMode ? (
            <Button
              className="mr-4"
              type="button"
              $variant="outline"
              onClick={onCancelEdit}
              data-testid="cancel-button"
            >
              Cancel
            </Button>
          ) : (
            <Button
              data-testid="edit-round-button"
              type="button"
              $variant="outline"
              onClick={onEditClick}
              disabled={!isAdmin}
            >
              <span className="flex flex-row items-center">
                <FaEdit className="mr-2 mb-1" />
                <span>Edit Round</span>
              </span>
            </Button>
          )}
        </div>
      </div>
      <p className="text-md mt-6 mb-4">View Members</p>
      <div className="overflow-x-auto">

        {editMode && (
          <div className="grid grid-cols-1 grid-rows-1 gap-4 mb-4">
            <div className="text-sm leading-5 pb-1 items-center gap-1 mb-2">
              <span>Wallet address</span>
              <span className="text-right text-violet-400 float-right text-xs mt-1">
                *Required
              </span>
            </div>

            <input
              className="border border-gray-200 rounded-lg w-full h-10 px-3 py-2 text-sm leading-5"
              type="text"
              placeholder="0x"
              value="Wallet Address"
            />

            // MEH FIX: ADD BUTTON
          </div>
        )}

        <table className="min-w-full">
          <thead>
            <tr>
              <th
                scope="col"
                className="w-2/3 px-6 py-3 text-left text-base font-medium text-gray-500 tracking-wider"
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
                  {item.role === "ADMIN" ? "Admin" : "Operator"}
                </td>
                {editMode && !isAdmin && (
                  <td>
                    <XCircleIcon
                      className="text-red-100"
                      onClick={openConfirmationModal}
                    />
                  </td>
                )}
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
          <>
            <p className="text-sm text-grey-400">
              {"Are you sure you want update the team members?"} // meh : update text
            </p>
          </>
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
    <td className="w-2/4 px-6 py-4 whitespace-nowrap text-sm text-gray-400">
      {ensName || props.address}
    </td>
  );
}
