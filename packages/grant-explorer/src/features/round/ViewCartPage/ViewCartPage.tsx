import { useEffect, useState, useMemo } from "react";
import { groupProjectsInCart } from "../../api/utils";
import Footer from "common/src/components/Footer";
import Navbar from "../../common/Navbar";
import Breadcrumb, { BreadcrumbItem } from "../../common/Breadcrumb";
import { EmptyCart } from "./EmptyCart";
import { Header } from "./Header";
import { useCartStorage } from "../../../store";
import { CartWithProjects } from "./CartWithProjects";
import { SummaryContainer } from "./SummaryContainer";
import { useDataLayer } from "data-layer";
import { createCartProjectFromApplication } from "../../discovery/ExploreApplicationsPage";
import { getBalance } from "@wagmi/core";
import { useAccount } from "wagmi";
import { config } from "../../../app/wagmi";
import { zeroAddress } from "viem";
import { NATIVE, getChainById } from "common";
import { Balance, BalanceMap } from "../../api/types";
import { formatUnits } from "ethers/lib/utils";
import GenericModal from "../../common/GenericModal";
import SquidWidget, { SwapParams } from "./SquidWidget";

export default function ViewCart() {
  const { projects, setCart, getVotingTokenForChain } = useCartStorage();
  const { address, chainId: connectedChain } = useAccount();
  const [balances, setBalances] = useState<BalanceMap>({});
  const [totalAmountByChainId, setTotalAmountByChainId] = useState<
    Record<number, number>
  >({});
  const [enoughBalanceByChainId, setEnoughBalanceByChainId] = useState<
    Record<number, boolean>
  >({});

  const dataLayer = useDataLayer();
  const groupedCartProjects = groupProjectsInCart(projects);
  const chainIds = Object.keys(groupedCartProjects);

  const [openSwapModel, setOpenSwapModal] = useState<boolean>(false);
  const [swapParams, setSwapParams] = useState<SwapParams>({
    fromChainId: "1",
    toChainId: "42161",
    fromTokenAddress: NATIVE,
    toTokenAddress: NATIVE,
  });

  const handleSwap = (params: SwapParams) => {
    setSwapParams(params);
    setOpenSwapModal(true);
  };

  // ensure cart data is up to date on mount
  useEffect(() => {
    const applicationRefs = projects.map((project) => {
      return {
        chainId: project.chainId,
        roundId: project.roundId,
        id: project.applicationIndex.toString(),
      };
    });

    // only update cart if fetching applications is successful
    dataLayer
      .getApprovedApplicationsByExpandedRefs(applicationRefs)
      .then((applications) => {
        const updatedProjects = applications.flatMap((application) => {
          const existingProject = projects.find((project) => {
            return applications.some(
              (application) =>
                application.chainId === project.chainId &&
                application.roundId === project.roundId &&
                application.roundApplicationId ===
                  project.applicationIndex.toString()
            );
          });

          const newProject = createCartProjectFromApplication(application);

          // update all application data, but preserve the selected amount
          return { ...newProject, amount: existingProject?.amount ?? "" };
        });

        // replace whole cart
        setCart(updatedProjects);
      })
      .catch((error) => {
        console.error("error fetching applications in cart", error);
      });

    // we only want to run this once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const totalAmountByChainId = Object.keys(groupedCartProjects).reduce(
      (acc, chainId) => {
        const amount = Object.values(
          groupedCartProjects[Number(chainId)]
        ).reduce(
          (acc, curr) =>
            acc +
            curr.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0),
          0
        );
        return { ...acc, [Number(chainId)]: amount };
      },
      {}
    );
    setTotalAmountByChainId(totalAmountByChainId);
  }, [projects]);
  // reduce the number of re-renders by memoizing the chainIds
  const memoizedChainIds = useMemo(() => chainIds, [JSON.stringify(chainIds)]);

  const fetchBalances = async () => {
    const allBalances = await Promise.all(
      chainIds.map(async (chainId) => {
        const chainIdNumber = Number(chainId);
        const chain = getChainById(chainIdNumber);

        const chainBalances = await Promise.all(
          chain.tokens.map(async (token) => {
            if (!token.canVote || !address) return null;

            try {
              const balance = await getBalance(config, {
                address,
                token:
                  token.address === zeroAddress ||
                  token.address.toLowerCase() === NATIVE.toLowerCase()
                    ? undefined
                    : (token.address.toLowerCase() as `0x${string}`),
                chainId: chainIdNumber,
              });

              return {
                ...balance,
                address: token.address,
                chainId: chainIdNumber,
                formattedAmount: Number(
                  formatUnits(balance.value, balance.decimals)
                ),
              };
            } catch (e) {
              console.error(
                `Error fetching balance for chain ${chainIdNumber} and token ${token.address}`,
                e
              );
              return null;
            }
          })
        );

        // Filter and convert to balanceMap directly
        const balanceMap = chainBalances.reduce(
          (map, balance) => {
            if (balance) {
              map[balance.address.toLowerCase()] = balance; // Use balance directly as it's already typed
            }
            return map;
          },
          {} as { [tokenAddress: string]: Balance }
        );

        return { chainId: chainIdNumber, balanceMap };
      })
    );

    // Convert array of balances into a single BalanceMap object
    const newBalances = allBalances.reduce((map, { chainId, balanceMap }) => {
      map[chainId] = balanceMap;
      return map;
    }, {} as BalanceMap);
    setBalances(newBalances);
  };

  useEffect(() => {
    // Fetch balances if they have not been fetched yet
    if (Object.keys(balances) && address) {
      fetchBalances();
    }
  }, [memoizedChainIds, address, config]);

  useEffect(() => {
    if (
      Object.keys(balances).length > 0 &&
      Object.keys(totalAmountByChainId).length > 0
    ) {
      const enoughBalanceByChainId = Object.keys(totalAmountByChainId).reduce(
        (acc, chainId) => {
          const totalAmount = totalAmountByChainId[Number(chainId)];
          const balance =
            balances[Number(chainId)][
              getVotingTokenForChain(Number(chainId)).address.toLowerCase()
            ]?.formattedAmount || 0;
          acc[Number(chainId)] = balance >= totalAmount;
          return acc;
        },
        {} as { [chainId: number]: boolean }
      );
      setEnoughBalanceByChainId(enoughBalanceByChainId);
    }
  }, [balances, totalAmountByChainId]);

  const breadCrumbs: BreadcrumbItem[] = [
    {
      name: "Explorer Home",
      path: "/",
    },
    {
      name: "Cart",
      path: `/cart`,
    },
  ];

  const swap = (_chainId: number | string) => {
    const chainId = Number(_chainId);
    const isConnectedChain = !connectedChain || connectedChain === chainId;

    handleSwap({
      fromChainId: isConnectedChain ? "1" : connectedChain.toString(),
      toChainId: chainId.toString(),
      fromTokenAddress: NATIVE,
      toTokenAddress: getVotingTokenForChain(chainId).address,
    });
  };

  const swapModalHandler = async (flag: boolean) => {
    await fetchBalances();
    setOpenSwapModal(flag);
  };

  return (
    <>
      <Navbar />
      <div className="relative top-28 lg:mx-20 h-screen sm:px-4 px-2 py-7 lg:pt-0 font-sans">
        <div className="flex flex-col pb-4" data-testid="bread-crumbs">
          <Breadcrumb items={breadCrumbs} />
        </div>
        <main>
          <Header projects={projects} />
          <div className="flex flex-col md:flex-row gap-5">
            {projects.length === 0 ? (
              <>
                <EmptyCart />
                <SummaryContainer
                  enoughBalanceByChainId={enoughBalanceByChainId}
                  totalAmountByChainId={totalAmountByChainId}
                  handleSwap={swap}
                />
              </>
            ) : (
              <div className={"grid sm:grid-cols-3 gap-5 w-full"}>
                <div className="flex flex-col gap-5 sm:col-span-2 order-2 sm:order-1">
                  {Object.keys(groupedCartProjects).map((chainId) => (
                    <div key={Number(chainId)}>
                      <CartWithProjects
                        cart={groupedCartProjects[Number(chainId)]}
                        chainId={Number(chainId) as number}
                        balances={balances[chainId]}
                        totalAmount={totalAmountByChainId[Number(chainId)]}
                        enoughBalance={enoughBalanceByChainId[Number(chainId)]}
                        payoutToken={getVotingTokenForChain(Number(chainId))}
                        handleSwap={() => swap(chainId)}
                      />
                    </div>
                  ))}
                </div>
                <div className="sm:col-span-1 order-1 sm:order-2">
                  <SummaryContainer
                    enoughBalanceByChainId={enoughBalanceByChainId}
                    totalAmountByChainId={totalAmountByChainId}
                    handleSwap={swap}
                  />
                </div>
              </div>
            )}
          </div>
          <GenericModal
            isIframe={true}
            body={<SquidWidget {...swapParams} />}
            isOpen={openSwapModel}
            setIsOpen={swapModalHandler}
          />
        </main>
        <div className="my-11">
          <Footer />
        </div>
      </div>
    </>
  );
}
