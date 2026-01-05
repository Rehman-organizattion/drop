// ===== Models (tables) =====
import GithubOrganization from '../models/GithubOrganization.js'
import GithubRepo from '../models/GithubRepo.js'
import GithubCommit from '../models/GithubCommit.js'
import GithubPull from '../models/GithubPull.js'
import GithubIssue from '../models/GithubIssue.js'
import GithubChangelog from '../models/GithubChangelog.js'
import GithubUser from '../models/GithubUser.js'

// ===== Response helper =====
import Response from '../helpers/response.js'


// ===== Collection name → Model mapping =====
const models = {
  organizations: GithubOrganization,
  repos: GithubRepo,
  commits: GithubCommit,
  pulls: GithubPull,
  issues: GithubIssue,
  changelogs: GithubChangelog,
  users: GithubUser
}

// ===== Fields jahan search hoga =====
const searchFields = {
  organizations: ['login', 'name'],
  repos: ['name', 'description'],
  commits: ['sha'],
  pulls: ['title'],
  issues: ['title'],
  changelogs: ['event'],
  users: ['login', 'email']
}


export default class DataRouteController {

  // Pagination + sorting
  static buildOptions(query) {
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10

    return {
      page,
      limit,
      skip: (page - 1) * limit,
      sort: { createdAt: -1 } // latest first
    }
  }

  //  Search filter
  static buildSearchFilter(search, fields) {
    if (!search) return {}

    // Search case-insensitive in every field
    return {
      $or: fields.map(field => ({
        [field]: { $regex: search, $options: 'i' }
      }))
    }
  }

  //  Single collection data
  
  static async getCollection(req, res) {
    const name = req.params.collection
    
    const Model = models[name]

    if (!Model) return Response.error(res, 'Collection not found')

    const options = DataRouteController.buildOptions(req.query)
    const fields = searchFields[name] || []
    const searchQuery = DataRouteController.buildSearchFilter(req.query.search, fields)

    // database se data nikalna
    const data = await Model.find(searchQuery)
      .skip(options.skip)
      .limit(options.limit)
      .sort(options.sort)
      .lean()

    const total = await Model.countDocuments(searchQuery)

    return Response.paginated(res, data, {
      page: options.page,
      limit: options.limit,
      total,
      totalPages: Math.ceil(total / options.limit),
      hasNext: options.page * options.limit < total,
      hasPrev: options.page > 1
    })
  }

  // =====================
  // 4️⃣ Global search (sab collections)
  // =====================
  static async search(req, res) {
    const keyword = req.query.q
    if (!keyword) return Response.error(res, 'Search keyword missing')

    const result = {}

    for (const name in models) {
      const Model = models[name]
      const fields = searchFields[name]

      if (!fields) continue

      const query = DataRouteController.buildSearchFilter(keyword, fields)
      const data = await Model.find(query).limit(5).lean()

      if (data.length > 0) result[name] = data
    }

    return Response.success(res, result, 'Search completed')
  }
}
