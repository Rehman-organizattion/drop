import mongoose from 'mongoose'

const githubCommitSchema = new mongoose.Schema({}, { strict: false, timestamps: true })

export default mongoose.model('GithubCommit', githubCommitSchema, 'github_commits')
