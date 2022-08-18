// import RoundApplicationBuilder from "./RoundApplicationBuilder";
import { RoundApplicationMetadata, Project } from "../types";

// const roundApplicationMetadata: RoundApplicationMetadata = {
//   lastUpdatedOn: 1657817494040,
//   application_schema: [],
//   applicationSchema: [
//     {
//       id: 0,
//       question: "Email",
//       type: "TEXT",
//       required: true,
//       info: "",
//       encrypted: true,
//       choices: [],
//     },
//     {
//       id: 1,
//       question: "Twitter",
//       type: "TEXT",
//       required: true,
//       info: "",
//       choices: [],
//     },
//     {
//       id: 2,
//       question: "Github",
//       type: "TEXT",
//       required: true,
//       info: "",
//       choices: [],
//     },
//     {
//       id: 3,
//       question: "Funding Source",
//       type: "TEXT",
//       required: true,
//       info: "",
//       choices: [],
//     },
//     {
//       id: 4,
//       question: "Profit2022",
//       type: "TEXT",
//       required: true,
//       info: "",
//       choices: [],
//     },
//     {
//       id: 5,
//       question: "Team Size",
//       type: "TEXT",
//       required: true,
//       info: "",
//       choices: [],
//     },
//     {
//       id: 6,
//       question: "Project",
//       type: "PROJECT",
//       required: true,
//       info: "",
//       choices: [],
//     },
//     {
//       id: 7,
//       question: "Recipient Address",
//       type: "RECIPIENT",
//       required: true,
//       info: "",
//       choices: [],
//     },
//   ],
// };

// const formInputs = {
//   0: "email",
//   1: "tw",
//   2: "gh",
//   3: "fund",
//   4: "prof",
//   5: "size",
//   6: "999",
//   7: "0x000000000000000000000000000000000000beaf",
// };

// const project: Project = {
//   lastUpdated: 0,
//   id: "1",
//   title: "My Project",
//   description: "description 1234",
//   website: "http://example.com",
//   bannerImg: "project image 1234",
//   logoImg: "logo image 1234",
//   metaPtr: {
//     protocol: "1",
//     pointer: "pointer 1234",
//   },
// };

// describe("round application builder", () => {
//   it("builds", async () => {
//     const builder = new RoundApplicationBuilder(
//       true,
//       project,
//       roundApplicationMetadata,
//       "0x00",
//       "testnet"
//     );
//     const application = await builder.build("0x1234", formInputs);

//     expect(application.project).toEqual(project);
//     expect(application.round).toEqual("0x1234");
//     expect(application.recipient).toEqual(
//       "0x000000000000000000000000000000000000beaf"
//     );
//     expect(application.answers.length).toEqual(
//       roundApplicationMetadata.applicationSchema.length - 2
//     );
//   });
// });

// export {};
