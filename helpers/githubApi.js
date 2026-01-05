import axios from 'axios'

export default class GitHubAPI {
  constructor(token) {
    this.token = token

    // axios client ready with auth token
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      }
    })
  }

  // =========================
  // 1️⃣ User organizations
  // =========================
  async getOrganizations() {
    const res = await this.client.get('/user/orgs')
    return res.data
  }

  // =========================
  // 2️⃣ Organization details
  // =========================
  async getOrganizationByName(orgName) {
    const res = await this.client.get(`/orgs/${orgName}`)
    return res.data
  }

  // =========================
  // 3️⃣ Organization repos
  // =========================
  async getOrganizationRepos(orgName) {
    const res = await this.client.get(`/orgs/${orgName}/repos`, {
      params: { per_page: 100 }
    })
    return res.data
  }

  // =========================
  // 4️⃣ Repo commits
  // =========================
  async getRepoCommits(owner, repo, page = 1, perPage = 100) {
    const res = await this.client.get(`/repos/${owner}/${repo}/commits`, {
      params: { page, per_page: perPage }
    })
    return res.data
  }

  // =========================
  // 5️⃣ Repo pull requests
  // =========================
  async getRepoPulls(owner, repo, page = 1, perPage = 100) {
    const res = await this.client.get(`/repos/${owner}/${repo}/pulls`, {
      params: { page, per_page: perPage, state: 'all' }
    })
    return res.data
  }

  // =========================
  // 6️⃣ Repo issues
  // =========================
  async getRepoIssues(owner, repo, page = 1, perPage = 100) {
    const res = await this.client.get(
      `/repos/${owner}/${repo}/issues`, 
      {
      params: { 
        page, 
        per_page: perPage, 
        state: 'all' 
      }
    })
    return res.data
  }

  // =========================
  // 7️⃣ Issue events
  // =========================
  async getIssueEvents(owner, repo, issueNumber, page = 1, perPage = 100) {
    const res = await this.client.get(
      `/repos/${owner}/${repo}/issues/${issueNumber}/events`,
      { params: { page, per_page: perPage } }
    )
    return res.data
  }

  // =========================
  // 8️⃣ Organization members
  // =========================
  async getOrganizationMembers(orgName, page = 1, perPage = 100) {
    const res = await this.client.get(`/orgs/${orgName}/members`, {
      params: { page, per_page: perPage }
    })
    return res.data
  }
}
