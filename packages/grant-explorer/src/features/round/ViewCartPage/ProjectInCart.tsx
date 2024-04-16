import React from "react";
import { CartProject } from "../../api/types";
import DefaultLogoImage from "../../../assets/default_logo.png";
import { Link } from "react-router-dom";
import { EyeIcon } from "@heroicons/react/24/solid";
import { TrashIcon } from "@heroicons/react/24/outline";
import { renderToPlainText, VotingToken } from "common";
import { Input } from "common/src/styles";
import { useCartStorage } from "../../../store";

export function ProjectInCart(
  props: React.ComponentProps<"div"> & {
    project: CartProject;
    index: number;
    projects: CartProject[];
    roundRoutePath: string;
    last?: boolean;
    selectedPayoutToken: VotingToken;
    payoutTokenPrice: number;
    removeProjectFromCart: (project: CartProject) => void;
    showMatchingEstimate: boolean;
    matchingEstimateUSD: number | undefined;
  }
) {
  const { project, roundRoutePath } = props;

  const focusedElement = document?.activeElement?.id;
  const inputID = "input-" + props.index;

  const store = useCartStorage();

  return (
    <div data-testid="cart-project">
      <div className="mb-4 flex flex-col lg:flex-row justify-between sm:px-2 px-2 py-4 rounded-md">
        <div className="flex">
          <div className="relative overflow-hidden bg-no-repeat bg-cover  min-w-[64px] w-16 max-h-[64px] mt-auto mb-auto">
            <img
              className="inline-block rounded-full"
              src={
                props.project.projectMetadata.logoImg
                  ? `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${props.project.projectMetadata.logoImg}`
                  : DefaultLogoImage
              }
              alt={"Project Logo"}
            />
            <Link to={`${roundRoutePath}/${project.grantApplicationId}`}>
              <div className="min-w-[64px] rounded-full w-16 max-h-[64px] absolute top-0 right-0 bottom-0 left-0 overflow-hidden bg-fixed opacity-0 hover:opacity-70 transition duration-300 ease-in-out bg-gray-500 justify-center flex items-center">
                <EyeIcon
                  className="fill-gray-200 w-6 h-6 cursor-pointer rounded-full"
                  data-testid={`${project.projectRegistryId}-project-link`}
                />
              </div>
            </Link>
          </div>

          <div className="pl-6 mt-1 flex flex-col">
            <Link
              to={`${roundRoutePath}/${project.grantApplicationId}`}
              data-testid={"cart-project-link"}
            >
              <p className="font-semibold text-lg mb-2 text-ellipsis line-clamp-1 max-w-[400px] 2xl:max-w-none">
                {props.project.projectMetadata.title}
              </p>
            </Link>
            <p className="text-sm text-ellipsis line-clamp-3 max-w-[400px] 2xl:max-w-none">
              {renderToPlainText(
                props.project.projectMetadata.description
              ).substring(0, 130)}
            </p>
          </div>
        </div>

        <div className="flex sm:space-x-4 space-x-2 h-16 sm:pl-4 pt-3 justify-center">
          <div className="md:hidden sm:w-12"></div>
          <Input
            aria-label={
              "Donation amount for project " +
              props.project.projectMetadata.title
            }
            id={inputID}
            key={inputID}
            {...(focusedElement === inputID ? { autoFocus: true } : {})}
            min="0"
            value={
              props.projects.find(
                (project) =>
                  project.projectRegistryId === props.project.projectRegistryId
              )?.amount ?? "0"
            }
            type="number"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              store.updateDonationAmount(
                props.project.chainId,
                props.project.roundId,
                props.project.grantApplicationId,
                e.target.value
              );
            }}
            className="w-[100px] sm:w-[80px] text-center border border-black"
          />
          <p className="m-auto">{props.selectedPayoutToken.name}</p>
          {props.payoutTokenPrice && (
            <div className="m-auto px-2 min-w-max flex flex-col">
              <span className="text-sm text-grey-400 ">
                ${" "}
                {(
                  Number(
                    props.projects.find(
                      (project) =>
                        project.projectRegistryId ===
                        props.project.projectRegistryId
                    )?.amount || 0
                  ) * props.payoutTokenPrice
                ).toFixed(2)}
              </span>
              { props.showMatchingEstimate && 
                <span className="text-teal-500 italic text-sm">
                  ~{props.matchingEstimateUSD?.toFixed(2) || 0} USD
                </span>
              }
            </div>
          )}
          <TrashIcon
            data-testid="remove-from-cart"
            onClick={() => {
              props.removeProjectFromCart(props.project);
            }}
            className="w-5 h-5 m-auto cursor-pointer mb-4"
          />
        </div>
      </div>
      {!props.last && 
        <hr className="border-b-[2px] border-grey-100 mx-4" />
      }
    </div>
  );
}
