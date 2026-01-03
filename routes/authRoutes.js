import express from 'express'
import asyncHandler from 'express-async-handler'
import AuthController from '../controllers/authController.js'
import AuthMiddleware from '../middleware/authMiddleware.js'

const router = express.Router()

router.get(
  '/github/login', 
  AuthMiddleware.checkGitHubConfig, 
  AuthController.login
)

router.get(
  '/github/callback',
  AuthMiddleware.checkGitHubConfig,
  AuthController.callback,
  asyncHandler(AuthController.handleCallback)
)

export default router
