import axios from "axios";
import { CustomError, MissingParamError } from "../common/error.js";

type WakatimeFetcherInput = {
  username?: string;
  api_domain?: string;
};

const fetchWakatimeStats = async ({ username, api_domain }: WakatimeFetcherInput): Promise<any> => {
  if (!username) {
    throw new MissingParamError(["username"]);
  }

  try {
    const { data } = await axios.get(
      `https://${
        api_domain ? api_domain.replace(/\/$/gi, "") : "wakatime.com"
      }/api/v1/users/${username}/stats?is_including_today=true`,
    );

    return data.data;
  } catch (err: unknown) {
    const e = err as any;
    if (e.response.status < 200 || e.response.status > 299) {
      throw new CustomError(
        `Could not resolve to a User with the login of '${username}'`,
        "WAKATIME_USER_NOT_FOUND",
      );
    }
    throw err;
  }
};

export { fetchWakatimeStats };
export default fetchWakatimeStats;
