const express = require("express");
const bodyParser = require("body-parser");

//const when = require('./f').when
const DiscoveryResult = require('./Types').DiscoveryResult
const DiscoveryFailure = require('./Types').DiscoveryFailure

const ServiceResult = require('./Types').ServiceResult
const ServiceFailure = require('./Types').ServiceFailure

const Result = require('./Types').Result
const Failure = require('./Types').Failure

//const DiscoveryBackend = require('./DiscoveryBackend')

let app = express();
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))


process.stdin.resume();//so the program will not close instantly

class Service {
  constructor({discoveryBackend, record}) {
    //TODO: check record format
    this.discoveryBackend = discoveryBackend
    this.record = record

    // health check
    app.get("/healthcheck", (req, res) => {
      res.send({
        status: this.record.status
      });
    })
    // discovery endpoint
    app.get("/discover", (req, res) => {
      this.discoveryBackend.getAllRegistrations(results => {
        results.when({
          DiscoveryResult: (services) => {
            res.send(services)
          },
          DiscoveryFailure: (err) => {
            res.send(err)
          }
        })
      })

    })    

    function bye(service, cause) {
      service.removeRegistration(res => {
        //console.log(`👋 ${service.record.registration} ${cause}`)
        service.stop(cause)
        process.exit()
      })
    }

    //do something when app is closing
    process.on('exit', bye.bind(null, this, 'exit'));

    //catches ctrl+c event
    process.on('SIGINT', bye.bind(null, this, 'SIGINT'));

    //catches uncaught exceptions
    process.on('uncaughtException', bye.bind(null, this, 'uncaughtException'));

  }

  // promise ?
  createRegistration(callBack) {
    this.discoveryBackend.createRegistration(this.record, registrationResult => {
      registrationResult.when({
        DiscoveryResult: registrationId => {
          callBack(ServiceResult.of({
            message: "😃 registration is ok",
            record: this.record
          }))
        },
        DiscoveryFailure: error => {
          callBack(ServiceFailure.of({
            message: "😡 registration is ko",
            error: error
          }))
        }
      }) // end when
    }) // end create
  } // end register

  updateRegistration(callBack) {
    this.discoveryBackend.updateRegistration(this.record, registrationResult => {
      registrationResult.when({
        DiscoveryResult: registrationId => {
          callBack(ServiceResult.of({
            message: "😃 record is updated",
            record: this.record
          }))
        },
        DiscoveryFailure: error => {
          callBack(ServiceFailure.of({
            message: "😡 update of record is ko",
            error: error
          }))
        }
      }) // end when
    }) // end update
  } // end update

  removeRegistration(callBack) {
    this.discoveryBackend.removeRegistration(this.record, registrationResult => {
      registrationResult.when({
        DiscoveryResult: registrationId => {
          callBack(ServiceResult.of({
            message: "😃 record is deleted",
            record: this.record
          }))
        },
        DiscoveryFailure: error => {
          callBack(ServiceFailure.of({
            message: "😡 delete of record is ko",
            error: error
          }))
        }
      }) // end when
    }) // end update
  }

  get(route, what) {
    app.get(route, what)
  } 

  post(route, what) {
    app.post(route, what)
  } 

  put(route, what) {
    app.put(route, what)
  } 

  delete(route, what) {
    app.delete(route, what)
  } 

  start(port, callBack) {
    app.listen(port)

    this.record.status = "UP"

    this.discoveryBackend.updateRegistration(this.record, registrationResult => {
      registrationResult.when({
        DiscoveryResult: registrationRecord => {
          callBack(ServiceResult.of({
            message: "😃 record status is updated",
            record: this.record
          }))
        },
        DiscoveryFailure: error => {
          callBack(ServiceFailure.of({
            message: "😡 update of record status is ko",
            error: error
          }))
        }
      }) // end when
    }) // end update    
    
  }

}

module.exports = Service


