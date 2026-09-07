export const DEPLOYR_API =
  process.env.NEXT_PUBLIC_DEPLOYR_API_BASE_URL ??
  "https://deployr-api-production.up.railway.app";

export const LINKS = {
  docs:
    process.env.NEXT_PUBLIC_DEPLOYR_DOCS_URL ??
    "https://deployr.gitbook.io/deployr",
  api: DEPLOYR_API,
  tokensFeed: `${DEPLOYR_API}/v1/tokens`,
};
