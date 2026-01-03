import axios from 'axios'

export default class GitHubAPI {
  constructor(token) {
    this.token = token
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    })
  }

  async getOrganizations() {
    const res = await this.client.get('/user/orgs')
    return res.data
  }

  async getOrganizationRepos(orgName) {
    const res = await this.client.get(`/orgs/${orgName}/repos`, {
      params: { per_page: 100 }
    })
    return res.data
  }

  async getRepoCommits(owner, repo, page = 1, perPage = 100) {
    const res = await this.client.get(`/repos/${owner}/${repo}/commits`, {
      params: { per_page: perPage, page }
    })
    return res.data
  }

  async getRepoPulls(owner, repo, page = 1, perPage = 100) {
    const res = await this.client.get(`/repos/${owner}/${repo}/pulls`, {
      params: { per_page: perPage, page, state: 'all' }
    })
    return res.data
  }

  async getRepoIssues(owner, repo, page = 1, perPage = 100) {
    const res = await this.client.get(`/repos/${owner}/${repo}/issues`, {
      params: { per_page: perPage, page, state: 'all' }
    })
    return res.data
  }

  async getIssueEvents(owner, repo, issueNumber, page = 1, perPage = 100) {
    const res = await this.client.get(`/repos/${owner}/${repo}/issues/${issueNumber}/events`, {
      params: { per_page: perPage, page }
    })
    return res.data
  }

  async getOrganizationMembers(orgName, page = 1, perPage = 100) {
    const res = await this.client.get(`/orgs/${orgName}/members`, {
      params: { per_page: perPage, page }
    })
    return res.data
  }
}
