import { AddressAndRole } from "data-layer";
import { Round } from "../api/types";
import { useMemo } from "react";
import { useEnsName } from "wagmi";

const sortDataByRole = (data: AddressAndRole[]): AddressAndRole[] => {
  return data.sort((a, b) => {
    if (a.role === "ADMIN") return -1;
    if (b.role === "ADMIN") return 1;
    return a.role.localeCompare(b.role);
  });
};

export default function ViewManageTeam(props: { round: Round | undefined }) {
  const sortedRoles = useMemo(() => {
    return sortDataByRole(props.round?.roles || []);
  }, [props.round?.roles]);

  return (
    <div>
      <p className="font-bold text-lg mt-2 mb-2">Manage Team</p>
      <p className="text-sm text-gray-400 mb-2">View who is on your team.</p>
      <p className="text-sm text-gray-400 mb-2">
        Only admins can add others to your team.
      </p>
      <p className="text-md mt-6 mb-4">View Members</p>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th
                scope="col"
                className="w-1/4 py-3 text-left text-base font-medium text-gray-500 tracking-wider"
              >
                Name
              </th>
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
            {sortedRoles.map((item: AddressAndRole, index) => (
              <tr key={index}>
                <td className="w-1/4 py-4 whitespace-nowrap text-sm font-medium text-gray-400">
                  User{index + 1}
                </td>
                <AddressRow address={item.address} />
                <td className="w-1/4 px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  {item.role === "ADMIN" ? "Admin" : "Operator"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AddressRow(props: { address: string }) {
  const { data: ensName } = useEnsName({
    address: props.address as `0x${string}`,
    chainId: 1,
  });
  console.log("ensName", ensName);

  return (
    <td className="w-2/4 px-6 py-4 whitespace-nowrap text-sm text-gray-400">
      {ensName || props.address}
    </td>
  );
}
