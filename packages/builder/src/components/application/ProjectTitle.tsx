import { Metadata } from "../../types";

export function ProjectTitle(props: { projectMetadata: Metadata }) {
  const { projectMetadata } = props;
  return (
    <div className="pb-2">
      <h1 className="text-3xl mt-6 font-thin text-black">
        {projectMetadata.title}
      </h1>
    </div>
  );
}
