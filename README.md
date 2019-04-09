# Scanner

The foundation of this project is based on a trading method invented by the famous day trader known as `Quick Fingers Luke` commonly known as the `QFL Method`. The `Scanner` uses `Elasticsearch` to continually compare the current state of crypto currency `markets` (i.e. parings: `BTC/USD`) against the state of said market for the past 60hrs.

<br/>

The `Scanner` notifies the trader of `markets` that meet the criteria that the trader sets via the `ui` controllers.

## Stack

- React
- Redux
- Node
- Koa
- Passport
- Elasticsearch
- MongoDB

## Deployment

- DigitalOcean.com
- Linux
- Ubuntu 18.04
- Nginx
- PM2

## Installation

Given the complexity of the `Scanners` architecture and deployment requirements a series of `tutorials` are being completed with a `scheduled completion date` of `May 1, 2019`.  Below is the list of `tutorials` and their `completion status`.

<br />


- [ ] Deploy Linux server with Ubuntu 18.04 on DigitalOcean.com: `In Progress: 20% Complete`
- [x] Install Java on Ubuntu 18.04: `In Progress: 90% Complete` - [Link](docs/install-java.md)
- [ ] Install Nginx on Ubuntu 18.04: `Pending`
- [ ] Install PM2 on Ubuntu 18.04: `Pending`
- [ ] Install Node on Ubuntu 18.04: `Pending`
- [ ] Install Elasticsearch on Ubuntu 18.04: `Pending`
