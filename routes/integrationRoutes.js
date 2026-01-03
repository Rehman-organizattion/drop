import express from 'express'
import asyncHandler from 'express-async-handler'
import IntegrationController from '../controllers/integrationController.js'

const router = express.Router()

router.get(
    '/status', 
    asyncHandler(IntegrationController.getStatus)
)

router.post(
    '/remove',
    asyncHandler(IntegrationController.remove)
)

router.post(
    '/resync', 
    asyncHandler(IntegrationController.resync)
)

export default router

