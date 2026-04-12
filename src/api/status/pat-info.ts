import { request } from "../../common/http";
import { logger } from "../../common/log";
import { dateDiff } from "../../common/ops";

type PATStatus = "valid" | "expired" | "exhausted" | "suspended" | "error";

type PATDetail =
  | { status: "valid"; remaining: number }
  | { status: "expired" }
  | { status: "exhausted"; remaining: 0; resetIn: string }
  | { status: "suspended" }
  | { status: "error"; error: { type: string; message: string } };

type PATInfo = {
  validPATs: string[];
  expiredPATs: string[];
  exhaustedPATs: string[];
  suspendedPATs: string[];
  errorPATs: string[];
  details: Record<string, PATDetail>;
};

type UptimeFetcher = (
  variables: Record<string, unknown>,
  token: string,
) => Promise<import("axios").AxiosResponse>;

export const RATE_LIMIT_SECONDS = 60 * 5; // 1 request per 5 minutes

const uptimeFetcher: UptimeFetcher = (variables, token) => {
  return request(
    {
      query: `
        query {
          rateLimit {
            remaining
            resetAt
          },
        }`,
      variables,
    },
    {
      Authorization: `bearer ${token}`,
    },
  );
};

const getAllPATs = (): string[] => {
  return Object.keys(process.env).filter((key) => /PAT_\d*$/.exec(key));
};

const getPATInfo = async (
  fetcher: UptimeFetcher,
  variables: Record<string, unknown>,
): Promise<PATInfo> => {
  const details: Record<string, PATDetail> = {};
  const PATs = getAllPATs();

  for (const pat of PATs) {
    try {
      const token = process.env[pat] ?? "";
      const response = await fetcher(variables, token);
      const errors = response.data.errors;
      const hasErrors = Boolean(errors);
      const errorType = errors?.[0]?.type;
      const isRateLimited =
        (hasErrors && errorType === "RATE_LIMITED") ||
        response.data.data?.rateLimit?.remaining === 0;

      if (hasErrors && errorType !== "RATE_LIMITED") {
        details[pat] = {
          status: "error",
          error: {
            type: errors[0].type,
            message: errors[0].message,
          },
        };
        continue;
      } else if (isRateLimited) {
        const date1 = new Date();
        const date2 = new Date(response.data?.data?.rateLimit?.resetAt);
        details[pat] = {
          status: "exhausted",
          remaining: 0,
          resetIn: dateDiff(date2, date1) + " minutes",
        };
      } else {
        details[pat] = {
          status: "valid",
          remaining: response.data.data.rateLimit.remaining,
        };
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      const errorMessage = error.response?.data?.message?.toLowerCase();
      if (errorMessage === "bad credentials") {
        details[pat] = { status: "expired" };
      } else if (errorMessage === "sorry. your account was suspended.") {
        details[pat] = { status: "suspended" };
      } else {
        throw err;
      }
    }
  }

  const filterPATsByStatus = (status: PATStatus): string[] => {
    return Object.keys(details).filter(
      (pat) => details[pat].status === status,
    );
  };

  const sortedDetails = Object.keys(details)
    .sort()
    .reduce<Record<string, PATDetail>>((obj, key) => {
      obj[key] = details[key];
      return obj;
    }, {});

  return {
    validPATs: filterPATsByStatus("valid"),
    expiredPATs: filterPATsByStatus("expired"),
    exhaustedPATs: filterPATsByStatus("exhausted"),
    suspendedPATs: filterPATsByStatus("suspended"),
    errorPATs: filterPATsByStatus("error"),
    details: sortedDetails,
  };
};

export default async (_: unknown, res: {
  setHeader: (key: string, value: string) => void;
  send: (body: unknown) => void;
}): Promise<void> => {
  res.setHeader("Content-Type", "application/json");
  try {
    const PATsInfo = await getPATInfo(uptimeFetcher, {});
    if (PATsInfo) {
      res.setHeader(
        "Cache-Control",
        `max-age=0, s-maxage=${RATE_LIMIT_SECONDS}`,
      );
    }
    res.send(JSON.stringify(PATsInfo, null, 2));
  } catch (err: unknown) {
    logger.error(err);
    res.setHeader("Cache-Control", "no-store");
    res.send("Something went wrong: " + (err as Error).message);
  }
};