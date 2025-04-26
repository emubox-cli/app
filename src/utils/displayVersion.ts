// @ts-expect-error defined by build tool
const SHA: string = _SHA;
export default SHA.includes("debug") ? SHA : SHA.substring(0, 7);