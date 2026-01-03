import mongoose from 'mongoose'

const githubPullSchema = new mongoose.Schema({}, { strict: false, timestamps: true })

export default mongoose.model('GithubPull', githubPullSchema, 'github_pulls')
