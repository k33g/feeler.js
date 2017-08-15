
const Result = require('./Types').Result
const Failure = require('./Types').Failure
const HttpException = require('./Types').HttpException

const fetch = require('node-fetch');

/*

let record = {
  name: process.env.SERVICE_NAME || haikunator.haikunate(),
  domain: `http://localhost:${externalPort}`,
  root:"/api",
  methods: [{name: "hi", type: "GET", path: "/hi"},{name: "hello", type: "GET", path: "/hello"}],
  metadata: {
    kind: "http"
  } 
}
*/

class Client {
  constructor({service}, ...features) {
    this.service = service
    this.baseUri = service.domain+service.root;
    this.headers = {
      "Content-Type": "application/json"
    };

    return Object.assign(this, ...features);
  }

  healthCheck() {
    return fetch(this.service.domain + "/healthcheck", {
      method: "GET",
      headers: this.headers,
    })
    .then(response => {
      if (response.ok) {
        return response.json()
      } else {
        throw new HttpException({
          message: `HttpException[${methodType}]`,
          status:response.status,
          statusText:response.statusText,
          url: response.url
        });
      }
    })
    .then(jsonData => {
      return jsonData;
    })    
  }

  callMethod({name, data=null}) {
    let method = this.service.methods.find(method => method.name == name)

    return fetch(this.baseUri + method.path, {
      method: method.type,
      headers: this.headers,
      body: data!==null ? JSON.stringify(data) : null
    })
    .then(response => {
      if (response.ok) {
        return response.json()
      } else {
        throw new HttpException({
          message: `HttpException[${methodType}]`,
          status:response.status,
          statusText:response.statusText,
          url: response.url
        });
      }
    })
    .then(jsonData => {
      return jsonData;
    })
    //.catch(err => err)
  }

}

module.exports = Client
