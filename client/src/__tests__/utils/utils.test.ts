import { buildProjectMetadata } from "../../utils/test_utils";
import { metadataToProject } from "../../utils/utils";

describe("metadataToProject", () => {
  it("converts a metadata object to Project", async () => {
    const m = buildProjectMetadata({});
    const p = metadataToProject(m, 123);

    expect(p.lastUpdated).toEqual(123);
    expect(p.createdAt).toEqual(m.createdAt);
    expect(p.id).toEqual(String(m.id));
    expect(p.title).toEqual(m.title);
    expect(p.description).toEqual(m.description);
    expect(p.website).toEqual(m.website);
    expect(p.bannerImg).toEqual(m.bannerImg);
    expect(p.logoImg).toEqual(m.logoImg);

    expect(p.metaPtr).toEqual({
      protocol: String(m.protocol),
      pointer: m.pointer,
    });

    expect(p.userGithub).toEqual(m.userGithub);
    expect(p.projectGithub).toEqual(m.projectGithub);
    expect(p.projectTwitter).toEqual(m.projectTwitter);
    expect(p.credentials).toEqual(m.credentials);
  });
});
