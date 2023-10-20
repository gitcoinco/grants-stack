// Temporary mock data to load faster than waiting for api server response

function randomAddress(): string {
  const length: number = 40;
  const number: string = [...Array(length)]
    .map(() => {
      return Math.floor(Math.random() * 16).toString(16);
    })
    .join("");
  return "0x" + number;
}
export const mock = {
  collections: Array.from({ length: 4 }).map((_, i) => ({
    id: `collection-${i}`,
    name: `Collection ${i + 1}`,
    chainId: "PGN",
    projects: Array.from({ length: 4 }).map(() => ({
      id: randomAddress(),
    })),
  })),
  rounds: [
    {
      id: "0x0111684d6a81d34bb5cf6394c742facf4a372a27",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreidayu7lllpeonacatdjkkjkqrbrhit4vjqxphku5gwecfpjcv2p4a",
      },
      applicationsStartTime: "1695686400",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1695686400",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0xf7d21a59709ec1328b833d35d4eea9bbe529c1c0",
        strategyName: "DIRECT",
      },
      projects: [],
    },
    {
      id: "0x14a77b2b5ca4423917b2b39df9cbb42c501e2ebd",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreigzz6zsnz7oalkfdvygorpxhzyhuhlg2ghtnwetcrtsfq6m2ix3du",
      },
      applicationsStartTime: "1697661420",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1697661420",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0x4415ece8ce0e3e5f97a91f3827778316a1399414",
        strategyName: "DIRECT",
      },
      projects: [
        {
          id: "0x14a77b2b5ca4423917b2b39df9cbb42c501e2ebd-0",
        },
        {
          id: "0x14a77b2b5ca4423917b2b39df9cbb42c501e2ebd-1",
        },
      ],
    },
    {
      id: "0x14ce4eb84b41ad2e3721f7b298f697a4a4180eed",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreicqprezxxuxbsvcvwfj6shnji7t6jorxsjlfpe6a6ik44gfwp6bua",
      },
      applicationsStartTime: "1697500800",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1697500800",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0xd04d8c2f1c2f256821e1b5d65b45ee536ef15b62",
        strategyName: "DIRECT",
      },
      projects: [],
    },
    {
      id: "0x1530877ae5604a398b62a1b06cd88b0f32824596",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreidtf5fzbfvg43zpk2bzms3vveh46aw6vxqc5etomfb4eqycbzxyz4",
      },
      applicationsStartTime: "1687885200",
      applicationsEndTime: "1767139200",
      roundStartTime: "1687910400",
      roundEndTime: "1767139200",
      matchAmount: "100000000000000000000",
      token: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      payoutStrategy: {
        id: "0x15da7c25b3b3125771b867a0b23f9ec026a60d7a",
        strategyName: "MERKLE",
      },
      projects: [],
    },
    {
      id: "0x1a5a0b247dc3230079ebb4c7c6f258ef3067d010",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreiazjih54jvqeoz2zsuz4cxzioj3ndlx3tkob4nyc2ejs2rnxuwzba",
      },
      applicationsStartTime: "1691794800",
      applicationsEndTime: "1717200000",
      roundStartTime: "1691798400",
      roundEndTime: "1717200000",
      matchAmount: "25000000000000000000",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0x0a9839be8a68aa35f5717b4fa2a5ab69ecf2f05c",
        strategyName: "MERKLE",
      },
      projects: [
        {
          id: "0x1a5a0b247dc3230079ebb4c7c6f258ef3067d010-0",
        },
        {
          id: "0x1a5a0b247dc3230079ebb4c7c6f258ef3067d010-1",
        },
      ],
    },
    {
      id: "0x1f09f94e18ef3084d4bab24b6060d0208d5efaea",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreifjkkk4cofwtbrj5qg3danmywdbzqi542gv2fyac76j6znuk5jpc4",
      },
      applicationsStartTime: "1696896000",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1696896000",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0x8aa2f075c5a1cff7122636fea76af7b4e56c51c7",
        strategyName: "DIRECT",
      },
      projects: [],
    },
    {
      id: "0x21fe7b098a69f59e3483e260b76798fe32d815ce",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreigbuvsvt5p743sy6yyszdf2wbl3puebvwveagqhdlsn6x2kammv3q",
      },
      applicationsStartTime: "1697238000",
      applicationsEndTime: "1697932800",
      roundStartTime: "1697241600",
      roundEndTime: "1697932800",
      matchAmount: "4000000000000000000",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0xf83e9dc3cbd0f13ce536bc65b848f3254a0dae3c",
        strategyName: "MERKLE",
      },
      projects: [
        {
          id: "0x21fe7b098a69f59e3483e260b76798fe32d815ce-0",
        },
        {
          id: "0x21fe7b098a69f59e3483e260b76798fe32d815ce-2",
        },
        {
          id: "0x21fe7b098a69f59e3483e260b76798fe32d815ce-3",
        },
        {
          id: "0x21fe7b098a69f59e3483e260b76798fe32d815ce-4",
        },
        {
          id: "0x21fe7b098a69f59e3483e260b76798fe32d815ce-5",
        },
        {
          id: "0x21fe7b098a69f59e3483e260b76798fe32d815ce-6",
        },
        {
          id: "0x21fe7b098a69f59e3483e260b76798fe32d815ce-7",
        },
      ],
    },
    {
      id: "0x268ff9ac94997e0277b340b6f81c818d11e2fe32",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreigssb7palgamsfyzc6ppd7ufjftiweyd3cgvvzikvxxilnj4ky63y",
      },
      applicationsStartTime: "1696809600",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1696809600",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0xf241a55b57b050ee1c4c941c7b12519654d4198b",
        strategyName: "DIRECT",
      },
      projects: [],
    },
    {
      id: "0x29e43278861ca84e74aa95acb215a8b447b9b751",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreibwugp3faux3djgxl5n3tyoolyo6mvorb3edk3k73mpwcxve4t2ky",
      },
      applicationsStartTime: "1687962300",
      applicationsEndTime: "1767139200",
      roundStartTime: "1687996800",
      roundEndTime: "1767139200",
      matchAmount: "100000000000000000000",
      token: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      payoutStrategy: {
        id: "0x9a0cda0e177e425f2b9416f1b40f1b1857e6505d",
        strategyName: "MERKLE",
      },
      projects: [
        {
          id: "0x29e43278861ca84e74aa95acb215a8b447b9b751-0",
        },
        {
          id: "0x29e43278861ca84e74aa95acb215a8b447b9b751-1",
        },
        {
          id: "0x29e43278861ca84e74aa95acb215a8b447b9b751-2",
        },
        {
          id: "0x29e43278861ca84e74aa95acb215a8b447b9b751-3",
        },
        {
          id: "0x29e43278861ca84e74aa95acb215a8b447b9b751-4",
        },
      ],
    },
    {
      id: "0x2bdaf464d6611ae2f820549d8888f9c8c3ae14cc",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreihwjmqc6pxvemqbefuqrntcbglynzmkg7xeir3dtdyp35q6gb4ovy",
      },
      applicationsStartTime: "1687291200",
      applicationsEndTime: "1924905600",
      roundStartTime: "1687305600",
      roundEndTime: "1924905600",
      matchAmount: "1000000000000000000",
      token: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      payoutStrategy: {
        id: "0x649fd15d47d77b4618ee088e74d6c781b591f06c",
        strategyName: "MERKLE",
      },
      projects: [],
    },
    {
      id: "0x2c2f8c55103017d716a7650a0914635703012022",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreife2cttbsdumh2tpvqx37wbzbj5xb4qp64cvet2lp2iiyxgzqj7km",
      },
      applicationsStartTime: "1697155200",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1697155200",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0x987611da93be7bc018eb0882008d5c078c0e1109",
        strategyName: "DIRECT",
      },
      projects: [],
    },
    {
      id: "0x32636962794ac5dd6782d1002271e80c9c8c03af",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreihknnwplqeypzzuixswmflvpt57ytoz33fjna37kiexmys6qg4sha",
      },
      applicationsStartTime: "1692210600",
      applicationsEndTime: "1698710400",
      roundStartTime: "1694908800",
      roundEndTime: "1698710400",
      matchAmount: "1000000000000000",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0xe8a46fd643e6e46c4d1724b54e9fa7a052b68312",
        strategyName: "MERKLE",
      },
      projects: [],
    },
    {
      id: "0x3c4a95448e356cd28ce1e4b948fcd76b5175d8e3",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreihuzz46ug47buquae5b5x5shcpge7guooefitpvj2dc7bk4mubbhq",
      },
      applicationsStartTime: "1695772800",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1695772800",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0xbf559ec0ae4b2dc2e23a093d8d3ff2f36a64ed5c",
        strategyName: "DIRECT",
      },
      projects: [],
    },
    {
      id: "0x3d98d29d6b268a4aba48f3565b7cf4e90f4e30be",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreidnna2z4dvtxqhxt5z6bfo3gqjqxnuxljl4eibeynj64favbf77ni",
      },
      applicationsStartTime: "1694908800",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1694908800",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0x20f3ac554ec8719c6f2701adae1bfda53469d235",
        strategyName: "DIRECT",
      },
      projects: [],
    },
    {
      id: "0x595d421ea0433db259c89dd14421ad42be17de43",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreifsej2dj75rvvriii7bo5gcs67dngbx3rg7jphau2cwupqlbccsou",
      },
      applicationsStartTime: "1696608000",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1696608000",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0xc809c399a10c81e0101631a9853122c153fed946",
        strategyName: "DIRECT",
      },
      projects: [],
    },
    {
      id: "0x5cbb60f567e9c3a4c48f0dcbe660d25edb525751",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreibxmmtqwo7yo66aetfokrsuefp5kd7qewdkoqgfl4f4ivhk7hekli",
      },
      applicationsStartTime: "1696834800",
      applicationsEndTime: "1697932800",
      roundStartTime: "1698019200",
      roundEndTime: "1698710400",
      matchAmount: "2000000000000000000000",
      token: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      payoutStrategy: {
        id: "0x1ff931db88de9901305e2ee2bd2679b6b4ea978a",
        strategyName: "MERKLE",
      },
      projects: [],
    },
    {
      id: "0x5f0a2536f2782dde017cc946272f9b98e520cf45",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreif6k5kpw2krzdidnihvabn2hh6azdicgqsz5tjkxdm77tz2sgfkri",
      },
      applicationsStartTime: "1691611200",
      applicationsEndTime: "1722470400",
      roundStartTime: "1691625600",
      roundEndTime: "1722470400",
      matchAmount: "10000000000000000000",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0xf8746a374962e51255ff1d13a38d24f51443915d",
        strategyName: "MERKLE",
      },
      projects: [],
    },
    {
      id: "0x6183a3485acb8772153b6cc5a22950872e177fc1",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreibzneufbzqwfmndyyu66yqfb7w6wk5awy7venrlyep2xu4uowfzba",
      },
      applicationsStartTime: "1695513600",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1695513600",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0x5ebb8189d8ddb21a86db900c89e656fd57ffd14c",
        strategyName: "DIRECT",
      },
      projects: [],
    },
    {
      id: "0x624517f6eecef358b0ab1ac57ef27922ceecf182",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreign2peyoar2l55v4rb5x3ccwksyqm2vjzjixfiqdrxeucrujqlfo4",
      },
      applicationsStartTime: "1696118400",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1696118400",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0x9fe57de9889399e1e5dddf3aa7e9122714505cda",
        strategyName: "DIRECT",
      },
      projects: [
        {
          id: "0x624517f6eecef358b0ab1ac57ef27922ceecf182-0",
        },
        {
          id: "0x624517f6eecef358b0ab1ac57ef27922ceecf182-2",
        },
      ],
    },
    {
      id: "0x633b4ec6f743ac6b9888355893d1b1ef38f42232",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreigjxpf3s7zjxrj6kbzwlpz6p3vgclyv6bwa66p2sutbclgvqsypiu",
      },
      applicationsStartTime: "1696548600",
      applicationsEndTime: "1698710400",
      roundStartTime: "1696550400",
      roundEndTime: "1698710400",
      matchAmount: "100000000000000",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0xf5578dcc641b6ee0c0d1f08b3a14ddd3e99c7e84",
        strategyName: "MERKLE",
      },
      projects: [],
    },
    {
      id: "0x6d9f7a4c35573801601931ad0e4980cebc8b595d",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreid6eiivcjtaz6jk3jmlr6zrzirzpqwkusgic6gns4ctjaoh32w4tq",
      },
      applicationsStartTime: "1695513600",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1695513600",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0x28d2427054ec0124785b32442a6fbe1cb6272a42",
        strategyName: "DIRECT",
      },
      projects: [],
    },
    {
      id: "0x6fadc3de6d28815abee5d7bad550798301ebd65d",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreib3zmpipsjl4nhvpihsfa6ykhhkwvpnwyi3pmpwc4rnv4ta23u7di",
      },
      applicationsStartTime: "1691776800",
      applicationsEndTime: "1704067200",
      roundStartTime: "1691798400",
      roundEndTime: "1704067200",
      matchAmount: "15000000000000000000",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0x9b7a9d0a6f1899d3fc1b74d5c5d0936a66875fd3",
        strategyName: "MERKLE",
      },
      projects: [],
    },
    {
      id: "0x7013532674ed9e657b46323ab70eb5b9cd9bebed",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreiahhlte6kphnpn2zfcy6vf7eutusdllcleookcmli4aawufjd6c2a",
      },
      applicationsStartTime: "1696377600",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1696377600",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0xef298b45c813f79666e1f684b6e2d63f969804ae",
        strategyName: "DIRECT",
      },
      projects: [],
    },
    {
      id: "0x77d77be8c1b9f9fcf0f7c7e1d4d1613b178e5224",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreica2sntvywyicmrtmpqn7juz7wxrr544acl4aydb52qbtiwqdjuey",
      },
      applicationsStartTime: "1695759000",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1695759000",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0x8e2068652289bd30b17d163662a02302062be6d8",
        strategyName: "DIRECT",
      },
      projects: [
        {
          id: "0x77d77be8c1b9f9fcf0f7c7e1d4d1613b178e5224-0",
        },
      ],
    },
    {
      id: "0x7e30092c4a71dd41cada9a8cac557c979f4daf15",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreicr7g4aaumyxsajztmqmuvhatvm4q6xvbk2d2orwqgzz4boeauveu",
      },
      applicationsStartTime: "1694304000",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1694304000",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0xdcc41c114091ab7b9127c56ff3383909c324d884",
        strategyName: "DIRECT",
      },
      projects: [],
    },
    {
      id: "0x8125aa4ed3a1b6b8780256e59654bc73289ed267",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreiffvfw6tvxuscjr5zwt3ankbjw3x4c5kgg4jij2c5dwdgzeem7m3u",
      },
      applicationsStartTime: "1694390400",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1694390400",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0xb565cc5aef7ef11c25af22afb1716e1fad74319b",
        strategyName: "DIRECT",
      },
      projects: [],
    },
    {
      id: "0x81d3f5fa582133fb07c3846ebaa292923c77ea9c",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreicuxgp7ltvf2ecbzjdbwebazbaldio76oqdcq2iag4z6b4sxtauve",
      },
      applicationsStartTime: "1693872000",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1693872000",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0xefc36c004d3007cca614846a9b4c9dc2e62ca946",
        strategyName: "DIRECT",
      },
      projects: [],
    },
    {
      id: "0x84de8abdd4534812ed3b2ac1f861577075cac8e0",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreib5w7ba2arq5ylsmx2i242hipkpjryfmvkbmzdpl3s7gewb75fosi",
      },
      applicationsStartTime: "1693924020",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1693924020",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0x6dcc44ddb824afa90c03dde57f0a0cb979d300b0",
        strategyName: "DIRECT",
      },
      projects: [
        {
          id: "0x84de8abdd4534812ed3b2ac1f861577075cac8e0-0",
        },
      ],
    },
    {
      id: "0x8c3a9740516fc4c8800987ac24188d461dcbe842",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreibptax7ucqxloyvsroqqimaqthsfdbbcxh2lhz5m3lcepwosujydu",
      },
      applicationsStartTime: "1697468400",
      applicationsEndTime: "1698710400",
      roundStartTime: "1698019200",
      roundEndTime: "1698710400",
      matchAmount: "10000000000000000000",
      token: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      payoutStrategy: {
        id: "0xa532953bb853f3c2a3cbdf305f629c90bd4c387e",
        strategyName: "MERKLE",
      },
      projects: [],
    },
    {
      id: "0x9619e3f4cc98d884228dfa77e9efce7c6dacd8ee",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreiau76jkz67n32gsuoo42aou4dd2db6mime73dtsy5hldwvhcenboq",
      },
      applicationsStartTime: "1697392800",
      applicationsEndTime: "1697932800",
      roundStartTime: "1698019200",
      roundEndTime: "1698624000",
      matchAmount: "10000000000000000",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0x468933e98524b1eb315d1028468f7455a4fd8c1a",
        strategyName: "MERKLE",
      },
      projects: [],
    },
    {
      id: "0x972277202c86ae1308cc4339bcd9f2dad282e2a1",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreibvbly7apuid35foegletfu5itrewiq6ehbwgoimcd664awlmxcje",
      },
      applicationsStartTime: "1694304000",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1694304000",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0x3438c6bbfb1247063c4d36b231f672d226f781e5",
        strategyName: "DIRECT",
      },
      projects: [],
    },
    {
      id: "0x9e4d7ee27bc99a35ba384884ebd5ab859ba1719f",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreifklemjkkxlus5aa6m64nvjc36mz2mmrwxgxcu6lg2rq2k75luevq",
      },
      applicationsStartTime: "1697115600",
      applicationsEndTime: "1698278400",
      roundStartTime: "1698364800",
      roundEndTime: "1699574400",
      matchAmount: "2000000000000000000000",
      token: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      payoutStrategy: {
        id: "0xd8619744c05742a54a8402d9f4eb3a478119d4c4",
        strategyName: "MERKLE",
      },
      projects: [],
    },
    {
      id: "0xa1a3c0607463864594a1e6eb45a9eb46f556a984",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreihwjmqc6pxvemqbefuqrntcbglynzmkg7xeir3dtdyp35q6gb4ovy",
      },
      applicationsStartTime: "1687289520",
      applicationsEndTime: "1924905600",
      roundStartTime: "1687305600",
      roundEndTime: "1924905600",
      matchAmount: "1000000000000000000",
      token: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      payoutStrategy: {
        id: "0xccc305d2c5be3b7ee7937d300b3ddd89a631e1e8",
        strategyName: "MERKLE",
      },
      projects: [],
    },
    {
      id: "0xae18f327ce481a7316d28a625d4c378c1f8b03a2",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreidqg37yhkhpky2j45z3lpotoqjy4ytkgs2x2nybekuzlalnjvyewu",
      },
      applicationsStartTime: "1696377600",
      applicationsEndTime: "1704067200",
      roundStartTime: "1696377600",
      roundEndTime: "1704067200",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0x9dae06d6220ddbfd320aa6582182dc2a2faeb39f",
        strategyName: "DIRECT",
      },
      projects: [],
    },
    {
      id: "0xae53557089a1d771cd5cebeaf6accbe8f064ff4c",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreigvnhfyjf2q55tnmapjtzywh7taufvyl55jc2vzdgrlpel3viah4m",
      },
      applicationsStartTime: "1689112800",
      applicationsEndTime: "1720569600",
      roundStartTime: "1689120000",
      roundEndTime: "1720569600",
      matchAmount: "100000000000000000",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0xf346ac7c09b40af87564b8249a8469481e8738a8",
        strategyName: "MERKLE",
      },
      projects: [],
    },
    {
      id: "0xb1f3112a9c8417e99b7ebdd77345ab463e4872cd",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreih4bgonvm3jazzuwzswtclkqyc5fp6nsfxolvlc6dbk7gcw6b7liq",
      },
      applicationsStartTime: "1696896000",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1696896000",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0x5fd408e59150b6bca5eaeb5b7151129c0d2aed93",
        strategyName: "DIRECT",
      },
      projects: [],
    },
    {
      id: "0xb9c5c71af0f1c6ef1960e2e47c182695fe15d175",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreia4uaclczkprpn534oeu5lmdoytarh2lgd27ntkr5yp2bpbajdaa4",
      },
      applicationsStartTime: "1694794200",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1694794200",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0xca476eddb6c98d1a41e327404cbb8e0e471f7686",
        strategyName: "DIRECT",
      },
      projects: [
        {
          id: "0xb9c5c71af0f1c6ef1960e2e47c182695fe15d175-0",
        },
        {
          id: "0xb9c5c71af0f1c6ef1960e2e47c182695fe15d175-1",
        },
      ],
    },
    {
      id: "0xbb8832075401e82e1a1535e6af6b3883de45a6cf",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreiatykwvx7v7i4akvkrx56zfsukxgca5yakj534dpk77s6psjex5h4",
      },
      applicationsStartTime: "1697661300",
      applicationsEndTime: "1697846400",
      roundStartTime: "1697661300",
      roundEndTime: "1697846400",
      matchAmount: "100000000000000",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0x1a0da3203dd3de17dd8a6e6dcfb6fd968ec7614f",
        strategyName: "MERKLE",
      },
      projects: [
        {
          id: "0xbb8832075401e82e1a1535e6af6b3883de45a6cf-0",
        },
        {
          id: "0xbb8832075401e82e1a1535e6af6b3883de45a6cf-1",
        },
        {
          id: "0xbb8832075401e82e1a1535e6af6b3883de45a6cf-2",
        },
      ],
    },
    {
      id: "0xc3b32870f54044f6f0c4a3feb6b57ae16636f355",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreign6zxkttgahwgmg4gv3yvmt5p7sgpbp5y5enzyxit5c5ogebczzq",
      },
      applicationsStartTime: "1696428000",
      applicationsEndTime: "1698019200",
      roundStartTime: "1697328000",
      roundEndTime: "1698019200",
      matchAmount: "100000000000000000000",
      token: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      payoutStrategy: {
        id: "0x3e4c7057b3f9a6b82489022cbd8f4b662ab7433f",
        strategyName: "MERKLE",
      },
      projects: [],
    },
    {
      id: "0xcf3545cd02aa62dc9198887f8df0e0cf21f6e1c3",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreibww6kr7aphimxbrowtv2cng4inkhknhb2t5dphlqs2m432lfgcxe",
      },
      applicationsStartTime: "1697634000",
      applicationsEndTime: "1701907200",
      roundStartTime: "1699920000",
      roundEndTime: "1701907200",
      matchAmount: "1500000000000000000000",
      token: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      payoutStrategy: {
        id: "0x2e60d4f53e8baa753b8ea14589e9aed45319fe62",
        strategyName: "MERKLE",
      },
      projects: [],
    },
    {
      id: "0xe33e85e2df56ec4cd1362600b8d70766b3210837",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreibv5z7zwz2eafuy33rgtzrlyysr5anyqfr37czlhk2nhi7fpaa75a",
      },
      applicationsStartTime: "1697414400",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1697414400",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0x7d2c084897e17cb7306eecf660a4cb1abe455dfa",
        strategyName: "DIRECT",
      },
      projects: [],
    },
    {
      id: "0xe88f25dbc61a9692a3301cceec2c0e81fe1213c7",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreigiidiwzerbofnoghgodce6d6nduyuvt2f6q6fz7efg7jrso75chq",
      },
      applicationsStartTime: "1697634000",
      applicationsEndTime: "1701907200",
      roundStartTime: "1699920000",
      roundEndTime: "1701907200",
      matchAmount: "1500000000000000000000",
      token: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      payoutStrategy: {
        id: "0x8fe71911529ceabb60691512e115a4f357dd9267",
        strategyName: "MERKLE",
      },
      projects: [],
    },
    {
      id: "0xf1ed2f6bfa2ecde396ccc889d4f1af952b70b986",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreibxmmtqwo7yo66aetfokrsuefp5kd7qewdkoqgfl4f4ivhk7hekli",
      },
      applicationsStartTime: "1696834800",
      applicationsEndTime: "1697932800",
      roundStartTime: "1698019200",
      roundEndTime: "1698710400",
      matchAmount: "2000000000000000000000",
      token: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      payoutStrategy: {
        id: "0xc71a6ec18e7792141b63a6c51fefa01886894df0",
        strategyName: "MERKLE",
      },
      projects: [],
    },
    {
      id: "0xf3c8d0206910dd955e61c82efe40f232a3d2fe14",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreiecras37qqe35eoyzbbikpbzxvawl5pxdqozksfto7lwtbsgl2ob4",
      },
      applicationsStartTime: "1697707440",
      applicationsEndTime: "1697776200",
      roundStartTime: "1697788800",
      roundEndTime: "1697864400",
      matchAmount: "5000000000000000",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0x3deb7bc97dca1d16d09b3795c9e8058f1446bc11",
        strategyName: "MERKLE",
      },
      projects: [
        {
          id: "0xf3c8d0206910dd955e61c82efe40f232a3d2fe14-0",
        },
        {
          id: "0xf3c8d0206910dd955e61c82efe40f232a3d2fe14-1",
        },
      ],
    },
    {
      id: "0xf3cd7429e863a39a9ecab60adc4676c1934076f2",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreidklfapbgjxd5zpucgdbpbt33lmbfqrx2nbbjrm6my3bapirf6444",
      },
      applicationsStartTime: "1690902000",
      applicationsEndTime: "3500668800",
      roundStartTime: "1690934400",
      roundEndTime: "3502828800",
      matchAmount: "1000000000000000",
      token: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      payoutStrategy: {
        id: "0x38236f7b6ce0014b4a337b33f504d375098b8e78",
        strategyName: "MERKLE",
      },
      projects: [],
    },
    {
      id: "0xf513da2df52e7e79c555a28497c39bb95d6b35ce",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreiekmrzymtwoayetosppro5mtufc3nbbwj63au7zxqxdc3htl5osuu",
      },
      applicationsStartTime: "1696291200",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1696291200",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0x07f4ef26aea72de591deae68cb4cd6c4b1db863f",
        strategyName: "DIRECT",
      },
      projects: [],
    },
    {
      id: "0xf85916a04774a9c5e9786c70101c7911053533a1",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreid377yvuac26j3vz2l3olutr3quisbplusn64gz524lcv4ivqlsm4",
      },
      applicationsStartTime: "1689533280",
      applicationsEndTime: "1767225600",
      roundStartTime: "1689552000",
      roundEndTime: "1767225600",
      matchAmount: "100000000000000",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0xfc4ac902d6f6d27bd3530b9b8f6808c484547bb2",
        strategyName: "MERKLE",
      },
      projects: [
        {
          id: "0xf85916a04774a9c5e9786c70101c7911053533a1-0",
        },
        {
          id: "0xf85916a04774a9c5e9786c70101c7911053533a1-1",
        },
      ],
    },
    {
      id: "0xf868c7dc4912d76be0328f5046953415b165b8ba",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreiav2twblcotpvux4zhlcr4zznr7cvt7fuiu4zmyon3c5edovw4ngm",
      },
      applicationsStartTime: "1693526400",
      applicationsEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      roundStartTime: "1693526400",
      roundEndTime:
        "115792089237316195423570985008687907853269984665640564039457584007913129639935",
      matchAmount: "0",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0xe9c0d8494578ff25203fc7d1f07f4648234f71f7",
        strategyName: "DIRECT",
      },
      projects: [],
    },
    {
      id: "0xfb88676220d1dab3b068c86d1ca338794e1b48cf",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreicqe7la6gv3a2ppv4i76sgws7lfxnhrvmqybhprtzqvf4x6ugtwgu",
      },
      applicationsStartTime: "1697083200",
      applicationsEndTime: "1697932800",
      roundStartTime: "1698019200",
      roundEndTime: "1699401600",
      matchAmount: "6000000000000000000000",
      token: "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      payoutStrategy: {
        id: "0x34bc382995a816e34dc62bc96f126ca7f4d50c45",
        strategyName: "MERKLE",
      },
      projects: [
        {
          id: "0xfb88676220d1dab3b068c86d1ca338794e1b48cf-0",
        },
        {
          id: "0xfb88676220d1dab3b068c86d1ca338794e1b48cf-1",
        },
        {
          id: "0xfb88676220d1dab3b068c86d1ca338794e1b48cf-10",
        },
        {
          id: "0xfb88676220d1dab3b068c86d1ca338794e1b48cf-11",
        },
        {
          id: "0xfb88676220d1dab3b068c86d1ca338794e1b48cf-12",
        },
        {
          id: "0xfb88676220d1dab3b068c86d1ca338794e1b48cf-13",
        },
        {
          id: "0xfb88676220d1dab3b068c86d1ca338794e1b48cf-2",
        },
        {
          id: "0xfb88676220d1dab3b068c86d1ca338794e1b48cf-3",
        },
        {
          id: "0xfb88676220d1dab3b068c86d1ca338794e1b48cf-5",
        },
        {
          id: "0xfb88676220d1dab3b068c86d1ca338794e1b48cf-6",
        },
        {
          id: "0xfb88676220d1dab3b068c86d1ca338794e1b48cf-7",
        },
        {
          id: "0xfb88676220d1dab3b068c86d1ca338794e1b48cf-8",
        },
        {
          id: "0xfb88676220d1dab3b068c86d1ca338794e1b48cf-9",
        },
      ],
    },
    {
      id: "0xfe36ff9c59788a6a9ad7a979f459d69372dad0e6",
      roundMetaPtr: {
        protocol: 1,
        pointer: "bafkreia6ab26pzevwi3ufluebqamwvhyfc7ptky2fpohbq2pfbqtg4otwi",
      },
      applicationsStartTime: "1690763940",
      applicationsEndTime: "1719792000",
      roundStartTime: "1690764000",
      roundEndTime: "1719792000",
      matchAmount: "15000000000000000000",
      token: "0x0000000000000000000000000000000000000000",
      payoutStrategy: {
        id: "0x9a82fa0f8d8dfdc9730db9c1e7f2d8282a207ad7",
        strategyName: "MERKLE",
      },
      projects: [],
    },
  ]
    .filter((r) => r.payoutStrategy?.strategyName)
    .map((r) => ({
      ...r,
      chainId: "PGN",
      applicationMetaPtr: { protocol: 1, pointer: "" },
      projects: undefined,
      roundMetadata: {
        feesPercentage: 0,
        feesAddress: "",
        name: "Round Name",
        support: {
          info: "https://docs.space.id/getting-started/programs/space-id-grant-program",
          type: "Website",
        },
        roundType: "public",
        eligibility: {
          description:
            "SPACE ID Grant Program Season 3 is distributing grants for SPACE ID Web3 Name SDK integrations and apps built on the SPACE ID ecosystem.",
          requirements: [],
        },
        programContractAddress: "0xed62028a65c983a89cf4a8abc8ad6342eb2b6730",
      },
    })),
};
