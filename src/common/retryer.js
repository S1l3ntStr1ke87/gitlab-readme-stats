// @ts-check

import { CustomError } from "./error.js";
import { logger } from "./log.js";

// Script variables.

// Count the number of GitLab API tokens available.
// Supports GITLAB_TOKEN as a single token or PAT_1, PAT_2, ... for rotation.
const PATs = process.env.GITLAB_TOKEN
  ? 1
  : Object.keys(process.env).filter((key) => /PAT_\d*$/.exec(key)).length;
const RETRIES = process.env.NODE_ENV === "test" ? 7 : PATs;

/**
 * @typedef {import("axios").AxiosResponse} AxiosResponse Axios response.
 * @typedef {(variables: any, token: string, retriesForTests?: number) => Promise<AxiosResponse>} FetcherFunction Fetcher function.
 */

/**
 * Try to execute the fetcher function until it succeeds or the max number of retries is reached.
 *
 * @param {FetcherFunction} fetcher The fetcher function.
 * @param {any} variables Object with arguments to pass to the fetcher function.
 * @param {number} retries How many times to retry.
 * @returns {Promise<any>} The response from the fetcher function.
 */
const retryer = async (fetcher, variables, retries = 0) => {
  if (!RETRIES) {
    throw new CustomError("No GitLab API tokens found", CustomError.NO_TOKENS);
  }

  if (retries > RETRIES) {
    throw new CustomError(
      "Downtime due to GitLab API rate limiting",
      CustomError.MAX_RETRY,
    );
  }

  try {
    // Use GITLAB_TOKEN if set, otherwise rotate through PAT_N tokens
    const token =
      process.env.GITLAB_TOKEN || process.env[`PAT_${retries + 1}`];

    let response = await fetcher(
      variables,
      // @ts-ignore
      token,
      // used in tests for faking rate limit
      retries,
    );

    // react on both type and message-based rate-limit signals.
    const errors = response?.data?.errors;
    const errorType = errors?.[0]?.type;
    const errorMsg = errors?.[0]?.message || "";
    const isRateLimited =
      (errors && errorType === "RATE_LIMITED") || /rate limit/i.test(errorMsg);

    // if rate limit is hit increase the RETRIES and recursively call the retryer
    if (isRateLimited) {
      logger.log(`PAT_${retries + 1} Failed`);
      retries++;
      return retryer(fetcher, variables, retries);
    }

    return response;
  } catch (err) {
    /** @type {any} */
    const e = err;

    // network/unexpected error → let caller treat as failure
    if (!e?.response) {
      throw e;
    }

    // prettier-ignore
    const isBadCredential =
      e?.response?.data?.message === "Bad credentials";
    const isAccountSuspended =
      e?.response?.data?.message === "Sorry. Your account was suspended.";

    if (isBadCredential || isAccountSuspended) {
      logger.log(`PAT_${retries + 1} Failed`);
      retries++;
      return retryer(fetcher, variables, retries);
    }

    // HTTP error with a response → return it for caller-side handling
    return e.response;
  }
};

export { retryer, RETRIES };
export default retryer;