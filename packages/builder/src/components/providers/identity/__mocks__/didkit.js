/* eslint-disable no-undef */
const keyToDID = jest.fn(() => Promise.resolve("did:key:PUBLIC_KEY"));

// eslint-disable-next-line prettier/prettier
const keyToVerificationMethod = jest.fn(() =>
  Promise.resolve("did:key:PUBLIC_KEY#PUBLIC_KEY")
);

const issueCredential = jest.fn((credential) =>
  Promise.resolve(
    JSON.stringify({
      ...JSON.parse(credential),
      proof: {},
    })
  )
);

const clearDidkitMocks = () => {
  keyToDID.mockClear();
  keyToVerificationMethod.mockClear();
  issueCredential.mockClear();
};

// ---- Generate & Verify methods
module.exports = {
  keyToDID,
  keyToVerificationMethod,
  issueCredential,

  /* Mock helpers */
  clearDidkitMocks,
};
