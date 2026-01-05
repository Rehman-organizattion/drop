// ===== GitHub API helper =====
import GitHubAPI from '../helpers/githubApi.js'

// ===== Database models =====
import GithubOrganization from '../models/GithubOrganization.js'
import GithubRepo from '../models/GithubRepo.js'
import GithubCommit from '../models/GithubCommit.js'
import GithubPull from '../models/GithubPull.js'
import GithubIssue from '../models/GithubIssue.js'
import GithubChangelog from '../models/GithubChangelog.js'
import GithubUser from '../models/GithubUser.js'
import GithubIntegration from '../models/GithubIntegration.js'


// GitHub API client (sirf ek baar banega)
let apiClient = null


export default class GitHubController {

  // =============================
  // 1️⃣ GitHub API client lao
  // =============================
  static async getApi() {
    if (apiClient) return apiClient

    const integration = await GithubIntegration.findOne({
      integrationStatus: 'active'
    })

    if (!integration) {
      throw new Error('GitHub integration not active')
    }

    apiClient = new GitHubAPI(integration.oauthToken)
    return apiClient
  }


  // =============================
  // 2️⃣ Pagination handle karo
  // =============================
  static async fetchAll(fetchFn) {
    let page = 1
    const allData = []
    const perPage = 100

    while (true) {
      const data = await fetchFn(page, perPage)
      if (data.length === 0) break

      allData.push(...data)
      if (data.length < perPage) break
      page++
    }

    return allData
  }


  // =============================
  // 3️⃣ Database mein save karo
  // =============================
  static async save(Model, data, uniqueKey) {
    for (const item of data) {
      await Model.updateOne(
        { [uniqueKey]: item[uniqueKey] },
        { $set: { ...item, syncedAt: new Date() } },
        { upsert: true }
      )
    }
  }


  // =============================
  // 4️⃣ Organizations
  // =============================
  static async fetchOrganizations() {
    const api = await this.getApi()
    let orgs = await api.getOrganizations()

    if (orgs.length === 0) {
      try {
        const org = await api.getOrganizationByName('Rehman-organizattion')
        if (org) orgs = [org]
      } catch (error) {
        console.error('Error:', error)
      }
    }

    await this.save(GithubOrganization, orgs, 'id')
    return orgs
  }


  // =============================
  // 5️⃣ Repositories
  // =============================
  static async fetchRepos(orgName) {
    const api = await this.getApi()
    const repos = await api.getOrganizationRepos(orgName)

    await this.save(GithubRepo, repos, 'id')
    return repos
  }


  // =============================
  // 6️⃣ Commits
  // =============================
  static async fetchCommits(owner, repo) {
    const api = await this.getApi()

    const commits = await this.fetchAll(page =>
      api.getRepoCommits(owner, repo, page)
    )

    await this.save(GithubCommit, commits, 'sha')
    return commits
  }


  // =============================
  // 7️⃣ Pull Requests
  // =============================
  static async fetchPulls(owner, repo) {
    const api = await this.getApi()

    const pulls = await this.fetchAll(page =>
      api.getRepoPulls(owner, repo, page)
    )

    await this.save(GithubPull, pulls, 'id')
    return pulls
  }


  // =============================
  // 8️⃣ Issues
  // =============================
  static async fetchIssues(owner, repo) {
    const api = await this.getApi()

    const issues = await this.fetchAll(page =>
      api.getRepoIssues(owner, repo, page)
    )

    await this.save(GithubIssue, issues, 'id')
    return issues
  }


  // =============================
  // 9️⃣ Users
  // =============================
  static async fetchUsers(orgName) {
    const api = await this.getApi()

    const users = await this.fetchAll(page =>
      api.getOrganizationMembers(orgName, page)
    )

    await this.save(GithubUser, users, 'id')
    return users
  }


  // =============================
  // 🔟 Sab kuch ek sath sync karo
  // =============================
  static async resyncAllData() {
    const orgs = await this.fetchOrganizations()

    for (const org of orgs) {
      const repos = await this.fetchRepos(org.login)
      await this.fetchUsers(org.login)

      for (const repo of repos) {
        const [owner, repoName] = repo.full_name.split('/')

        await this.fetchCommits(owner, repoName)
        await this.fetchPulls(owner, repoName)
        await this.fetchIssues(owner, repoName)
      }
    }

    const integration = await GithubIntegration.findOne({ integrationStatus: 'active' })
    if (integration) {
      integration.lastSyncTimestamp = new Date()
      await integration.save()
    }

    return { message: 'GitHub data sync complete' }
  }
}





