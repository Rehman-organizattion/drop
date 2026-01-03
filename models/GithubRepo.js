import mongoose from 'mongoose'

const githubRepoSchema = new mongoose.Schema({}, { strict: false, timestamps: true })

export default mongoose.model('GithubRepo', githubRepoSchema, 'github_repos')
