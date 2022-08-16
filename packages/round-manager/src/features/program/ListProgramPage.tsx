import React from "react";
import { Link } from "react-router-dom"

import { useWallet } from "../common/Auth"
import { useListProgramsQuery } from "../api/services/program"
import {
  ArrowNarrowRightIcon,
  PlusIcon,
  RefreshIcon
} from "@heroicons/react/solid"
import { Spinner } from "../common/Spinner"
import Navbar from "../common/Navbar"
import {
  CardFooter,
  CardFooterContent,
  BasicCard,
  CardContent,
  CardDescription,
  CardsContainer,
  CardTitle
} from "../common/styles"
import { ReactComponent as Banner } from "../../assets/programs/city-voxel.svg";
import Footer from "../common/Footer";

interface ProgramCardProps {
  floatingIcon: JSX.Element,
  title: string,
  description: string,
  footerContent: JSX.Element
}

const ProgramCard: React.FC<ProgramCardProps> = (props: ProgramCardProps) => (
  <BasicCard
    className="border-none mb-12 md:w-[410px] relative shadow-xl xl:-translate-y-44 lg:-translate-y-20 md:-translate-y-12 -translate-y-2">
    {props.floatingIcon}
    <CardContent className="pt-0">
      <CardTitle className="font-bold">{props.title}</CardTitle>
      <CardDescription className="line-clamp-none">
        {props.description}
      </CardDescription>
    </CardContent>
    <CardFooter>
      <CardFooterContent className="justify-end p-6">
        {props.footerContent}
      </CardFooterContent>
    </CardFooter>
  </BasicCard>)

const startAProgramCard = <Link to="/program/create">
  <ProgramCard
    floatingIcon={
      <div
        className="relative flex justify-center items-center h-16 w-16 translate-x-6 -translate-y-8 bg-violet-400 text-white rounded drop-shadow-xl">
        <PlusIcon className="h-6 w-6" aria-hidden="true" />
      </div>
    }
    title={"Start a Grant Program"}
    description={"Create a Grant Program to manage applications, round dates, and voting mechanisms, as well as approve or reject projects all in one place."}
    footerContent={
      <p className="text-violet-400">
        Create Program <ArrowNarrowRightIcon className="h-5 w-5 inline ml-4" />
      </p>
    }
  />
</Link>

function ListPrograms() {
  const { address, provider } = useWallet()
  const {
    data: programs,
    isLoading,
    isSuccess
  } = useListProgramsQuery({ address, signerOrProvider: provider })

  const programList = programs?.map((program) => (
    <Link to={`/program/${program.id}`}>
      <ProgramCard
        key={program.id}
        floatingIcon={
          <div
            className="relative flex justify-center items-center h-16 w-16 translate-x-6 -translate-y-8 bg-teal-500 text-white rounded drop-shadow-xl">
            <RefreshIcon className="h-6 w-6" aria-hidden="true" />
          </div>
        }
        title={program.metadata!.name}
        description={`${program.operatorWallets.length} Round Operators`}
        footerContent={
          <p className="text-violet-400">
            View details <ArrowNarrowRightIcon className="h-5 w-5 inline ml-4" />
          </p>
        }
      />
    </Link>
  ))

  return (
    <>
      <Navbar programCta={!!isSuccess} />
      <header className="mb-2.5 bg-grey-500 overflow-hidden">
        <div className="container mx-auto flex flex-row">
          <div className="grow p-6 md:pt-14 md:pl-20 lg:pt-32 lg:pl-24">
            <h1 className="text-4xl lg:text-6xl text-white font-thin antialiased">My Programs</h1>
            <p className="text-xl text-grey-400 mt-2">
              Create a grant program and manage rounds with independent criteria.
            </p>
          </div>
          <div className="right-0 hidden md:block">
            <Banner />
          </div>
        </div>
      </header>
      <main className="container mx-auto p-2 md:px-20">
        <CardsContainer>
          {isSuccess && (!programs || programs.length === 0) && startAProgramCard}
          {programList}
        </CardsContainer>

        {isLoading &&
          <Spinner text="Fetching Programs" />
        }
      </main>
      <Footer />
    </>
  )
}

export default ListPrograms
