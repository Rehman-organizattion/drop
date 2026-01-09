import axios from 'axios'
import config from '../config/app.js'
import GithubIntegration from '../models/GithubIntegration.js'
import GitHubController from './githubController.js'

export default class AuthController {

  // GitHub login redirect
  
  static login(req, res) {
    // GitHub OAuth URL
    const url = `https://github.com/login/oauth/authorize?client_id=${config.github.clientID}&scope=user:email,read:org,repo&redirect_uri=${config.github.callbackURL}`
    res.redirect(url)
  }

 // GitHub OAuth callback
 
 static async callback(req, res) {
    const code = req.query.code

    console.log("code :",code)

    // if no code found
    if (!code) return res.redirect('/auth/github/login')

    try {
      
      // taking github access token
      
      const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
        client_id: config.github.clientID,
        client_secret: config.github.clientSecret,
        code
      }, { headers: { Accept: 'application/json' } })

      const token = tokenRes.data.access_token
      
      if (!token) return res.redirect('/auth/github/login')

      // taking github user info
      
      const userRes = await axios.get('https://api.github.com/user', {
        headers: { Authorization: `token ${token}` }
      })
      const user = userRes.data

      //  save in db
      
      await GithubIntegration.findOneAndUpdate(
        { githubUserId: user.id.toString() },  // same user update
        {
          githubUserId: user.id.toString(),
          githubUsername: user.login,
          githubUserInfo: user,
          oauthToken: token,
          integrationStatus: 'active',
          connectionTimestamp: new Date()
        },
        { upsert: true, new: true } // upsert if record donot available then created and i am available then update that
      )

      // GitHub data again sync
      await GitHubController.resyncAllData()

      // Integration status page redirect
      res.redirect('/integration/status')

    } catch (err) {
      res.redirect('/auth/github/login')
    }
  }
}
