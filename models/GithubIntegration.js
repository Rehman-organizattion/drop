import mongoose from 'mongoose'

const githubIntegrationSchema = new mongoose.Schema({
  githubUserId: {
    type: String,
    required: true,
    unique: true,
  },
  githubUsername: {
    type: String,
    required: true,
  },
  githubUserInfo: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  oauthToken: {
    type: String,
    required: true,
  },
  integrationStatus: {
    type: String,
    enum: ['active', 'inactive', 'error'],
    default: 'active',
  },
  connectionTimestamp: {
    type: Date,
    default: Date.now,
  },
  lastSyncTimestamp: {
    type: Date,
  },
}, {
  timestamps: true,
})

export default mongoose.model('GithubIntegration', githubIntegrationSchema, 'github_integration')

