const Egg = require('pullet').Egg

class Functor extends Egg {
  map (fn) {
    return new this.constructor(fn(this.value));
  }
}

class Result extends Functor {}
class Failure extends Functor {}

class DiscoveryResult extends Functor {}
class DiscoveryFailure extends Functor {}

class ServiceResult extends Functor {}
class ServiceFailure extends Functor {}

class HttpException extends Functor {}

module.exports = {
  Result: Result,
  Failure: Failure,
  DiscoveryResult: DiscoveryResult,
  DiscoveryFailure: DiscoveryFailure,
  ServiceResult: ServiceResult,
  ServiceFailure: ServiceFailure,
  HttpException: HttpException
}