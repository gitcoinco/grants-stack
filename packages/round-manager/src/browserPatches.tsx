/* Needed for WalletConnect to work */
import { Buffer } from "buffer";
import process from "process";
window.Buffer = Buffer;
window.process = process;
