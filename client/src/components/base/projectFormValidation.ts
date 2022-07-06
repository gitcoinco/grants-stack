import { object, string } from "yup";

export interface FormSchema {
  title: string;
  description: string;
  website: string;
  challenges: string;
  roadmap: string;
}

export async function validateProjectForm(inputs: FormSchema) {
  const schema = object({
    title: string().required("Project Name is required"),
    description: string().required("Project Description is required"),
    website: string()
      .url("Project Website must be a valid url. e.g. https://gitcoin.co/")
      .required("Project Website is required"),
    challenges: string().required("Project Challenges is required"),
    roadmap: string().required("Project Roadmap is required"),
  });

  const validatedInputs = await schema.validate(inputs);
  return validatedInputs;
}
