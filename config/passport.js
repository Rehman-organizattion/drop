import passport from 'passport'
import { Strategy as GitHubStrategy } from 'passport-github2'
import GithubIntegration from '../models/GithubIntegration.js'
import config from './app.js'

const hasConfig =
  config.github &&
  config.github.clientID &&
  config.github.clientSecret &&
  config.github.clientID !== 'undefined' &&
  config.github.clientSecret !== 'undefined'

if (hasConfig) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: config.github.clientID,
        clientSecret: config.github.clientSecret,
        callbackURL: config.github.callbackURL
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const data = {
            githubUserId: profile.id.toString(),
            githubUsername: profile.username,
            githubUserInfo: profile._json,
            oauthToken: accessToken,
            integrationStatus: 'active',
            connectionTimestamp: new Date()
          }

          const integration = await GithubIntegration.findOneAndUpdate(
            { githubUserId: data.githubUserId },
            data,
            { upsert: true, new: true }
          )

          done(null, integration)
        } catch (err) {
          done(err)
        }
      }
    )
  )
}

passport.serializeUser((user, done) => {
  done(null, user._id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const integration = await GithubIntegration.findById(id)
    done(null, integration)
  } catch (err) {
    done(err)
  }
})

export { hasConfig }



