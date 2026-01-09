import GithubIntegration from '../models/GithubIntegration.js'
import GitHubController from './githubController.js'
import models from '../config/models.js'
import Response from '../helpers/response.js'

export default class IntegrationController {

  static async getStatus(req, res) {
    const integration = await GithubIntegration.findOne({
      integrationStatus: 'active'
    })

    if (!integration) {
      return Response.error(res, 'GitHub not connected')
    }

    const stats = {}
    stats.organizations = await models.organizations.countDocuments()
    stats.repos = await models.repos.countDocuments()
    stats.commits = await models.commits.countDocuments()
    stats.pulls = await models.pulls.countDocuments()
    stats.issues = await models.issues.countDocuments()
    stats.users = await models.users.countDocuments()

    return Response.success(res, {
      connected: true,
      user: integration.githubUsername,
      lastSync: integration.lastSyncTimestamp,
      stats
    })
  }

  static async remove(req, res) {
    await models.organizations.deleteMany({})
    await models.repos.deleteMany({})
    await models.commits.deleteMany({})
    await models.pulls.deleteMany({})
    await models.issues.deleteMany({})
    await models.users.deleteMany({})

    return Response.success(res, null, 'All data deleted')
  }

  static async resync(req, res) {
    const result = await GitHubController.resyncAllData()
    return Response.success(res, result, 'Data synced again')
  }
}
