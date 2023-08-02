import React from "react";
import { ChainId } from "common";
import { groupProjectsInCart } from "../../api/utils";
import Footer from "common/src/components/Footer";
import Navbar from "../../common/Navbar";
import Breadcrumb, { BreadcrumbItem } from "../../common/Breadcrumb";
import { EmptyCart } from "./EmptyCart";
import { Header } from "./Header";
import { useCartStorage } from "../../../store";
import { CartWithProjects } from "./CartWithProjects";
import { SummaryContainer } from "./SummaryContainer";

export default function ViewCart() {
  const { projects } = useCartStorage();
  const groupedCartProjects = groupProjectsInCart(projects);

  const breadCrumbs = [
    {
      name: "Explorer Home",
      path: "/",
    },
    {
      name: "Cart",
      path: `/cart`,
    },
  ] as BreadcrumbItem[];

  return (
    <>
      <Navbar roundUrlPath={"/"} />
      <div className="relative top-16 lg:mx-20 h-screen px-4 py-7">
        <div className="flex flex-col pb-4" data-testid="bread-crumbs">
          <Breadcrumb items={breadCrumbs} />
        </div>
        <main>
          <Header />
          <div className="flex flex-col md:flex-row gap-5">
            {projects.length === 0 ? (
              <EmptyCart />
            ) : (
              <div className="flex flex-col gap-5">
                {Object.keys(groupedCartProjects).map((chainId) => (
                  <div key={Number(chainId)}>
                    <CartWithProjects
                      cart={groupedCartProjects[Number(chainId)]}
                      chainId={Number(chainId) as ChainId}
                    />
                  </div>
                ))}
                <SummaryContainer />
              </div>
            )}
          </div>
        </main>
        <div className="my-11">
          <Footer />
        </div>
      </div>
    </>
  );
}
