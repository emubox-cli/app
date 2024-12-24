import { hostname } from "os";

const ENTRY_PREFIX = hostname().includes("emubox.") ? "" : "distrobox enter emubox -- ";

export default ENTRY_PREFIX;