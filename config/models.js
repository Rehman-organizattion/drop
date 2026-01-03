import GithubIntegration from '../models/GithubIntegration.js'
import GithubOrganization from '../models/GithubOrganization.js'
import GithubRepo from '../models/GithubRepo.js'
import GithubCommit from '../models/GithubCommit.js'
import GithubPull from '../models/GithubPull.js'
import GithubIssue from '../models/GithubIssue.js'
import GithubChangelog from '../models/GithubChangelog.js'
import GithubUser from '../models/GithubUser.js'

export default {
  integration: GithubIntegration,
  organizations: GithubOrganization,
  repos: GithubRepo,
  commits: GithubCommit,
  pulls: GithubPull,
  issues: GithubIssue,
  changelogs: GithubChangelog,
  users: GithubUser,
}






