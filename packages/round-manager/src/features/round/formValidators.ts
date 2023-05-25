import * as yup from "yup";

/**
 * Validation schema for the round details section of the round form.
 */
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

/**
 * Validation schema for the quadratic funding section of the round form.
 */
export const quadraticFundingValidationSchema = yup.object().shape({
  matchingFundsAvailable: yup
  .number()
  .typeError("Matching funds available must be a valid number.")
  .moreThan(0, "Matching funds available must be more than zero."),

  matchingCap: yup
  .boolean()
  .required("You must select if you want a matching cap for projects."),

  matchingCapAmount: yup
  .number()
  .transform((value) => (isNaN(value) ? 0 : value))
  .when("matchingCap", {
    is: true,
    then: yup
    .number()
    .required("You must provide an amount for the matching cap.")
    .moreThan(0, "Matching cap amount must be more than zero.")
    .max(
      100,
      "Matching cap amount must be less than or equal to 100%."
    ),
  }),

  minDonationThreshold: yup
  .boolean()
  .required("You must select if you want a minimum donation threshold."),

  minDonationThresholdAmount: yup
  .number()
  .transform((value) => (isNaN(value) ? 0 : value))
  .when("minDonationThreshold", {
    is: true,
    then: yup
    .number()
    .required(
      "You must provide an amount for the minimum donation threshold."
    )
    .moreThan(0, "Minimum donation threshold must be more than zero."),
  }),

  sybilDefenseEnabled: yup
  .boolean()
  .required("You must select if you want to use sybil defense."),

  token: yup
  .string()
  .required("You must select a token."),
});

/**
 * Validation schema for the round eligibility section of the round form.
 */
export const eligibilityValidationSchema = yup.object().shape({
  description: yup.string().required("A round description is required."),
});


// DEPRECATE ME 
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

