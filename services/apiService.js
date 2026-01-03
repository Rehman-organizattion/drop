import GitHubAPI from '../helpers/githubApi.js'
import GithubIntegration from '../models/GithubIntegration.js'

let apiClient = null

export async function getApiClient() {
  if (!apiClient) {
    const integration = await GithubIntegration.findOne({ integrationStatus: 'active' })
    if (!integration) {
      throw new Error('No active GitHub integration found')
    }
    apiClient = new GitHubAPI(integration.oauthToken)
  }
  return apiClient
}

export async function fetchAllPages(fetchFn, perPage = 100) {
  const allItems = []
  let page = 1
  let hasMore = true

  while (hasMore) {
    const items = await fetchFn(page, perPage)
    if (items.length === 0) {
      hasMore = false
    } else {
      allItems.push(...items)
      hasMore = items.length === perPage
      page++
    }
  }

  return allItems
}




