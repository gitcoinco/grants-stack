const ethers = require("ethers");
const Transport = require("@ledgerhq/hw-transport-node-hid").default;
const Eth = require("@ledgerhq/hw-app-eth").default;
const ledgerService = require("@ledgerhq/hw-app-eth/lib/services/ledger").default;

const DefaultPath = "m/44'/60'/0'/0/0";

const sleep = (ms) => {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

class HardwareSigner extends ethers.Signer {
  constructor(provider, type, path) {
    super(provider, type, path);
    this.i = 0;
    if (path == null) { path = DefaultPath; }
    if (type == null) { type = "default"; }

    ethers.utils.defineReadOnly(this, "path", path);
    ethers.utils.defineReadOnly(this, "type", type);
    ethers.utils.defineReadOnly(this, "provider", provider || null);

    this.queue = Promise.resolve();
  }

  async retry(name, callback) {
    // await sleep(1000);
    const p = this.queue.then(async () => {
      return new Promise(async (resolve, reject) => {
        for (let i = 0; i < 50; i++) {
          // console.log(`signer - opening channel ${name}`)
          this.transport = await Transport.create();
          this.eth = new Eth(this.transport);
          try {
            // console.log("signer - trying...", name)
            const result = await callback(this.eth);
            return resolve(result);
          } catch (error) {
            if (error.id !== "TransportLocked") {
              // console.log("signer - error", error)
              return reject(error);
            }
          } finally {
            // console.log(`signer - closing channel ${name}`)
            this.transport.close();
          }
          // console.log("signer - retrying...", name);
          await sleep(100);
        }
      });
    });
    this.queue = p.catch(() => null);
    return p;
  }

  async getAddress() {
    const account = await this.retry(`getAddress ${this.i++}`, () => this.eth.getAddress("m/44'/60'/0'/0/0"));
    return account.address;
  }

  async signTransaction(transaction) {
    const tx = await ethers.utils.resolveProperties(transaction);
    const baseTx = {
      chainId: (tx.chainId || undefined),
      data: (tx.data || undefined),
      gasLimit: (tx.gasLimit || undefined),
      gasPrice: (tx.gasPrice || undefined),
      nonce: (tx.nonce ? ethers.BigNumber.from(tx.nonce).toNumber() : undefined),
      to: (tx.to || undefined),
      value: (tx.value || undefined),
    };

    const unsignedTx = ethers.utils.serializeTransaction(baseTx).substring(2);
    const sig = await this.retry(`signTransaction ${this.i++}`, async () => {
      const resolution = await ledgerService.resolveTransaction(unsignedTx, undefined, {});
      return this.eth.signTransaction("m/44'/60'/0'/0/0", unsignedTx, resolution);
    });

    return ethers.utils.serializeTransaction(baseTx, {
      v: ethers.BigNumber.from("0x" + sig.v).toNumber(),
      r: ("0x" + sig.r),
      s: ("0x" + sig.s),
    });
  }
}

exports.HardwareSigner = HardwareSigner;
