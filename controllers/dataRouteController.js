import GithubOrganization from '../models/GithubOrganization.js'
import GithubRepo from '../models/GithubRepo.js'
import GithubCommit from '../models/GithubCommit.js'
import GithubPull from '../models/GithubPull.js'
import GithubIssue from '../models/GithubIssue.js'
import GithubChangelog from '../models/GithubChangelog.js'
import GithubUser from '../models/GithubUser.js'
import PaginationService from '../services/paginationService.js'
import Response from '../helpers/response.js'

const models = {
  organizations: GithubOrganization,
  repos: GithubRepo,
  commits: GithubCommit,
  pulls: GithubPull,
  issues: GithubIssue,
  changelogs: GithubChangelog,
  users: GithubUser
}

const searchFields = {
  organizations: ['login', 'name', 'description'],
  repos: ['name', 'full_name', 'description'],
  commits: ['sha'],
  pulls: ['title', 'state'],
  issues: ['title', 'state'],
  changelogs: ['event'],
  users: ['login', 'name', 'email']
}

export default class DataRouteController {
  static async getCollection(req, res) {
    const collection = req.params.collection
    const Model = models[collection]

    if (!Model) {
      throw new Error('Collection not found')
    }

    const options = PaginationService.buildOptions(req.query)
    const filter = PaginationService.buildFilter(req.query)
    const fields = searchFields[collection] || []
    const search = PaginationService.buildSearchFilter(req.query.search, fields)

    const query = { ...filter, ...search }

    const data = await Model.find(query)
      .sort(options.sort)
      .skip(options.skip)
      .limit(options.limit)
      .lean()

    const total = await Model.countDocuments(query)
    const result = PaginationService.formatResponse(data, total, options.page, options.limit)

    return Response.paginated(res, result.data, result.pagination)
  }

  static async search(req, res) {
    const keyword = req.query.q

    if (!keyword) {
      throw new Error('Search query missing')
    }

    const result = {}

    for (const collection in models) {
      const Model = models[collection]
      const fields = searchFields[collection]

      if (!fields) continue

      const searchQuery = PaginationService.buildSearchFilter(keyword, fields)
      const data = await Model.find(searchQuery).limit(10).lean()

      if (data.length) {
        result[collection] = data
      }
    }

    return Response.success(res, result, 'Search done')
  }
}
