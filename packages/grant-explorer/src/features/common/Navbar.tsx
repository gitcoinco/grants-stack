import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ReactComponent as GitcoinLogo } from "../../assets/gitcoinlogo-black.svg";
import { ReactComponent as GrantsExplorerLogo } from "../../assets/topbar-logos-black.svg";
import { ReactComponent as GrantsExplorerLogoMobile } from "../../assets/explorer-logo-mobile.svg";
import NavbarCart from "./NavbarCart";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { useCartStorage } from "../../store";
import { Link } from "react-router-dom";
import { PassportWidget } from "./PassportWidget";
import { exploreRoundsLink } from "../discovery/LandingTabs";

export interface NavbarProps {
  customBackground?: string;
  showWalletInteraction?: boolean;
}

export default function Navbar(props: NavbarProps) {
  /** This part keeps the store in sync between tabs */
  const store = useCartStorage();

  const updateStore = () => {
    useCartStorage.persist.rehydrate();
  };

  useEffect(() => {
    document.addEventListener("visibilitychange", updateStore);
    window.addEventListener("focus", updateStore);
    return () => {
      document.removeEventListener("visibilitychange", updateStore);
      window.removeEventListener("focus", updateStore);
    };
  }, []);
  /** end of part that keeps the store in sync between tabs */

  const showWalletInteraction = props.showWalletInteraction ?? true;

  const { address: walletAddress } = useAccount();

  return (
    <nav
      className={`blurred fixed w-full z-20 shadow-[0_4px_24px_0px_rgba(0,0,0,0.08)] ${props.customBackground}`}
    >
      <div className="mx-auto px-4 sm:px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              to={"/"}
              className="flex-shrink-0 flex items-center"
              data-testid={"home-link"}
            >
              <div className="flex gap-1 lg:gap-3 items-center">
                <GitcoinLogo className="" />
                <div className="border-grey-400 border-2 h-4 border-r ml-[2px]" />
                <GrantsExplorerLogo className="hidden lg:block" />
                <GrantsExplorerLogoMobile className="lg:hidden" />
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:block">
              <a
                href="https://docs.publicgoods.network/using-pgn/bridging"
                rel="noreferrer"
                target="_blank"
                className="flex-shrink-0 flex items-center mr-[9px] -mt-[1px]"
              >
                <svg
                  width="94"
                  height="32"
                  className={"scale-125"}
                  viewBox="0 0 94 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="10.2017"
                    cy="16"
                    r="9.61991"
                    fill="white"
                    stroke="black"
                    strokeWidth="0.760181"
                  />
                  <rect
                    x="5.77072"
                    y="11.5902"
                    width="5.62637"
                    height="5.62637"
                    fill="black"
                    stroke="black"
                    strokeWidth="0.760181"
                  />
                  <rect
                    x="8.62598"
                    y="14.4033"
                    width="6.38655"
                    height="6.38655"
                    fill="black"
                  />
                  <rect
                    x="8.99581"
                    y="14.7835"
                    width="2.40121"
                    height="2.40121"
                    fill="white"
                    stroke="black"
                    strokeWidth="0.760181"
                  />
                  <path
                    d="M25.3979 10.958H29.9165C30.8097 10.958 31.5298 11.2109 32.0767 11.7168C32.6235 12.2181 32.897 12.9245 32.897 13.8359C32.897 14.6198 32.6532 15.3034 32.1655 15.8867C31.6779 16.4655 30.9282 16.7549 29.9165 16.7549H26.7583V21H25.3979V10.958ZM31.5229 13.8428C31.5229 13.1045 31.2495 12.6032 30.7026 12.3389C30.4019 12.1976 29.9894 12.127 29.4653 12.127H26.7583V15.6064H29.4653C30.076 15.6064 30.5705 15.4766 30.9487 15.2168C31.3315 14.957 31.5229 14.499 31.5229 13.8428ZM36.7068 10.6982C37.6501 10.6982 38.4659 10.8805 39.154 11.2451C40.1521 11.7692 40.7628 12.6875 40.9861 14H39.6394C39.4753 13.2663 39.1358 12.7331 38.6208 12.4004C38.1059 12.0632 37.4565 11.8945 36.6726 11.8945C35.7429 11.8945 34.9591 12.2432 34.321 12.9404C33.6876 13.6377 33.3708 14.6768 33.3708 16.0576C33.3708 17.2516 33.6329 18.2246 34.157 18.9766C34.6811 19.724 35.5356 20.0977 36.7204 20.0977C37.6274 20.0977 38.377 19.8356 38.9695 19.3115C39.5665 18.7829 39.8718 17.9307 39.8855 16.7549H36.741V15.627H41.1501V21H40.2751L39.947 19.708C39.4867 20.2139 39.0788 20.5648 38.7234 20.7607C38.1264 21.098 37.3676 21.2666 36.447 21.2666C35.2576 21.2666 34.2344 20.8815 33.3777 20.1113C32.4434 19.1452 31.9763 17.819 31.9763 16.1328C31.9763 14.4512 32.432 13.1136 33.3435 12.1201C34.2094 11.1722 35.3305 10.6982 36.7068 10.6982ZM41.0224 10.958H42.6289L47.7012 19.0928V10.958H48.9931V21H47.4687L42.3213 12.8721V21H41.0224V10.958ZM56.5696 15.2031C57.1438 15.2031 57.5904 15.1234 57.9094 14.9639C58.4107 14.7132 58.6613 14.262 58.6613 13.6104C58.6613 12.9541 58.3947 12.512 57.8615 12.2842C57.5608 12.1566 57.1141 12.0928 56.5217 12.0928H54.0949V15.2031H56.5696ZM57.0276 19.8379C57.8615 19.8379 58.4563 19.5964 58.8117 19.1133C59.035 18.8079 59.1467 18.4388 59.1467 18.0059C59.1467 17.2767 58.8209 16.7799 58.1692 16.5156C57.8228 16.3743 57.3648 16.3037 56.7951 16.3037H54.0949V19.8379H57.0276ZM52.7619 10.958H57.0754C58.2512 10.958 59.0875 11.3089 59.5842 12.0107C59.8759 12.4255 60.0217 12.904 60.0217 13.4463C60.0217 14.0798 59.8417 14.5993 59.4817 15.0049C59.2948 15.2191 59.0259 15.415 58.675 15.5928C59.19 15.7887 59.5751 16.0098 59.8303 16.2559C60.2815 16.6934 60.5071 17.2972 60.5071 18.0674C60.5071 18.7145 60.3043 19.3001 59.8987 19.8242C59.2925 20.6081 58.3287 21 57.0071 21H52.7619V10.958ZM62.0041 13.6787H63.1731V14.9434C63.2688 14.6973 63.5035 14.3988 63.8772 14.0479C64.2509 13.6924 64.6815 13.5146 65.1692 13.5146C65.1919 13.5146 65.2307 13.5169 65.2854 13.5215C65.3401 13.526 65.4335 13.5352 65.5656 13.5488V14.8477C65.4927 14.834 65.4244 14.8249 65.3606 14.8203C65.3013 14.8158 65.2352 14.8135 65.1623 14.8135C64.5425 14.8135 64.0663 15.014 63.7336 15.415C63.4009 15.8115 63.2346 16.2695 63.2346 16.7891V21H62.0041V13.6787ZM66.632 13.7129H67.883V21H66.632V13.7129ZM66.632 10.958H67.883V12.3525H66.632V10.958ZM70.5285 17.4248C70.5285 18.2087 70.6949 18.8649 71.0276 19.3936C71.3602 19.9222 71.8934 20.1865 72.6272 20.1865C73.1968 20.1865 73.664 19.9427 74.0285 19.4551C74.3977 18.9629 74.5822 18.2588 74.5822 17.3428C74.5822 16.4176 74.3931 15.734 74.0149 15.292C73.6366 14.8454 73.1695 14.6221 72.6135 14.6221C71.9937 14.6221 71.4901 14.859 71.1028 15.333C70.7199 15.807 70.5285 16.5042 70.5285 17.4248ZM72.3811 13.5488C72.9416 13.5488 73.411 13.6673 73.7893 13.9043C74.008 14.041 74.2564 14.2803 74.5344 14.6221V10.9238H75.717V21H74.6096V19.9814C74.3225 20.4326 73.983 20.7585 73.591 20.959C73.1991 21.1595 72.7502 21.2598 72.2444 21.2598C71.4286 21.2598 70.7222 20.918 70.1252 20.2344C69.5282 19.5462 69.2297 18.6325 69.2297 17.4932C69.2297 16.4268 69.5009 15.5039 70.0432 14.7246C70.5901 13.9408 71.3694 13.5488 72.3811 13.5488ZM80.1262 13.5488C80.7004 13.5488 81.2017 13.6901 81.6301 13.9727C81.8625 14.1322 82.0995 14.3646 82.341 14.6699V13.7471H83.4758V20.4053C83.4758 21.335 83.3391 22.0687 83.0656 22.6064C82.5552 23.5999 81.5914 24.0967 80.174 24.0967C79.3856 24.0967 78.7225 23.9189 78.1848 23.5635C77.647 23.2126 77.3462 22.6611 77.2824 21.9092H78.5334C78.5927 22.2373 78.7112 22.4902 78.8889 22.668C79.1669 22.9414 79.6044 23.0781 80.2014 23.0781C81.1447 23.0781 81.7623 22.7454 82.0539 22.0801C82.2271 21.6882 82.3069 20.9886 82.2932 19.9814C82.0471 20.3551 81.7509 20.6331 81.4045 20.8154C81.0582 20.9977 80.6001 21.0889 80.0305 21.0889C79.2375 21.0889 78.5425 20.8086 77.9455 20.248C77.3531 19.6829 77.0569 18.751 77.0569 17.4521C77.0569 16.2262 77.3554 15.2692 77.9524 14.5811C78.5539 13.8929 79.2785 13.5488 80.1262 13.5488ZM82.341 17.3086C82.341 16.4017 82.1542 15.7295 81.7805 15.292C81.4068 14.8545 80.9306 14.6357 80.3518 14.6357C79.4859 14.6357 78.8934 15.0413 78.5744 15.8525C78.4058 16.2855 78.3215 16.8529 78.3215 17.5547C78.3215 18.3796 78.4878 19.0085 78.8205 19.4414C79.1578 19.8698 79.6089 20.084 80.174 20.084C81.0582 20.084 81.6802 19.6852 82.0403 18.8877C82.2408 18.4365 82.341 17.9102 82.341 17.3086ZM88.384 13.5146C88.9035 13.5146 89.4071 13.6377 89.8947 13.8838C90.3824 14.1253 90.7538 14.4398 91.009 14.8271C91.2551 15.1963 91.4192 15.627 91.5012 16.1191C91.5741 16.4564 91.6106 16.9941 91.6106 17.7324H86.2444C86.2671 18.4753 86.4426 19.0723 86.7707 19.5234C87.0988 19.9701 87.607 20.1934 88.2951 20.1934C88.9377 20.1934 89.4504 19.9814 89.8332 19.5576C90.052 19.3115 90.2069 19.0267 90.2981 18.7031H91.508C91.4761 18.972 91.369 19.2728 91.1867 19.6055C91.009 19.9336 90.8085 20.2025 90.5852 20.4121C90.2115 20.7767 89.7489 21.0228 89.1975 21.1504C88.9013 21.2233 88.5663 21.2598 88.1926 21.2598C87.2811 21.2598 86.5087 20.9294 85.8752 20.2686C85.2418 19.6032 84.925 18.6735 84.925 17.4795C84.925 16.3037 85.244 15.349 85.882 14.6152C86.5201 13.8815 87.3541 13.5146 88.384 13.5146ZM90.3459 16.7549C90.2958 16.2217 90.1796 15.7956 89.9973 15.4766C89.66 14.8841 89.0972 14.5879 88.3088 14.5879C87.7437 14.5879 87.2697 14.793 86.8869 15.2031C86.5041 15.6087 86.3013 16.126 86.2785 16.7549H90.3459Z"
                    fill="black"
                  />
                </svg>
              </a>
            </div>
            <Link
              to={exploreRoundsLink}
              className="font-medium hover:underline hidden md:block"
            >
              Explore rounds
            </Link>
            {walletAddress && (
              <div data-testid="passport-widget">
                <PassportWidget />
              </div>
            )}
            {showWalletInteraction && (
              <div>
                <div
                  data-testid="connect-wallet-button"
                  id="connect-wallet-button"
                >
                  <ConnectButton
                    showBalance={false}
                    accountStatus={{
                      smallScreen: "avatar",
                      largeScreen: "full",
                    }}
                    chainStatus={{ smallScreen: "icon", largeScreen: "full" }}
                  />
                </div>
              </div>
            )}
            {walletAddress && (
              <div>
                <Link
                  to={`/contributors/${walletAddress}`}
                  className="flex-shrink-0 flex items-center ph-no-capture"
                  data-testid={"contributions-link"}
                >
                  <UserCircleIcon className="h-8 w-8 ph-no-capture" />
                </Link>
              </div>
            )}
            <NavbarCart cart={store.projects} />
          </div>
        </div>
      </div>
    </nav>
  );
}
