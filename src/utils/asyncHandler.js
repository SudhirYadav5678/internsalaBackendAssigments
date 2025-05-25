const asyncHandler = (requestHandler) => {
    return async(req, res, next) => {
        Promise.resolve( await requestHandler(req, res, next)).catch((err) => next(err))
    }
}


export { asyncHandler }