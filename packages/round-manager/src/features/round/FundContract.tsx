import { Round } from "../api/types";
import { InformationCircleIcon } from "@heroicons/react/solid";

type Props = {
  round: Round | undefined;
  chainId: string;
  roundId: string | undefined;
};
export default function FundContract({ round, chainId, roundId }: Props) {
  return (
    <div>
      <div className={"text-base leading-6 font-semibold"}>Fund Contract</div>
      <div>Contract Details</div>
      <hr className={"w-full"} />
      <div>
        You must fund the smart contract with the matching pool amount you
        pledged during round creation. However, you are always welcome to fund
        over the initial amount if you wish to do so.
      </div>
      <table>
        <tr>
          <td className={"text-sm leading-5 font-normal"}>
            Contract Address: <InformationIcon />
          </td>
          <td>{round?.id}</td>
        </tr>
        <tr>
          <td>Payout token:</td>
          <td>{round?.token}</td>
        </tr>
        <tr>
          <td>Matching pool size:</td>
          <td>
            10 000 FTM <span className={"text-gray-400"}>$5,624.85 USD</span>
          </td>
        </tr>
        <tr>
          <td>
            Protocol fee: <InformationIcon />
          </td>
          <td>10%</td>
        </tr>
        <tr>
          <td>
            Round fee: <InformationIcon />
          </td>
          <td>10%</td>
        </tr>
        <tr>
          <td>Amount in contract:</td>
          <td>
            0 FTM
            <span className={"text-gray-400"}>$0 USD</span>
          </td>
        </tr>
        <hr />
        <tr>
          <td>
            Final day to fund: <InformationIcon />
          </td>
          <td>
            12/20/2022 09:00 UTC
            <span className={"text-gray-400"}>(in 2 days 10 hrs)</span>
          </td>
        </tr>
        <tr>
          <td>Amount left to fund:</td>
          <td>
            11,000 FTM <span className={"text-gray-400"}>$5,589.96 USD</span>
          </td>
        </tr>
        <tr>
          <td>Amount to fund:</td>
          <td>
            11,000 FTM
            <span className={"text-gray-400"}>$5,589.96 USD</span>
          </td>
        </tr>
      </table>
    </div>
  );
}

function InformationIcon() {
  return <InformationCircleIcon className={"text-gray-900 w-3"} />;
}
