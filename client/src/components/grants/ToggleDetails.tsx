import { Metadata, FormInputs, Project } from "../../types";

function Section({ title, text }: { title: string; text: string | undefined }) {
  return (
    <div className="flex flex-col items-left justify-left m-2">
      <label htmlFor={text} className="text-xl">
        {title}
      </label>
      <input className="ml-4" name={text} type="text" value={text} disabled />
    </div>
  );
}

export default function ToggleDetails({
  project,
}: {
  project?: Metadata | FormInputs | Project;
}) {
  return (
    <div className="w-full h-full">
      <Section title="Project Website" text={project?.website} />
      <Section title="Project Twitter" text={project?.projectTwitter} />
      <Section title="Your Github Username" text={project?.userGithub} />
      <Section
        title="Project Github Organization"
        text={project?.projectGithub}
      />
      <div className="w-full md:w-2/3 mt-2">
        <img
          className="w-full mb-4"
          src={
            project?.bannerImg instanceof Blob
              ? URL.createObjectURL(project?.bannerImg)
              : "./assets/card-img.png"
          }
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "./assets/card-img.png";
          }}
          alt="project banner"
        />
      </div>
      <div className="rounded-full h-20 w-20 bg-quaternary-text border border-tertiary-text flex justify-center items-center">
        <img
          className="rounded-full"
          src={
            project?.logoImg instanceof Blob
              ? URL.createObjectURL(project?.logoImg)
              : "./icons/lightning.svg"
          }
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "./icons/lightning.svg";
          }}
          alt="project logo"
        />
      </div>
      <Section title="Project Description" text={project?.description} />
    </div>
  );
}
