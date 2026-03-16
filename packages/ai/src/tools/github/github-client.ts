const GITHUB_API = "https://api.github.com";

function getRepo(): { owner: string; name: string } {
  return {
    owner: process.env.GITHUB_REPO_OWNER ?? "Alt-Pod",
    name: process.env.GITHUB_REPO_NAME ?? "community",
  };
}

function getToken(): string {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN environment variable is required. Generate a fine-grained personal access token at GitHub → Settings → Developer settings → Personal access tokens.");
  }
  return token;
}

function getHeaders(extra?: Record<string, string>): Record<string, string> {
  return {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "community-ai-agent",
    Authorization: `Bearer ${getToken()}`,
    ...extra,
  };
}

export async function githubFetch(
  path: string,
  extraHeaders?: Record<string, string>
): Promise<Response> {
  return fetch(`${GITHUB_API}${path}`, { headers: getHeaders(extraHeaders) });
}

export function repoPath(): string {
  const { owner, name } = getRepo();
  return `/repos/${owner}/${name}`;
}
