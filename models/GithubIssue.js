import mongoose from 'mongoose'

const githubIssueSchema = new mongoose.Schema({}, { strict: false, timestamps: true })

export default mongoose.model('GithubIssue', githubIssueSchema, 'github_issues')
