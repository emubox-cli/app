export { default as init } from "./init";
export { 
    default as install,
    default as i
} from "./install";
export { default as ls } from "./ls";
export { 
    default as remove,
    default as rm 
} from "./remove"; 
export { default as run } from "./run"; 
export { default as uninstall } from "./uninstall"; 
export { default as update } from "./update";
// export { default as "make-shortcuts" } from "./make-shortcuts";
export { default as config } from "./config";
export { 
    version as "-v",
    version as "--version",
    help as "-h",
    help as "--help" 
} from "./flags";

export const SKIP_CONTAINER_CHECK = [
    "init",
    "-v",
    "--version",
    "-h",
    "--help"
];