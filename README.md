# Scanner

The foundation of this project is based on a trading method invented by the famous day trader known as `Quick Fingers Luke`. This is commonly referred to as the `QFL Method`. 

<br />

The `Scanner` uses `Elasticsearch` to continually compare the current state of crypto currency `markets` (i.e. parings: `BTC/USD`) against the state of said `market` for the past 60hrs.  This allows the trader to focus on only those markets that the `QFL Method` deems worthy of attention.

<br/>

The `Scanner` notifies the trader of `markets` that meet the `QFL Method's` requirements, plus any other criteria that the trader sets via the `ui` controllers.

## Stack

- React
- Redux
- Node
- Koa
- Passport
- Elasticsearch
- MongoDB

## Web Server

- DigitalOcean.com
- Linux
- Ubuntu 18.04
- Java JRE & JDK
- Nginx
- PM2

## Installation and Deployment

Given the complexity of the `Scanners` architecture and deployment requirements a series of `tutorials` are being completed with a `scheduled completion date` of `May 1, 2019`.  Below is the list of `tutorials` and their `completion status`.

<br />


- [ ] Deploy Linux server with Ubuntu 18.04 on DigitalOcean.com: `In Progress: 20% Complete`
- [ ] Install Java JRE & JDK on Ubuntu 18.04: `In Progress: 90% Complete`
- [ ] Install Nginx on Ubuntu 18.04: `Pending`
- [ ] Install PM2 on Ubuntu 18.04: `Pending`
- [ ] Install Node on Ubuntu 18.04: `Pending`
- [ ] Install Elasticsearch on Ubuntu 18.04: `Pending`
