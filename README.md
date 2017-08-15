# feeler.js

MicroServices framework

## Sample


```javascript
const Haikunator = require('haikunator')
const Feeler = require('../index')
const Service = Feeler.Service
const Client = Feeler.Client
const DiscoveryBackend = Feeler.DiscoveryBackend

let port = process.env.PORT || 9090;
let externalPort = process.env.EXTERNAL_PORT || port;

let haikunator = new Haikunator()

let discoveryBackend = new DiscoveryBackend({
  redisOptions: {
    port: 6379,
    host: '127.0.0.1'
  },
  keyServices: "my-micro-services"
}) 

let record = {
  name: process.env.SERVICE_NAME || haikunator.haikunate(),
  domain: `http://localhost:${externalPort}`,
  root:"/api",
  methods: [{name: "hi", type: "GET", path: "/hi"},{name: "hello", type: "GET", path: "/hello"}],
  metadata: {
    kind: "http"
  } 
}

// discover existing services
discoveryBackend.getServices(service => service.metadata.kind == "http", results => {
  results.when({
    DiscoveryResult: services => {
      // calling each method of each service
      services.forEach(service => {
        let client = new Client({service: service})

        client.healthCheck().then(res => {
          console.log("🌍 service informations:", service)
          console.log("calling methods...")
          client.callMethod({name:"hi"}).then(res => console.log(res))
          client.callMethod({name:"hello"}).then(res => console.log(res))
        })
      })
    },
    DiscoveryFailure: failure => {
      console.log("😡 failure when disocvering other services")
      console.log(failure.message, failure.error.message)      
      process.exit()
    },
    _: () => console.log("🤔")

  })
})

let service = new Service({
  discoveryBackend: discoveryBackend, record: record
})

// stop and exit
service.stop = (cause) => {
  console.log(`👋 ${service.record.registration} ${cause}`)
}

service.get("/api/hi", (req, res) => {
  res.send({message: "hi 🌍"});
})

service.get("/api/hello", (req, res) => {
  res.send({message: "hello 🌍"});
})

// publish the service, then start the service
service.createRegistration(resultOfRegistration => {
  resultOfRegistration.when({
    // the service is registered
    ServiceResult: registrationResult => {
      console.log(registrationResult.record.registration, registrationResult.message)
      
      service.start(port, startResult => {
        startResult.when({
          // the service is up, then we start the service
          ServiceResult: updateResult => {
            console.log(updateResult.record.registration, updateResult.message)
            console.log(`🌍 Service ${updateResult.record.name} is ${updateResult.record.status} - listening on ${port}`)
          },
          ServiceFailure: failure => {
            console.log(`😡 Houston? we have a problem!`)
            process.exit()
          }
        })
      })
    },
    ServiceFailure: failure => { 
      console.log(failure.message, failure.error.message)
      process.exit()
    }
  })
})
```

## Remarks

- each service has a `/discover` route to fetch all services connected to the same discovery backend
- each service has a `/healthcheck` route to check if the service is up

## TODO

- documentation
- circuitbreaker
