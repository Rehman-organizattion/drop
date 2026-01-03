import Response from '../helpers/response.js'

export default class ErrorHandler {
  static handleError(err, req, res, next) {
    console.error('Error:', err)

    if (err.name === 'ValidationError') {
      return Response.error(res, `Validation Error: ${err.message}`, 400)
    }

    if (err.code === 11000) {
      return Response.error(res, 'Duplicate Entry: This record already exists', 400)
    }

    if (err.name === 'CastError') {
      return Response.error(res, 'Invalid ID: The provided ID is invalid', 400)
    }

    if (err.status) {
      return Response.error(res, err.message || 'An error occurred', err.status)
    }

    return Response.error(res, err.message || 'Internal server error', 500)
  }

  static handleNotFound(req, res) {
    return Response.error(res, `Route ${req.method} ${req.originalUrl} not found`, 404)
  }
}




