export default class PaginationService {
  static buildOptions(query) {
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const skip = (page - 1) * limit

    const sortField = query.sort_by || 'createdAt'
    const sortOrder = query.sort_order === 'asc' ? 1 : -1

    return {
      page,
      limit,
      skip,
      sort: { [sortField]: sortOrder }
    }
  }

  static buildFilter(query) {
    if (!query.filter) return {}

    try {
      return JSON.parse(query.filter)
    } catch (error) {
      return {}
    }
  }

  static buildSearchFilter(searchTerm, fields) {
    if (!searchTerm || !fields || fields.length === 0) return {}

    return {
      $or: fields.map(field => ({
        [field]: { $regex: searchTerm, $options: 'i' }
      }))
    }
  }

  static formatResponse(data, total, page, limit) {
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  }
}
