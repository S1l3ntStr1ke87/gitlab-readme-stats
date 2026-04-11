import axios from "axios";

const request = (data: Record<string, unknown>, headers: Record<string, string>) => {
  return axios({
    url: "https://gitlab.com/api/graphql",
    method: "post",
    headers,
    data,
  });
};

export { request };
