import {graphql} from "msw"

export const handlers = [
  graphql.query("GetGrantApplications", (req, res, ctx) => {
    return res(
      ctx.data({
        roundProjects: [
          {
            id: "1",
            metaPtr: {
              protocol: 1,
              pointer: "some-ptr"
            },
            title: "Some Title 1",
            description: "Some project description 1",
            payoutAddress: "0xSomeAddress"
          },
          {
            id: "2",
            metaPtr: {
              protocol: 1,
              pointer: "some-ptr2"
            },
            title: "Some Title 2",
            description: "Some project description 2",
            payoutAddress: "0xSomeAddress2"
          },
          {
            id: "3",
            metaPtr: {
              protocol: 1,
              pointer: "some-ptr3"
            },
            title: "Some Title 3",
            description: "Some project description 3",
            payoutAddress: "0xSomeAddress3"
          }
        ]
      }),
    )
  })
  ]
