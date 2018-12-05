const logger = (request, response, next) => {
    if (process.env.NODE_ENV === 'test') {
        return next()
    }

    console.log('Method: ', request.method)
    console.log('Path: ', request.path)
    console.log('Body: ', request.body)
    console.log('------')
    next()
}

const error = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

const tokenExtractor = (request, response) => {
    /*const getTokenFrom = (request) => {
             */
    const authorization = request.get('authorization')
    /*
    console.log('authorization ', authorization)
     */
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        request.token = authorization
        /*Jos käytit samaa ratkaisua, refaktoroi
         tokenin erottaminen middlewareksi, joka
         ottaa tokenin Authorization-headerista
         ja sijoittaa sen request-olion kenttään token. */

        /* request.body. */
        return authorization.substring(7)
    }
    return null
}


module.exports = {
    logger,
    error,
    tokenExtractor
}