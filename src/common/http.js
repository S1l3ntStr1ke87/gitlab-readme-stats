// @ts-check

import axios from "axios";

/**
 * Send GraphQL request to GitHub API.
 *
 * @param {import('axios').AxiosRequestConfig['data']} data Request data.
 * @param {import('axios').AxiosRequestConfig['headers']} headers Request headers.
 * @returns {Promise<any>} Request response.
 */
const request = (data, headers) => {
  return axios({
    url: "https://gitlab.com/api/graphql",
    method: "post",
    headers,
    data,
  });
};

export { request };
