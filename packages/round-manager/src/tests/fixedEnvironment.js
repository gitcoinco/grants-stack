const { TextDecoder, TextEncoder } = require("util");

const { TestEnvironment } = require("jest-environment-jsdom");

export default class CustomJsdomEnvironment extends TestEnvironment {
  async setup() {
    await super.setup();

    if (!this.global.TextDecoder) {
      this.global.TextDecoder = TextDecoder;
    } else {
      throw new Error(`Unnecessary polyfill "TextDecoder"`);
    }

    if (!this.global.TextEncoder) {
      this.global.TextEncoder = TextEncoder;
      this.global.Uint8Array = Uint8Array;
    } else {
      throw new Error(`Unnecessary polyfill "TextEncoder"`);
    }
  }
}
