// Checks if tests are being run jest
export const isJestRunning = () => process.env.JEST_WORKER_ID !== undefined;

export default {};
