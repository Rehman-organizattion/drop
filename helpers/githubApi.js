import axios from 'axios'

export default class GitHubAPI {
  constructor(token) {
    this.token = token
    this.client = axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
      }
    })
  }

  async getOrganizations() {
    const res = await this.client.get('/user/orgs')
    return res.data
  }

  async getOrganizationByName(orgName) {
    const res = await this.client.get(`/orgs/${orgName}`)
    return res.data
  }

  async getOrganizationRepos(orgName) {
    const res = await this.client.get(`/orgs/${orgName}/repos`, {
      params: { 
        per_page: 100 
      }
    })
    return res.data
  }

  async getRepoCommits(owner, repo, page = 1, perPage = 100) {
    const res = await this.client.get(`/repos/${owner}/${repo}/commits`, {
      params: { 
        page, 
        per_page: perPage 
      }
    })
    return res.data
  }

  async getRepoPulls(owner, repo, page = 1, perPage = 100) {
    const res = await this.client.get(`/repos/${owner}/${repo}/pulls`, {
      params: { 
        page, 
        per_page: perPage, 
        state: 'all' // fetch both open and close
      }
    })
    return res.data
  }

  async getRepoIssues(owner, repo, page = 1, perPage = 100) {
    const res = await this.client.get(`/repos/${owner}/${repo}/issues`, {
      params: { 
        page, 
        per_page: perPage, 
        state: 'all' 
      }
    })
    return res.data
  }

  async getIssueEvents(owner, repo, issueNumber, page = 1, perPage = 100) {
    const res = await this.client.get(
      `/repos/${owner}/${repo}/issues/${issueNumber}/events`,
      { 
        params: { 
          page, 
          per_page: perPage 
        } 
      }
    )
    return res.data
  }

  async getOrganizationMembers(orgName, page = 1, perPage = 100) {
    try {
      const res = await this.client.get(`/orgs/${orgName}/members`, {
        params: { 
          page, 
          per_page: perPage 
        }
      })
      return res.data
    } catch (error) {
      return []
    }
  }

  async getOrganizationPublicMembers(orgName, page = 1, perPage = 100) {
    try {
      const res = await this.client.get(`/orgs/${orgName}/public_members`, {
        params: { 
          page, 
          per_page: perPage 
        }
      })
      return res.data
    } catch (error) {
      return []
    }
  }
}
