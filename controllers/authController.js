import passport from 'passport'
import GitHubController from './githubController.js'

export default class AuthController {
  static login(req, res, next) {
    passport.authenticate('github', {
      scope: ['user:email', 'read:org', 'repo']
    })(req, res, next)
  }

  static callback(req, res, next) {
    passport.authenticate('github', {
      failureRedirect: '/auth/github/login'
    })(req, res, next)
  }

  static async handleCallback(req, res) {
    await GitHubController.resyncAllData()
    res.redirect('/integration/status')
  }
}



