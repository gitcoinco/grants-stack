# Encrypting PII information

When a round is created, the operators specify a list of additional questions AKA (application schema) which would be asked to a project when they apply to the round.
The schema is stored in IPFS and when a project applies to the round, this schema is used to generate the form which they then fill out which is then stored in IPFS
Some of these questions would contain Personally identifiable information(PII) which would need to encrypted and could be decrypted only

- owners of the project
- round operators

To achieve this, the round-manager relies on [litprotocol](https://litprotocol.com/) to encrypt and decrypt this information
The actual source code on how we encrypt/decrypt the data can be found on lit.ts

Documentation related to supported chains can be found on [lit-docs](https://developer.litprotocol.com/supportedchains/)

**To Encrypt data**

You would use the `encryptString` function.
It would be up to the grant-hub / project manager to specify the conditions on who would be allowed to decrypt the data and this would be done by specifying the `unifiedAccessControlConditions`.

To ensure only the round operators are allowed, `isRoundOperatorAccessControl` would have to be set as the `unifiedAccessControlConditions.

**To Decrypt data**

Assuming the `unifiedAccessControlConditions` was set to `isRoundOperatorAccessControl`, then upon receiving the encrypted content, round-manager would use `decryptString` to decrypt the encrypted data.

Ideally when the project applies to the round, they would be expected to pass:

- `encryptedString`
- `encryptedSymmetricKey`

Here is an example of the entire flow in action.

```javascript
// Init LIT config
const lit = new Lit({
  chainId: 5,
  contract: "0x22c0e3EDc90f6A890A259130B416Cd5F3Ee4Aca0",
});

// Encrypt
lit.encryptString("Hello World").then(async (res) => {
  const encryptedString = res.encryptedString;
  const encryptedSymmetricKey = res.encryptedSymmetricKey;

  // Decrypt
  const decryptedString = await lit.decryptString(
    encryptedString,
    encryptedSymmetricKey
  );

  console.log(decryptedString);
});
```
