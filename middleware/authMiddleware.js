import { hasConfig } from '../config/passport.js'

export default class AuthMiddleware {
  static checkGitHubConfig(req, res, next) {
    if (!hasConfig) {
      throw new Error('GitHub OAuth not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables.')
    }
    next()
  }
}



