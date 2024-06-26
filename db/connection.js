import mongoose from 'mongoose'

export const connectDB = () => {
    try {
        const conn = mongoose.connect(process.env.MONGODB_URI)
        console.log('Mongo connected and running perfectly')
    } catch (error) {
        console.error('Error connecting to MongoDB:', error)
    }
}
