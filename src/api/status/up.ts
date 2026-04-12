import type { Request, Response } from "express";
import { request } from "../../common/http";
import retryer from "../../common/retryer";
import { logger } from "../../common/log";

export const RATE_LIMIT_SECONDS = 60 * 5; // 1 request per 5 minutes

type UptimeFetcher = (
  variables: Record<string, unknown>,
  token: string | undefined,
) => Promise<import("axios").AxiosResponse>;

const uptimeFetcher: UptimeFetcher = (variables, token) => {
  return request(
    {
      query: `
        query {
          rateLimit {
            remaining
          }
        }
      `,
      variables,
    },
    {
      Authorization: `bearer ${token}`,
    },
  );
};

type ShieldsBadge = {
  schemaVersion: number;
  label: string;
  message: string;
  color: string;
  isError: boolean;
};

const shieldsUptimeBadge = (up: boolean): ShieldsBadge => {
  return {
    schemaVersion: 1,
    label: "Public Instance",
    message: up ? "up" : "down",
    color: up ? "brightgreen" : "red",
    isError: true,
  };
};

export default async (req: Request, res: Response): Promise<void> => {
  let { type } = req.query;
  type = typeof type === "string" ? type.toLowerCase() : "boolean";

  res.setHeader("Content-Type", "application/json");
  try {
    let PATsValid = true;
    try {
      await retryer(uptimeFetcher, {});
    } catch (_err: unknown) {
      PATsValid = false;
    }

    if (PATsValid) {
      res.setHeader(
        "Cache-Control",
        `max-age=0, s-maxage=${RATE_LIMIT_SECONDS}`,
      );
    } else {
      res.setHeader("Cache-Control", "no-store");
    }

    switch (type) {
      case "shields":
        res.send(shieldsUptimeBadge(PATsValid));
        break;
      case "json":
        res.send({ up: PATsValid });
        break;
      default:
        res.send(PATsValid);
        break;
    }
  } catch (err: unknown) {
    logger.error(err);
    res.setHeader("Cache-Control", "no-store");
    res.send("Something went wrong: " + (err as Error).message);
  }
};