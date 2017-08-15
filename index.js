const Egg = require('pullet').Egg

const Result = require('./Types').Result
const Failure = require('./Types').Failure
const DiscoveryResult = require('./Types').DiscoveryResult
const DiscoveryFailure = require('./Types').DiscoveryFailure
const HttpException = require('./Types').HttpException

const Service = require('./Service')
const Client =require('./Client')
const DiscoveryBackend = require('./DiscoveryBackend')



module.exports = {
  Result: Result,
  Failure: Failure,
  DiscoveryResult: DiscoveryResult,
  DiscoveryFailure: DiscoveryFailure,
  HttpException: HttpException,
  Service: Service,
  Client: Client,
  DiscoveryBackend: DiscoveryBackend
}