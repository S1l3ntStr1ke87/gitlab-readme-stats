const noop = () => {};

const logger =
  process.env.NODE_ENV === "test" ? { log: noop, error: noop } : console;

export { logger };
export default logger;
