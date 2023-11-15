export type Collection = {
  id: string;
  author: string;
  name: string;
  description: string;
  projects: string[];
};

// TODO: Define collections
// Temporary projects
const projectRefs = [
  "424:0x98720dD1925d34a2453ebC1F91C9d48E7e89ec29:99",
  "424:0x98720dD1925d34a2453ebC1F91C9d48E7e89ec29:53",
  "424:0x98720dD1925d34a2453ebC1F91C9d48E7e89ec29:78",
  "424:0xd4CC0dd193c7DC1d665AE244cE12D7FAB337a008:131",
  "424:0xd4CC0dd193c7DC1d665AE244cE12D7FAB337a008:75",
  "424:0xE60A569eC8aac2045d9fda306DC2a16CC1e52a90:16",
  "424:0x98720dD1925d34a2453ebC1F91C9d48E7e89ec29:19",
  "424:0x98720dD1925d34a2453ebC1F91C9d48E7e89ec29:86",
  "10:0x5eB890e41c8D2cFF75ea942085E406bB90016561:15",
  "424:0xd4CC0dd193c7DC1d665AE244cE12D7FAB337a008:133",
  "424:0xd4CC0dd193c7DC1d665AE244cE12D7FAB337a008:35",
  "424:0xd4CC0dd193c7DC1d665AE244cE12D7FAB337a008:107",
  "424:0x98720dD1925d34a2453ebC1F91C9d48E7e89ec29:14",
  "424:0xd4CC0dd193c7DC1d665AE244cE12D7FAB337a008:110",
  "10:0x5eB890e41c8D2cFF75ea942085E406bB90016561:7",
  "10:0xc9A01d3d2505D9d2418DD2da64d06cf53fD403a0:15",
  "424:0x98720dD1925d34a2453ebC1F91C9d48E7e89ec29:237",
  "424:0xd4CC0dd193c7DC1d665AE244cE12D7FAB337a008:80",
  "10:0x6726FE9C89fb04eAEf388C11cF55Be6AA0a62fb9:3",
  "424:0x98720dD1925d34a2453ebC1F91C9d48E7e89ec29:68",
  "10:0x5eB890e41c8D2cFF75ea942085E406bB90016561:81",
  "424:0x98720dD1925d34a2453ebC1F91C9d48E7e89ec29:176",
  "424:0xd4CC0dd193c7DC1d665AE244cE12D7FAB337a008:25",
  "424:0x98720dD1925d34a2453ebC1F91C9d48E7e89ec29:114",
  "10:0x5eB890e41c8D2cFF75ea942085E406bB90016561:45",
  "424:0x98720dD1925d34a2453ebC1F91C9d48E7e89ec29:0",
  "10:0x6726FE9C89fb04eAEf388C11cF55Be6AA0a62fb9:15",
  "424:0x98720dD1925d34a2453ebC1F91C9d48E7e89ec29:48",
  "42161:0x3ac78e1Ae5086904d53b41c747188216789f59a7:21",
  "10:0x6726FE9C89fb04eAEf388C11cF55Be6AA0a62fb9:25",
  "10:0xc9A01d3d2505D9d2418DD2da64d06cf53fD403a0:18",
  "424:0x98720dD1925d34a2453ebC1F91C9d48E7e89ec29:59",
  "424:0xd4CC0dd193c7DC1d665AE244cE12D7FAB337a008:43",
  "10:0x5eB890e41c8D2cFF75ea942085E406bB90016561:21",
  "424:0x98720dD1925d34a2453ebC1F91C9d48E7e89ec29:181",
  "424:0xd4CC0dd193c7DC1d665AE244cE12D7FAB337a008:41",
  "424:0xd4CC0dd193c7DC1d665AE244cE12D7FAB337a008:134",
  "424:0xd4CC0dd193c7DC1d665AE244cE12D7FAB337a008:132",
  "424:0x98720dD1925d34a2453ebC1F91C9d48E7e89ec29:28",
  "10:0x5eB890e41c8D2cFF75ea942085E406bB90016561:64",
  "424:0x98720dD1925d34a2453ebC1F91C9d48E7e89ec29:5",
  "10:0xc9A01d3d2505D9d2418DD2da64d06cf53fD403a0:4",
  "424:0xd4CC0dd193c7DC1d665AE244cE12D7FAB337a008:24",
  "42161:0x3ac78e1Ae5086904d53b41c747188216789f59a7:19",
  "10:0x5eB890e41c8D2cFF75ea942085E406bB90016561:14",
  "424:0x98720dD1925d34a2453ebC1F91C9d48E7e89ec29:200",
];
export const collections: Collection[] = [
  {
    id: "0xb73d25c8d9df76e1acce9e5c65dcdfffac803cd6",
    author: "0xD5c94d0BfCa611E3BF61228E85FC5374c4dEB4c0",
    name: "Red-cockaded Woodpecker",
    description:
      "Eius cupiditate eveniet esse minus culpa consectetur totam. Odit fugit tempore quas rerum provident cum fuga. Quam in numquam.",
  },
  {
    id: "0x6b81c9ae7c3a70afd10d5dae14998c7d03f36ecc",
    author: "0xfdb03365fda63aac9c06b3e10baa66fd4335c29e",
    name: "Double-crested Cormorant",
    description:
      "Maxime quos possimus quidem quisquam. Laboriosam excepturi iste fugiat unde. Sapiente doloribus adipisci earum voluptas. Sit voluptatem eos vero soluta perspiciatis cum.",
  },
  {
    id: "0xdcfcf96ffd46331c3e28add9c4c0ba46dcee101a",
    author: "0xd17e0ff01e3de7676fecfea3afaf00ceb7b1edea",
    name: "Bell's Vireo",
    description:
      "Sed doloribus iusto at consequuntur similique. Et asperiores ea corrupti. Ut harum perferendis cum autem odit quidem quam repellat repudiandae. Minima sint atque quo maiores. Ipsa eius ex nobis atque tempore odio tempora dolores.",
  },
  {
    id: "0x93ca76b9ef349f0cfb1c9d5b3d60fbb3ce77a5d6",
    author: "0x6fd43ca0bfefac09abdb9befcd7aabdb27b1dcdc",
    name: "Northern Saw-whet Owl",
    description:
      "Quaerat aliquid commodi similique ad non. Itaque eum culpa nulla numquam repudiandae natus facere iusto adipisci. Aperiam voluptatem error consequuntur modi ea. Debitis aliquam vero. Minima molestias libero perspiciatis maxime fugiat dolor fuga eveniet. Blanditiis quam minus nulla.",
  },
  {
    id: "0xcfcecad9d59feeb696f96dccff1cbc506be7efec",
    author: "0x11b42a1cd34bdadfc863b5fbc47eeb3f69de06dd",
    name: "Mugimaki Flycatcher",
    description:
      "Atque velit quia magnam suscipit explicabo. Qui doloremque repellat deserunt voluptas ratione quo. Vel iusto illum. Voluptatem dolor rerum voluptates modi. Sit ex explicabo delectus eum. Rem explicabo eum aut quas iure explicabo odit quod nemo.",
  },
  {
    id: "0x5f54fa1cfec0f3b8d1ab7b7fd5cffd4400aead13",
    author: "0x01acfed7ee95c958c1cea58eb62deba5d1cedfb0",
    name: "Crissal Thrasher",
    description:
      "Natus velit consequatur veritatis ab distinctio asperiores repudiandae dolorum molestiae. Quibusdam iste laborum nostrum distinctio ducimus cum commodi ullam accusamus. Itaque inventore excepturi. Maiores reiciendis numquam nesciunt voluptas culpa ipsam commodi tempora ipsa.",
  },
  {
    id: "0xae03dbde4f7dac3caa56806eb93294c293eeac5f",
    author: "0x795aecae4c9c4e4b1127aece5d99adb8c5c8ca6f",
    name: "Spotted Dove",
    description:
      "Vero perspiciatis magnam. Hic tenetur atque ducimus possimus quia ullam quaerat. Pariatur consequatur voluptatum. Est enim unde sint sint unde soluta. Voluptatum officiis adipisci numquam. Sed enim provident ipsa iusto maxime dolor suscipit error.",
  },
  {
    id: "0xbb27de75f17cbfbefc729bec75ac7ea5fc5d0c34",
    author: "0xa2e3bc969c5d6526c08ee2ecab10977b37269848",
    name: "Vermilion Flycatcher",
    description:
      "Perferendis deserunt porro neque inventore nostrum at ab inventore. Velit voluptate quod aspernatur aliquam possimus amet nemo aliquam. Blanditiis beatae sunt. Placeat molestiae dolore quam.",
  },
  {
    id: "0x1dd3ca766d1cebbdada6f5261bf2161b451dd7ed",
    author: "0xd6e4cbffecaddeca71ef4a0d53efd49d9c1f4bbd",
    name: "Far Eastern Curlew",
    description:
      "Harum ipsam maxime perspiciatis hic similique eveniet voluptatem est. Blanditiis laborum quibusdam quis quos voluptas ipsum. Asperiores ab minus. Dolorum officia ipsa nobis accusamus amet ex. Odio iure eaque accusantium saepe molestiae accusantium esse. Laboriosam saepe libero maxime vero numquam.",
  },
  {
    id: "0xb5fe5dc58a6f2aca3bdb7a33a25dc9e5ba3ffc1f",
    author: "0xa52dcc11febce1ee56e0cf5be73d376a29c9a740",
    name: "Black-winged Stilt",
    description:
      "Culpa tempora quo eveniet atque a iusto harum. Molestiae autem voluptates quasi quod quae voluptate nam sint. Doloribus non ullam maxime tempora molestiae nostrum.",
  },
  {
    id: "0xb5fe5dc58a6f2aca3bdb7a33a25dc9e5ba3ffc1e",
    author: "0xa52dcc11febce1ee56e0cf5be73d376a29c9a740",
    name: "Black-winged Stilt 2",
    description:
      "Culpa tempora quo eveniet atque a iusto harum. Molestiae autem voluptates quasi quod quae voluptate nam sint. Doloribus non ullam maxime tempora molestiae nostrum.",
  },
  {
    id: "0xb5fe5dc58a6f2aca3bdb7a33a25dc9e5ba3ffc1g",
    author: "0xa52dcc11febce1ee56e0cf5be73d376a29c9a740",
    name: "Black-winged Stilt 3",
    description:
      "Culpa tempora quo eveniet atque a iusto harum. Molestiae autem voluptates quasi quod quae voluptate nam sint. Doloribus non ullam maxime tempora molestiae nostrum.",
  },
].map((c, i) => ({ ...c, projects: projectRefs.slice(i, 4 + i) }));

export function useCollections() {
  return collections;
}

export function useCollection(id: string | null) {
  return collections.find((collection) => collection.id === id);
}
