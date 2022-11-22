import * as aws from "@pulumi/aws";

export const calculate = new aws.lambda.CallbackFunction("calculate", {
  callback: async (ev, ctx) => {
    return {
      statusCode: 200,
      body: JSON.stringify({
        msg: "no votes",
      }),
    };
  },
});
