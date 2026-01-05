import express from 'express'
import asyncHandler from 'express-async-handler'
import DataRouteController from '../controllers/dataRouteController.js'

const router = express.Router()

router.get(
    '/data/:collection', 
    asyncHandler(DataRouteController.getCollection))
    
router.get(
    '/search', 
    asyncHandler(DataRouteController.search)
)

export default router
