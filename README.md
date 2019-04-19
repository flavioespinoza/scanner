# Scanner

The foundation of this project is based on a trading method invented by the famous day trader known as `Quick Fingers Luke`. This is commonly referred to as the `QFL Method`. 

<br />

The `Scanner` uses `Elasticsearch` to continually compare the current state of crypto currency `markets` (i.e. parings: `BTC/USD`) against the state of said `market` for the past 60hrs.  This allows the trader to focus on only those markets that the `QFL Method` deems worthy of attention.

---

## Overview

List of tools, libraries and frameworks that are key components of the project's architecture.

### Client

> Written in [ES6 Javascript](https://www.w3schools.com/js/js_es6.asp), and setup with [Create React App](https://facebook.github.io/create-react-app/).

- [React](https://reactjs.org/)
- [Office UI Fabric React](https://developer.microsoft.com/en-us/fabric#/get-started#react)
- [Redux](https://redux.js.org/)
- [Socket.io-client](https://socket.io/docs/internals/#socket-io-client)

### Server
> Written in [ES6 Javascript](https://www.w3schools.com/js/js_es6.asp).
- [Node](https://nodejs.org/dist/latest-v11.x/docs/api/)
- [Koa](https://github.com/koajs/koa)
- [Passport](https://github.com/rkusa/koa-passport)
- [Socket.io](https://socket.io/)
- [Elasticsearch](https://www.elastic.co/guide/en/elasticsearch/client/javascript-api/current/introduction.html)
- [MongoDB](https://www.mongodb.com/)

### Deployment 
> Secure HTTPS reverse proxy deployed on [DigitalOcean](https://digitalocean.com)
- Ubuntu 18.04 / Linux
- [Nginx](https://www.nginx.com/)
- [PM2](https://pm2.io/doc/en/runtime/overview/?utm_source=pm2&utm_medium=website&utm_campaign=rebranding)

---

## Getting Started

> This project requies the  a development server to run `Elasticsearch`.  

> I'm writting a series of `tutorials` with a `schedueled completion date` of `May 1, 2019`. 


#### List of tutorials

- [ ] <a href='flavioespinoza.github.io/scanner/docs/deploy-ubuntu-digitalocean'>Deploy an Ubuntu 18.04 Linux Distribution on Digital Ocean</a> `90% Complete`
- [ ] <a href='flavioespinoza.github.io/scanner/docs/install-java'>Install Java, the JRE & the JDK on an Ubuntu 18.04 Linux Distribution</a> `In Progress: 90% Complete`
- [ ] Setup a Secure HTTPS/SSL Reverse Proxy with Nginx: `Pending`
- [ ] Install PM2 on Ubuntu 18.04: `Pending`
- [ ] Install Node on Ubuntu 18.04: `Pending`
- [ ] Install Elasticsearch on Ubuntu 18.04: `Pending`

