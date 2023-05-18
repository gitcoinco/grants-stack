/* TODO(refactoring): this is needed for WalletConnect, but we might want to inject this in webpack and not directly here */
import { Buffer } from "buffer";
import process from "process";
window.Buffer = Buffer;
window.process = process;
