import { EyeIcon } from "@heroicons/react/24/solid";
import { ChainId, renderToHTML } from "common";
import {
  RoundApplicationAnswers,
  RoundApplicationQuestion,
} from "data-layer/dist/roundApplication.types";
import { useEffect } from "react";
import { DefaultProjectBanner, DefaultProjectLogo } from "../../assets";
import { Metadata } from "../../types";
import Button, { ButtonVariants } from "../base/Button";
import { AboutProject } from "./AboutProject";
import { ProjectTitle } from "./ProjectTitle";
import { getFileUrl } from "../../utils/components";

export function FullPreview(props: {
  project: Metadata;
  answers: RoundApplicationAnswers;
  questions: RoundApplicationQuestion[];
  handleSubmitApplication: Function;
  preview: boolean;
  setPreview: Function;
  disableSubmit: boolean;
  chainId: ChainId;
}) {
  const {
    project,
    answers,
    questions,
    preview,
    setPreview,
    handleSubmitApplication,
    disableSubmit,
    chainId,
  } = props;
  useEffect(() => {
    document.getElementById("root")!.scrollTo(0, 0);
  }, []);

  return (
    <>
      {preview && (
        <div className="flex flex-row items-center">
          <span className="icon mr-2">
            <EyeIcon className="w-6 h-5 inline-block text-violet-500 align-middle" />
          </span>
          <span className="text-sm text-gray-500">
            This is a preview of your public project page on Gitcoin Explorer.
          </span>
        </div>
      )}
      <div className="relative pt-7">
        <div>
          <div>
            <img
              className="h-32 w-full object-cover lg:h-80 rounded"
              src={`${
                project.bannerImg
                  ? getFileUrl(project.bannerImg)
                  : DefaultProjectBanner
              }?img-height=320`}
              alt="Project Banner"
            />
          </div>
          <div className="pl-4 sm:pl-6 lg:pl-8">
            <div className="-mt-1 sm:-mt-2 sm:flex sm:items-end sm:space-x-5">
              <div className="flex">
                <div className="pl-4">
                  <div className="-mt-6 sm:-mt-6 sm:flex sm:items-end sm:space-x-5">
                    <div className="flex">
                      <img
                        className="h-16 w-16 rounded-full ring-4 ring-white bg-white"
                        src={
                          project.logoImg
                            ? getFileUrl(project.logoImg)
                            : DefaultProjectLogo
                        }
                        alt="Project Logo"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row">
        <div className="grow">
          <div>
            <ProjectTitle projectMetadata={project} />
            <AboutProject
              projectToRender={project}
              questions={questions}
              answers={answers}
              chainId={chainId}
            />
          </div>
          <div>
            <h1 className="text-2xl mt-8 font-thin text-black">About</h1>
            <p
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{
                __html: renderToHTML(
                  project.description.replace(/\n/g, "\n\n")
                ),
              }}
              className="text-md prose prose-h1:text-lg prose-h2:text-base prose-h3:text-base prose-a:text-blue-600"
            />

            <div className="mt-4 border-t-2">
              <h1 className="text-2xl mt-6 font-thin text-black">
                Additional Details
              </h1>
              <div>
                {questions.map((question: any) => {
                  const currentAnswer = answers[question.id];
                  const answerText = Array.isArray(currentAnswer)
                    ? currentAnswer.join(", ")
                    : currentAnswer || "";

                  return (
                    <div>
                      {!question.hidden && question.type !== "project" && (
                        <div key={question.id}>
                          <p className="text-md mt-8 mb-3 font-semibold text-black">
                            {question.type === "recipient"
                              ? "Recipient"
                              : question.title}
                          </p>
                          {question.type === "paragraph" ? (
                            <p
                              // eslint-disable-next-line react/no-danger
                              dangerouslySetInnerHTML={{
                                __html: renderToHTML(
                                  answerText.toString().replace(/\n/g, "\n\n")
                                ),
                              }}
                              className="text-md prose prose-h1:text-lg prose-h2:text-base prose-h3:text-base prose-a:text-blue-600"
                            />
                          ) : (
                            <p className="text-base text-black">
                              {answerText.toString().replace(/\n/g, "<br/>")}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end">
        <div className="flex justify-end">
          <Button
            variant={ButtonVariants.outline}
            onClick={() => {
              setPreview(false);
            }}
          >
            Back to Editing
          </Button>
          <Button
            variant={ButtonVariants.primary}
            onClick={() => {
              handleSubmitApplication();
            }}
            disabled={disableSubmit}
          >
            Submit
          </Button>
        </div>
      </div>
    </>
  );
}
