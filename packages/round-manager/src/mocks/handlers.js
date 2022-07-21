import {graphql} from "msw"

export const handlers = [
  graphql.query("GetGrantApplications", (req, res, ctx) => {
    console.log("🚨 IN MOCK")
    return res(
      ctx.data({
        roundProjects: [
          {
            id: "1",
            metaPtr: {
              protocol: 1,
              pointer: "some-ptr"
            },
            payoutAddress: "0xSomeAddress"
          }
        ]
      }),
    )
  })
  ]
