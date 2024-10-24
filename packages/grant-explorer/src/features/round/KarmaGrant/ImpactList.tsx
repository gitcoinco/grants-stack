import { ImpactItem } from "./ImpactItem";
import { IGapImpact, gapAppUrl, getGapProjectImpactUrl } from "../../api/gap";
import { Flex, Link, Text } from "@chakra-ui/react";

interface ImpactListProps {
  impacts: IGapImpact[];
}

export const ImpactList: React.FC<ImpactListProps> = ({ impacts }) => {
  return (
    <Flex gap={2} flexDir="column" py={6} px={3}>
      <h4 className="text-3xl">Project impacts</h4>
      {impacts.length > 0 ? (
        <table className="overflow-x-auto w-full my-5">
          <thead>
            <tr>
              <th className="text-black text-xs font-medium uppercase text-left px-6 py-3 font-body">
                Work
              </th>
              <th className="text-black text-xs font-medium uppercase text-left px-6 py-3 font-body">
                Impact & Proof
              </th>
              <th className="text-black text-xs font-medium uppercase text-left px-6 py-3 font-body">
                Verifications
              </th>
              <th className="text-black text-xs font-medium uppercase text-left px-6 py-3 font-body">
                Timeframe
              </th>
            </tr>
          </thead>
          <tbody className="">
            {impacts.map((item) => (
              <ImpactItem
                key={item.uid}
                impact={item}
                url={getGapProjectImpactUrl(item.refUID)}
              />
            ))}
          </tbody>
        </table>
      ) : (
        <Text>
          No previous impacts are being tracked for this project. If you're the
          owner of this project, visit{" "}
          <Link target="_blank" href={gapAppUrl}>
            <Text as="span" className="text-gitcoin-violet-500">
              gap.karmahq.xyz
            </Text>
          </Link>{" "}
          to add your project and post updates.
        </Text>
      )}

      <Text fontFamily="DM Mono" textAlign="center" className={"text-xs"}>
        Data provided by Karma via{" "}
        <Link href={gapAppUrl} target="_blank">
          <Text as="span" className="text-gitcoin-violet-500">
            gap.karmahq.xyz
          </Text>
        </Link>
        .
      </Text>
    </Flex>
  );
};
