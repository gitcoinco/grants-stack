import * as yup from "yup";
export const applicationValidationSchema = yup.object().shape({
  roundMetadata: yup.object({
    name: yup
      .string()
      .required("This field is required.")
      .min(8, "Round name must be at least 8 characters."),
    roundType: yup.string().required("You must select the round type."),
    support: yup.object({
      type: yup
        .string()
        .required("You must select a support type.")
        .notOneOf(
          ["Select what type of input."],
          "You must select a support type."
        ),
      info: yup
        .string()
        .required("This field is required.")
        .when("type", {
          is: "Email",
          then: yup
            .string()
            .email()
            .required("You must provide a valid email address."),
        })
        .when("type", {
          is: (val: string) => val && val != "Email",
          then: yup.string().url().required("You must provide a valid URL."),
        }),
    }),
  }),
  applicationsStartTime: yup
    .date()
    .required("This field is required.")
    .min(new Date(), "You must enter a date and time in the future.")
    .max(
      yup.ref("applicationsEndTime"),
      "Applications start date must be earlier than the applications end date"
    ),
  applicationsEndTime: yup
    .date()
    .required("This field is required.")
    .min(
      yup.ref("applicationsStartTime"),
      "Applications end date must be later than applications start date"
    )
    .max(
      yup.ref("roundStartTime"),
      "Applications end date must be earlier than the round start date"
    ),
  roundStartTime: yup
    .date()
    .required("This field is required.")
    .min(
      yup.ref("applicationsEndTime"),
      "Round start date must be later than applications end date"
    )
    .max(
      yup.ref("roundEndTime"),
      "Round start date must be earlier than the round end date"
    ),
  roundEndTime: yup
    .date()
    .required("This field is required.")
    .min(
      yup.ref("roundStartTime"),
      "Round end date must be later than the round start date"
    ),
});

export const roundDetailsValidationSchema = yup.object().shape({
  roundName: yup  
  .string()
  .defined()
  .required("This field is required.")
  .min(8, "Round name must be at least 8 characters.")
  .default(""),

  roundSupport: yup
  .object({
    type: yup
    .string()
    .required("You must select a support type."),
    input: yup 
    .string()
    .required("This field is required.")
    .when("type", {
      is: "Email",
      then: yup
      .string()
      .email()
      .required("You must provide a valid email address."),
    })
    .when("type", {
      is: (val: string) => val && val != "Email",
      then: yup.string().url().required("You must provide a valid URL."),
    })
  }),

  roundApplicationsStartTime: yup
  .date()
  .required("This field is required.")
  .min(
    yup.ref("roundApplicationsStartTime"),
    "You must enter a date and time in the future."
  ) 
  .max(
    yup.ref("roundApplicationsStartTime"),
    "Applications start date must be before the round start date."
  )
  .max(
    yup.ref("roundApplicationsEndTime"),
    "Applications start date must be before the round end date."
  ),

  roundApplicationsEndTime: yup
  .date()
  .required("This field is required.")
  .min(
    yup.ref("roundApplicationsStartTime"),
    "Applications end date must be later than applications start date."
  )
  .max(
    yup.ref("roundApplicationsEndTime"),
    "Applications end date must be before the round end date."
  ),

  roundVotingStartTime: yup
  .date()
  .required("This field is required.")
  .min(
    yup.ref("roundVotingStartTime"),
    "Round start date must be later than the applications start date."
  )
  .max(
    yup.ref("roundVotingEndTime"),
    "Round start date must be earlier than the round end date."
  ),

  roundVotingEndTime: yup
  .date()
  .required("This field is required.")
  .min(
    yup.ref("roundVotingStartTime"),
    "Round end date must be later than the round start date."
  ),

  roundVisibility: yup
  .string()
  .required("This field is required."),
});