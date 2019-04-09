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