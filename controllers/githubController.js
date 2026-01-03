import { getApiClient, fetchAllPages } from '../services/apiService.js'
import DatabaseService from '../services/databaseService.js'
import GithubOrganization from '../models/GithubOrganization.js'
import GithubRepo from '../models/GithubRepo.js'
import GithubCommit from '../models/GithubCommit.js'
import GithubPull from '../models/GithubPull.js'
import GithubIssue from '../models/GithubIssue.js'
import GithubChangelog from '../models/GithubChangelog.js'
import GithubUser from '../models/GithubUser.js'
import GithubIntegration from '../models/GithubIntegration.js'

export default class GitHubController {
  static async fetchOrganizations() {
    const api = await getApiClient()
    const orgs = await api.getOrganizations()
    const documents = orgs.map(org => ({ ...org, syncedAt: new Date() }))
    await DatabaseService.bulkUpsert(GithubOrganization, documents, 'id')
    return documents
  }

  static async fetchRepos(orgName) {
    const api = await getApiClient()
    const repos = await api.getOrganizationRepos(orgName)
    const documents = repos.map(repo => ({ ...repo, syncedAt: new Date() }))
    await DatabaseService.bulkUpsert(GithubRepo, documents, 'id')
    return documents
  }

  static async fetchCommits(owner, repoName) {
    const api = await getApiClient()
    const allCommits = await fetchAllPages((page, perPage) =>
      api.getRepoCommits(owner, repoName, page, perPage)
    )

    const documents = allCommits.map(commit => ({
      ...commit,
      repo: repoName,
      repo_full_name: `${owner}/${repoName}`,
      syncedAt: new Date()
    }))

    await DatabaseService.bulkUpsert(GithubCommit, documents, 'sha')
    return documents
  }

  static async fetchPulls(owner, repoName) {
    const api = await getApiClient()
    const allPulls = await fetchAllPages((page, perPage) =>
      api.getRepoPulls(owner, repoName, page, perPage)
    )

    const documents = allPulls.map(pull => ({
      ...pull,
      repo: repoName,
      repo_full_name: `${owner}/${repoName}`,
      syncedAt: new Date()
    }))

    await DatabaseService.bulkUpsert(GithubPull, documents, 'id')
    return documents
  }

  static async fetchIssues(owner, repoName) {
    const api = await getApiClient()
    const allIssues = await fetchAllPages((page, perPage) =>
      api.getRepoIssues(owner, repoName, page, perPage)
    )

    const documents = allIssues.map(issue => ({
      ...issue,
      repo: repoName,
      repo_full_name: `${owner}/${repoName}`,
      syncedAt: new Date()
    }))

    await DatabaseService.bulkUpsert(GithubIssue, documents, 'id')

    for (const issue of allIssues) {
      if (issue.number) {
        await GitHubController.fetchChangelogs(owner, repoName, issue.number)
      }
    }

    return documents
  }

  static async fetchChangelogs(owner, repoName, issueNumber) {
    const api = await getApiClient()
    const allEvents = await fetchAllPages((page, perPage) =>
      api.getIssueEvents(owner, repoName, issueNumber, page, perPage)
    )

    const documents = allEvents.map(event => ({
      ...event,
      repo: repoName,
      repo_full_name: `${owner}/${repoName}`,
      issue_number: issueNumber,
      syncedAt: new Date()
    }))

    await DatabaseService.bulkUpsert(GithubChangelog, documents, 'id')
    return documents
  }

  static async fetchUsers(orgName) {
    const api = await getApiClient()
    const allMembers = await fetchAllPages((page, perPage) =>
      api.getOrganizationMembers(orgName, page, perPage)
    )

    const documents = allMembers.map(member => ({
      ...member,
      organization: orgName,
      syncedAt: new Date()
    }))

    await DatabaseService.bulkUpsert(GithubUser, documents, 'id')
    return documents
  }

  static async resyncAllData() {
    const results = {
      organizations: 0,
      repos: 0,
      commits: 0,
      pulls: 0,
      issues: 0,
      changelogs: 0,
      users: 0
    }

    const orgs = await GitHubController.fetchOrganizations()
    results.organizations = orgs.length

    for (const org of orgs) {
      const orgName = org.login

      const [repos, users] = await Promise.all([
        GitHubController.fetchRepos(orgName),
        GitHubController.fetchUsers(orgName)
      ])

      results.repos += repos.length
      results.users += users.length

      for (const repo of repos) {
        const [owner, repoName] = repo.full_name.split('/')

        const [commits, pulls, issues] = await Promise.all([
          GitHubController.fetchCommits(owner, repoName),
          GitHubController.fetchPulls(owner, repoName),
          GitHubController.fetchIssues(owner, repoName)
        ])

        results.commits += commits.length
        results.pulls += pulls.length
        results.issues += issues.length
      }
    }

    const integration = await GithubIntegration.findOne({ integrationStatus: 'active' })
    if (integration) {
      integration.lastSyncTimestamp = new Date()
      await integration.save()
    }

    return results
  }
}
