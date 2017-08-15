const redis = require("redis")
const uuidv1 = require('uuid/v1');

const DiscoveryResult = require('./Types').DiscoveryResult
const DiscoveryFailure = require('./Types').DiscoveryFailure

class DiscoveryBackend {
  constructor({options, keyServices}) {
    // check options or create 

    let redis_options = Object.assign(
      {    
        retry_strategy: function (options) {
          if (options.error && options.error.code === 'ECONNREFUSED') {
              // End reconnecting on a specific error and flush all commands with
              // a individual error
              return new Error('The server refused the connection');
          }
        }
      }, options
    )

    this.client = redis.createClient(redis_options)


    this.keyServices = keyServices
  }

  getAllRegistrations(callback) {

    try {
      this.client.hgetall(this.keyServices, (error, replies) => {
        if(error) {
          callback(new DiscoveryFailure(error))
          return
        }
        let services = []
  
        for(var key in replies) {
          services.push(JSON.parse(replies[key]))
        }
        callback(new DiscoveryResult(services))
      })
    } catch (error) {
      callback(new DiscoveryFailure(error))
    }
  }

  getServices(filter, callback) {
    this.getAllRegistrations((results) => {
      results.when({
        DiscoveryFailure:(err) => {
          callback(new DiscoveryFailure(err))
        },
        DiscoveryResult: (services) => {
          callback(new DiscoveryResult(services.filter(filter)))
        }
      })
    })
  }

  createRegistration(record, callback) {
    record.registration = uuidv1()

    try {
      this.client.hmset(this.keyServices, 
        record.registration, JSON.stringify(record),
        function (error, reply) {
          if(error) {
            record.registration = ""
            callback(new DiscoveryFailure(error))
            return
          }
          callback(new DiscoveryResult(record.registration))
        }
      )
      
    } catch (error) {
      record.registration = ""     
      callback(new DiscoveryFailure(error))
    }

  }

  updateRegistration(record, callback) {
    try {
      this.client.hmset(this.keyServices, 
        record.registration, JSON.stringify(record),
        function (error, reply) {
          if(error) {
            callback(new DiscoveryFailure(error))
            return
          }
          callback(new DiscoveryResult(record.registration))
        }
      )
    } catch (error) {
      callback(new DiscoveryFailure(error))
    }
  }

  removeRegistration(record, callback) {
    try {
      this.client.hdel(this.keyServices, 
        record.registration,
        function (error, reply) {
          if(error) {
            callback(new DiscoveryFailure(error))
            return
          }
          callback(new DiscoveryResult(record.registration))
        }
      )
    } catch (error) {
      callback(new DiscoveryFailure(error))
    }
    
    //this.client.hdel(this.keyServices, record.registration)
    //callback(new DiscoveryResult(record.registration))
  }

}

module.exports = DiscoveryBackend

