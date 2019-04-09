const util = require('util')
const _ = require('lodash')
const log = require('ololog').configure({locate: false})
const _error = function (method, err, socket) {
	log.lightYellow(`${method}__ERROR`, err.message)
	if (socket) {
		socket.emit(`${method}__ERROR`, err.message)
	}
}
const async = require('../../../async')
const jsonexport = require('jsonexport');

const _index = 'hitbtc_5m'
const _type = 'candles'

const elasticsearch = require('elasticsearch')
const es = new elasticsearch.Client({
	hosts: [{
		protocol: 'http',
		host: '178.128.190.197',
		port: 9200,
		country: 'US',
		weight: 10
	}],
	log: 'trace'
})

es.ping({
	// ping usually has a 3000ms timeout
	requestTimeout: 3000
}, async function (error) {
	if (error) {
		console.trace('elasticsearch cluster is down!')
	} else {
		console.log('All is well.')
	}
})

const base_count = async function (from, to, quote) {

	try {

		const query = {
			size: 0,
			query: {
				bool: {
					must: {
						terms: {
							quote: [_.toLower(quote)]
						}
					},
					filter: [{
						range: {
							date: {
								from: `now-${from}m`,
								to: `now-${to}m`
							}
						}
					}]
				}
			},
			aggs: {
				scan_base_currencies: {
					terms: {
						field: 'base.keyword',
						size: 2000,
						show_term_doc_count_error: true
					},
					aggs: {
						scan_volume_from: {
							sum: {
								field: 'volumefrom'
							}
						},
						scan_interval: {
							date_histogram: {
								field: 'date',
								interval: '15m'
								// interval: `${interval}m`
							},
							aggs: {
								scan_interval_volume_from: {
									sum: {
										field: 'volumefrom'
									}
								}
							}
						}
					}
				}
			}
		}

		const es_search = await es.search({
			index: _index,
			type: _type,
			body: query
		})

		return es_search.aggregations.scan_base_currencies.buckets

	} catch (err) {
		_error('base_count', err)
	}
}

const quote_currencies = async function (from, to, exclude) {

	try {
		const query = {
			size: 0,
			query: {
				bool: {
					must_not : {
						terms : { quote : exclude }
					},
					filter: [{
						range: {
							date: {
								from: `now-${from}m`,
								to: `now-${to}m`
							}
						}
					}]
				}
			},
			aggs: {
				scan_quote_currencies: {
					terms: {
						field: 'quote.keyword',
						size: 1000,
						show_term_doc_count_error: true
					}
				}
			}
		}

		const es_search = await es.search({
			index: _index,
			type: _type,
			body: query
		})

		const es_buckets = es_search.aggregations.scan_quote_currencies.buckets

		const quote_list = _.map(es_buckets, function (obj) {
			return obj.key
		})

		const result = []

		await async.each(quote_list, async (quote_currency) => {

			const base_markets = await base_count(from, to, quote_currency)

			result.push({
				quote: quote_currency,
				count: base_markets.length,
				markets: _.map(base_markets, function (obj) {
					return {
						base: obj.key,
						aggs: obj.scan_interval.buckets
						// volume_base: obj.scan_base_volume.value,
						// volume_quote: obj.scan_quote_volume.value,
					}
				})
			})

		})

		return result

	} catch (err) {
	  _error('quote_currencies', err)
	}

}


const pairings = async function (from, to) {

	try {
		const query = {
			size: 1,
			query: {
				bool: {
					filter: [{
						range: {
							date: {
								from: `now-${from}m`,
								to: `now-${to}m`
							}
						}
					}]
				}
			},
			aggs: {
				scan_pairings: {
					terms: {
						field: 'market_name.keyword',
						size: 1000,
						show_term_doc_count_error: true
					},
					aggs: {
						volume: {
							sum: {
								field: 'volume'
							}
						},

						high: {
							max: {
								field: 'high'
							}
						},
						low: {
							max: {
								field: 'low'
							}
						},
						open: {
							top_hits: {
								sort: [{
									date: {
										order: 'asc'
									}
								}],
								_source: {
									includes: ['date', 'timestamp', 'open']
								},
								size: 1
							}
						},
						close: {
							top_hits: {
								sort: [{
									date: {
										order: 'desc'
									}
								}],
								_source: {
									includes: ['date', 'timestamp', 'close']
								},
								size: 1
							}
						}
					}
				}
			}
		}

		const es_search = await es.search({
			index: _index,
			type: _type,
			body: query
		})

		const es_source = es_search.hits.hits[0]._source
		const es_buckets = es_search.aggregations.scan_pairings.buckets

		return _.map(es_buckets, function (obj) {

			let _close = obj.close.hits.hits[0]._source.close
			let _open = obj.open.hits.hits[0]._source.open

			let _percent_change = _.round(_.subtract(_close, _open) / _open, 3)

			let _market_name = obj.key

			let _base = _.toUpper(_market_name.split('_')[0])
			let _quote = _.toUpper(_market_name.split('_')[1])
			let _symbol = `${_base}/${_quote}`

			let candles = {
				from: `now-${from}m`,
				to: `now-${to}m`,
				symbol: _symbol,
				market_name: _market_name,
				base: _base,
				quote: _quote,
				volume: obj.volume.value,
				high: obj.high.value,
				low: obj.low.value,
				close: _close,
				open: _open,
				percent_change_open_to_close: _percent_change
			}

			return candles

		})


	} catch (err) {
		_error('quote_currencies', err)
	}

}


async function _get_markets (from, to, exclude) {
	try {
		// return await quote_currencies(from, to, exclude)
		return await pairings(from, to, exclude)
	} catch (err) {
		_error('_get_markets', err)
	}
}

(async function () {

	let __from = 4000
	let __to = 0

	// console.log(util.inspect(await _get_markets(__from, __to), {showHidden: false, depth: null}))

	let markets = await _get_markets(4000, 0)
	jsonexport(markets, function(err, csv){
		if(err) return console.log(err);
		console.log(csv);
	});

})()


