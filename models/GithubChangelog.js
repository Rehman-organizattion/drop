import mongoose from 'mongoose'

const githubChangelogSchema = new mongoose.Schema({}, { strict: false, timestamps: true })

export default mongoose.model('GithubChangelog', githubChangelogSchema, 'github_changelogs')
