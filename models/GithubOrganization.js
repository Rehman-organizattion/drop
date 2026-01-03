import mongoose from 'mongoose'

const githubOrganizationSchema = new mongoose.Schema({}, { strict: false, timestamps: true })

export default mongoose.model('GithubOrganization', githubOrganizationSchema, 'github_organizations')
