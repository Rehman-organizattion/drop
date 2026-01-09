import mongoose from 'mongoose'

const githubUserSchema = new mongoose.Schema({

}, { 
    strict:false, 
    timestamps: true 
})

export default mongoose.model('GithubUser', githubUserSchema, 'github_users')
