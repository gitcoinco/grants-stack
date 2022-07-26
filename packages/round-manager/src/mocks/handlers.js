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
              pointer: "bafybeih2pise44gkkzj7fdws3knwotppnh4x2gifnbxjtttuv7okw4mjzu"
            },
            title: "Some Title 1",
            description: "Some project description 1",
            payoutAddress: "0xSomeAddress"
          },
          {
            id: "2",
            metaPtr: {
              protocol: 1,
              pointer: "bafybeiceggy6uzfxsn3z6b2rraptp3g2kx2nrwailkjnx522yah43g5tyu"
            },
            title: "Some Title 2",
            description: "Some project description 2",
            payoutAddress: null
          },
          {
            id: "3",
            metaPtr: {
              protocol: 1,
              pointer: "bafybeiekytxwrrfzxvuq3ge5glfzlhkuxjgvx2qb4swodhqd3c3mtc5jay"
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
