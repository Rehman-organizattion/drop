import mongoose from 'mongoose'

export const connectDB = async () => {
  const mongoURI = process.env.MONGODB_URI
  try {
    const conn = await mongoose.connect(mongoURI)
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`)
    process.exit(1)
  }
}
