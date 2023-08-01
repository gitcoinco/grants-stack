import React from "react";
import {
  CartDonation,
  CartProject,
  PayoutToken,
  recipient,
} from "../../api/types";
import DefaultLogoImage from "../../../assets/default_logo.png";
import { Link } from "react-router-dom";
import { EyeIcon } from "@heroicons/react/24/solid";
import { TrashIcon } from "@heroicons/react/24/outline";
import { renderToPlainText } from "common";
import { Input } from "common/src/styles";

export function ProjectInCart(
  props: React.ComponentProps<"div"> & {
    project: CartProject;
    index: number;
    roundRoutePath: string;
    last?: boolean;
    donations: CartDonation[];
    updateDonations: (
      projectRegistryId: string,
      amount: string,
      projectAddress: recipient,
      applicationIndex: number,
      roundId: string
    ) => void;
    selectedPayoutToken: PayoutToken;
    payoutTokenPrice: number;
    handleRemoveProjectsFromCart: (projectsToRemove: CartProject[]) => void;
  }
) {
  const { project, roundRoutePath } = props;

  const focusedElement = document?.activeElement?.id;
  const inputID = "input-" + props.index;

  return (
    <div
      data-testid="cart-project"
      className={props.last ? "" : `border-b-2 border-grey-200`}
    >
      <div className="mb-4 flex flex-col md:flex-row justify-between px-3 py-4 rounded-md">
        <div className="flex">
          <div className="relative overflow-hidden bg-no-repeat bg-cover  min-w-[64px] w-16 max-h-[64px] mt-auto mb-auto">
            <img
              className="inline-block"
              src={
                props.project.projectMetadata.logoImg
                  ? `https://${process.env.REACT_APP_PINATA_GATEWAY}/ipfs/${props.project.projectMetadata.logoImg}`
                  : DefaultLogoImage
              }
              alt={"Project Logo"}
            />
            <div className="min-w-[64px] w-16 max-h-[64px] absolute top-0 right-0 bottom-0 left-0 overflow-hidden bg-fixed opacity-0 hover:opacity-70 transition duration-300 ease-in-out bg-gray-500 justify-center flex items-center">
              <Link to={`${roundRoutePath}/${project.grantApplicationId}`}>
                <EyeIcon
                  className="fill-gray-200 w-6 h-6 cursor-pointer"
                  data-testid={`${project.projectRegistryId}-project-link`}
                />
              </Link>
            </div>
          </div>

          <div className="pl-4 mt-1">
            <Link
              to={`${roundRoutePath}/${project.grantApplicationId}`}
              data-testid={"cart-project-link"}
            >
              <p className="font-semibold mb-2 text-ellipsis line-clamp-1">
                {props.project.projectMetadata.title}
              </p>
            </Link>
            <p className="text-sm text-ellipsis line-clamp-3">
              {renderToPlainText(
                props.project.projectMetadata.description
              ).substring(0, 130)}
            </p>
          </div>
        </div>

        <div className="mt-6 flex space-x-4 h-16 pl-4 pt-3">
          <div className="md:hidden w-12"></div>
          <Input
            aria-label={
              "Donation amount for project " +
              props.project.projectMetadata.title
            }
            id={inputID}
            key={inputID}
            {...(focusedElement === inputID ? { autoFocus: true } : {})}
            min="0"
            value={props.donations
              .find(
                (donation) =>
                  donation.projectRegistryId === props.project.projectRegistryId
              )
              ?.amount?.toNumber()}
            type="number"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              props.updateDonations(
                props.project.projectRegistryId,
                e.target.value,
                props.project.recipient,
                props.project.applicationIndex,
                props.project.roundId
              );
            }}
            className="w-48"
          />
          <p className="m-auto">{props.selectedPayoutToken.name}</p>
          {props.payoutTokenPrice && (
            <div className="m-auto px-2 min-w-max">
              <span className="text-[14px] text-grey-400 ">
                ${" "}
                {(
                  Number(
                    props.donations.find(
                      (donation) =>
                        donation.projectRegistryId ===
                        props.project.projectRegistryId
                    )?.amount || 0
                  ) * props.payoutTokenPrice
                ).toFixed(2)}
              </span>
            </div>
          )}
          <TrashIcon
            data-testid="remove-from-cart"
            onClick={() => {
              props.handleRemoveProjectsFromCart([props.project]);
              props.updateDonations(
                props.project.projectRegistryId,
                "",
                props.project.recipient,
                props.project.applicationIndex,
                props.project.roundId
              );
            }}
            className="w-5 h-5 m-auto cursor-pointer mb-4"
          />
        </div>
      </div>
    </div>
  );
}
