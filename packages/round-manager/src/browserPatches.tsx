/* TODO(refactoring): is this still needed? what does this fix? */
import { Buffer } from "buffer";
import process from "process";
window.Buffer = Buffer;
window.process = process;
