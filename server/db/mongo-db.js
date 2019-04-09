const dotenv = require('dotenv')
dotenv.load()

const _ = require('lodash')
const log = require('ololog').configure({locate: false})

const MongoClient = require('mongodb').MongoClient

const user = {
	call_sign: 'stimpy'
}

const exchange_params = {
	name: process.env.CURRENT_EXCHANGE
}

const differentiate = exchange_params.name + '_' + user.call_sign

// Users
const users_cl = 'users_cl'
module.exports.users_cl = users_cl

// User sessions
const sessions_cl = 'sessions_cl_' + differentiate
module.exports.sessions_cl = sessions_cl

// Street Fighter Prefs and Orders
const last_cl = 'last_cl_' + differentiate
const prefs_cl = 'prefs_cl_' + differentiate
const orders_cl = 'orders_cl_' + differentiate


const markets_error_cl = 'markets_error_cl'
const markets_valid_cl = 'markets_valid_cl'
const markets_invalid_cl = 'markets_invalid_cl'

module.exports.last_cl = last_cl
module.exports.prefs_cl = prefs_cl
module.exports.orders_cl = orders_cl

// Markets
module.exports.markets_error_cl = markets_error_cl
module.exports.markets_valid_cl = markets_valid_cl
module.exports.markets_invalid_cl = markets_invalid_cl

// USD Markets
const usd_markets_cl = 'usd_markets_cl'
module.exports.usd_markets_cl = usd_markets_cl

// Fib paradigms
const fibs_cl = 'fibs_cl'
module.exports.fibs_cl = fibs_cl

// Drop down lists
const drop_down_lists_cl = 'drop_down_lists_cl'
module.exports.drop_down_lists_cl = drop_down_lists_cl

// Test Balls
const test_balls_cl = 'test_balls_cl'
module.exports.test_balls_cl = test_balls_cl

// Alerts
const alerts_cl = 'alerts_cl_' + differentiate
module.exports.alerts_cl = alerts_cl

// Black List Auto Trad (to prevent duplicate trades)
const black_list_cl = 'black_list_cl_' + differentiate
module.exports.black_list_cl = black_list_cl

// Symbols and pairings
module.exports.symbols_cl = 'symbols_cl_' + exchange_params.name
module.exports.pairings_cl = 'pairings_cl_' + exchange_params.name

const db_name = 'hitbtc_db'
// const db_url = 'mongodb://access:c68d05f098d7@ds263791.mlab.com:63791/' + db_name
const db_url = process.env.MONGODB_URI

const options = {
	useNewUrlParser: true
}

function store (mongo_db_store) {
	return new mongo_db_store({
		uri: db_url,
		collection: sessions_cl
	})
}
module.exports.store = store

//Update
function update (collection, obj) {
	return new Promise(function (resolve) {
		MongoClient.connect(db_url, options, function (err, db) {
			if (err) throw err
			const dbo = db.db(db_name)
			dbo.collection(collection).updateOne({_id: obj._id}, {$set: obj}, {upsert: true}, function (err, res) {
				if (err) throw err
				log.blue('db.update()')
				get_one(collection, obj).then((user) => {
				  	resolve(user)
				})
				db.close()
			})
		})
	})
}
module.exports.update = update

// Alerts
function update_alerts (collection, obj) {
	return new Promise(function (resolve) {
		MongoClient.connect(db_url, options, function (err, db) {
			if (err) throw err
			const dbo = db.db(db_name)
			dbo.collection(collection).updateOne({_id: obj._id}, {$set: obj}, {upsert: true}, function (err, res) {
				if (err) throw err
				get_one(collection, obj)
					.then(function (response) {
						resolve(response)
						db.close()
					})
			})
		})
	})
}
module.exports.update_alerts = update_alerts

// Collections and Orders
function listCollections () {
	return new Promise(function (resolve) {
		MongoClient.connect(db_url, options, function (err, db) {
			if (err) throw err
			const dbo = db.db(db_name)
			dbo.listCollections().toArray(function (err, res) {
				const names = utils.__map_exclude(res, 'name', 'system.indexes')
				// log.lightMagenta('collection names ', names)
				resolve({
					names,
					list: res
				})
			})
		})
	})
}
module.exports.listCollections = listCollections

function createCollection (collection) {
	return new Promise(function (resolve) {
		MongoClient.connect(db_url, options, function (err, db) {
			if (err) throw err
			const dbo = db.db(db_name)
			dbo.createCollection(collection, function (err, res) {
				if (err) throw err
				resolve('collection created...')
				db.close()
			})
		})
	})
}
module.exports.createCollection = createCollection

function get_all (collection) {
	return new Promise(function (resolve) {
		MongoClient.connect(db_url, options, function (err, db) {
			if (err) throw err
			const dbo = db.db(db_name)
			dbo.collection(collection).find({}).toArray(function (err, res) {
				resolve(res)
				db.close()
			})
		})
	})
}
module.exports.get_all = get_all

function find_by_email (collection, obj) {
	return new Promise(function (resolve) {
		MongoClient.connect(db_url, options, function (err, db) {
			if (err) throw err
			const dbo = db.db(db_name)
			dbo.collection(collection).find({ email: { $eq: obj.email } }).toArray(function (err, res) {
				log.blue(JSON.stringify(res))
				log.red(res.length)
				resolve(res[0])
				db.close()
			})
		})
	})
}
module.exports.find_by_email = find_by_email

function find_one (collection, obj) {
	return new Promise(function (resolve) {
		MongoClient.connect(db_url, options, function (err, db) {
			if (err) throw err
			const dbo = db.db(db_name)
			dbo.collection(collection).find(obj).toArray(function (err, res) {
				log.blue('find_one', JSON.stringify(res))
				log.red(res.length)
				resolve(res[0])
				db.close()
			})
		})
	})
}
module.exports.find_one = find_one

function get_one (collection, obj) {
	return new Promise(function (resolve) {
		MongoClient.connect(db_url, options, function (err, db) {
			if (err) throw err
			const dbo = db.db(db_name)
			dbo.collection(collection).find({_id: obj._id}).toArray(function (err, res) {
				// log.blue(JSON.stringify(res))
				// log.red(res.length)
				resolve(res[0])
				db.close()
			})
		})
	})
}
module.exports.get_one = get_one
module.exports.get_fib = get_one

/** Orders */
function get_order (collection, obj) {
	return new Promise(function (resolve) {
		MongoClient.connect(db_url, options, function (err, db) {
			if (err) throw err
			const dbo = db.db(db_name)
			dbo.collection(collection).find({_id: obj._id}).toArray(function (err, res) {
				// log.blue(JSON.stringify(res))
				// log.red(res.length)
				resolve(res[0])
				db.close()
			})
		})
	})
}
module.exports.get_order = get_order

function get_open_orders (collection) {
	return new Promise(function (resolve) {
		MongoClient.connect(db_url, options, function (err, db) {
			if (err) throw err
			const dbo = db.db(db_name)
			dbo.collection(collection).find({status: 'open'}).toArray(function (err, res) {
				let open_orders = _.filter(res, function (obj) {
					return obj.status === 'open'
				})
				// log.blue(JSON.stringify(open_orders))
				// log.red(open_orders.length)
				resolve(open_orders)
				db.close()
			})
		})
	})
}
module.exports.get_open_orders = get_open_orders

function update_order (collection, obj) {
	return new Promise(function (resolve) {
		MongoClient.connect(db_url, options, function (err, db) {
			if (err) throw err
			const dbo = db.db(db_name)
			dbo.collection(collection).updateOne({_id: obj._id}, {$set: obj}, {upsert: true}, function (err, res) {
				if (err) throw err
				// log.lightYellow('order updated...')
				resolve('order updated...')
				db.close()
			})

		})
	})
}
module.exports.update_order = update_order

function update_open_orders (all_open_orders) {
	get_open_orders(orders_cl)
		.then(function (open_orders) {
			_.each(open_orders, function (obj) {
				db.get_market_prefs(prefs_cl, obj.symbol)
					.then(function (res) {

						let idx = _.findIndex(all_open_orders, function (__obj) {
							return __obj.id === obj._id
						})

						if (idx <= -1) {
							obj = utils.map_order(obj)
						}

						if (obj.side === 'buy' && res.auto_sell_toggle) {
							obj.auto_trade = true
							obj.auto_trade_percentage = res.auto_sell_percentage
						} else if (obj.side === 'buy' && !res.auto_sell_toggle) {
							obj.auto_trade = false
							obj.auto_trade_percentage = res.auto_sell_percentage
						} else if (obj.side === 'sell' && res.auto_buy_toggle) {
							obj.auto_trade = true
							obj.auto_trade_percentage = res.auto_buy_percentage
						} else if (obj.side === 'sell' && !res.auto_buy_toggle) {
							obj.auto_trade = false
							obj.auto_trade_percentage = res.auto_buy_percentage
						}
						update_order(orders_cl, obj)
					})

			})
		})
}
module.exports.update_open_orders = update_open_orders


// Market prefs including Auto Trade settings
function set_new_market_prefs (collection, base, quote) {
	return new Promise(function (resolve) {
		MongoClient.connect(db_url, options, function (err, db) {
			if (err) throw err
			const dbo = db.db(db_name)
			const new_market_prefs = {}
			dbo.collection(collection).updateOne({_id: new_market_prefs._id}, {$set: new_market_prefs}, {upsert: true}, function (err, res) {
				if (err) throw err
				resolve(new_market_prefs)
				db.close()
			})
		})
	})
}

function get_symbol (base, quote) {
	if (base && !quote) {
		return base
	} else if (base && quote) {
		return `${base}/${quote}`
	}
}

function update_market_pref (collection, symbol, obj) {
	return new Promise(function (resolve) {
		MongoClient.connect(db_url, options, function (err, db) {
			if (err) throw err
			const dbo = db.db(db_name)
			dbo.collection(collection).updateOne({
				_id: symbol
			}, {
				$set: obj
			}, {
				upsert: true
			}, function (err, res) {
				if (err) throw err
				dbo.collection(collection).find({
					_id: symbol
				}).toArray(function (err, res) {
					resolve(res[0])
					db.close()
				})
			})
		})
	})
}
module.exports.update_market_pref = update_market_pref

function get_last_market (collection, base, quote) {
	return new Promise(function (resolve) {
		MongoClient.connect(db_url, options, function (err, db) {
			if (err) throw err
			const dbo = db.db(db_name)
			dbo.collection(collection).find({_id: 'last'}).toArray(function (err, res) {
				// log.blue('get_last_market', JSON.stringify(res[0], null, 2))
				if (!res[0]) {
					set_last_market(collection, base, quote)
						.then(function () {
							set_new_market_prefs(prefs_cl, base, quote)
								.then(function (new_market_prefs) {
									resolve(new_market_prefs)
									db.close()
								})
						})
				} else {
					get_market_prefs(collection, base, quote).then(function (res) {
						if (!res) {
							set_new_market_prefs(prefs_cl, base, quote)
								.then(function (new_market_prefs) {
									resolve(new_market_prefs)
									db.close()
								})
						} else {
							resolve(res)
							db.close()
						}
					})
				}
			})
		})
	})
}
module.exports.get_last_market = get_last_market

function set_last_market (collection, base, quote) {
	return new Promise(function (resolve) {
		MongoClient.connect(db_url, options, function (err, db) {
			if (err) throw err
			const dbo = db.db(db_name)
			const symbol = `${base}/${quote}`
			const pairing = `${base}${quote}`
			const obj = {
				_id: 'last',
				base: base,
				quote: quote,
				symbol: symbol,
				pairing: pairing
			}
			dbo.collection(collection).updateOne({
				_id: 'last'
			}, {
				$set: obj
			}, {
				upsert: true
			}, function (err, res) {
				if (err) throw err
				get_market_prefs(collection, base, quote)
					.then(function (prefs) {
						// log.green(prefs)
						resolve(prefs)
						db.close()
					})
			})
		})
	})
}
module.exports.set_last_market = set_last_market

function get_auto_buy_toggle (collection, symbol) {
	log.blue(collection)
	log.lightBlue(symbol)
	return new Promise(function (resolve) {
		MongoClient.connect(db_url, options, function (err, db) {
			if (err) throw err
			const dbo = db.db(db_name)
			dbo.collection(collection).find({symbol: symbol}).toArray(function (err, res) {
				resolve(res[0])
				db.close()
			})
		})
	})
}
module.exports.get_auto_buy_toggle = get_auto_buy_toggle

function get_auto_sell_toggle (collection, symbol) {
	log.red(collection)
	log.lightRed(symbol)
	return new Promise(function (resolve) {
		MongoClient.connect(db_url, options, function (err, db) {
			if (err) throw err
			const dbo = db.db(db_name)
			dbo.collection(collection).find({symbol: symbol}).toArray(function (err, res) {
				resolve(res[0])
				db.close()
			})
		})
	})
}
module.exports.get_auto_sell_toggle = get_auto_sell_toggle

function get_market_prefs (collection, base, quote) {
	return new Promise(function (resolve) {
		MongoClient.connect(db_url, options, function (err, db) {
			if (err) throw err
			const dbo = db.db(db_name)
			let symbol = get_symbol(base, quote)

			dbo.collection(collection).find({symbol: symbol}).toArray(function (err, res) {
				if (res[0] && res[0].url_candles) {
					resolve(res[0])
					db.close()
				} else {
					if (base && quote) {
						set_new_market_prefs(prefs_cl, base, quote)
							.then(function (prefs) {
								// log.lightCyan(prefs)
								resolve(prefs)
								db.close()
							})
					} else {
						throw err
					}

				}

			})
		})
	})
}
module.exports.get_market_prefs = get_market_prefs

function black_list_auto_trade (collection, auto_id) {
	return new Promise(function (resolve) {
		MongoClient.connect(db_url, options, function (err, db) {
			if (err) throw err
			const dbo = db.db(db_name)
			dbo.collection(collection).updateOne({_id: auto_id}, {$set: {_id: auto_id}}, {upsert: true}, function (err, res) {
				get_one(collection, {_id: auto_id})
					.then(function (response) {
						resolve(response)
					})
			})
			db.close()
		})
	})
}
module.exports.black_list_auto_trade = black_list_auto_trade

function check_black_list (collection, auto_id) {
	return new Promise(function (resolve) {
		get_one(collection, {_id: auto_id})
			.then(function (response) {
				resolve(response)
			})
	})
}
module.exports.check_black_list = check_black_list


// Validate markets with proper candle data
function set_error_market (collection, obj) {
	return new Promise(function (resolve) {
		MongoClient.connect(db_url, options, function (err, db) {
			if (err) throw err
			const dbo = db.db(db_name)
			dbo.collection(collection).updateOne({_id: obj.symbol}, {$set: obj}, {upsert: true}, function (err, res) {
				if (err) throw err
				resolve(obj)
				db.close()
			})

		})
	})
}
module.exports.set_error_market = set_error_market
module.exports.get_valid_markets = get_all

function remove_add (remove_cl, add_cl, obj) {
	return new Promise(function (resolve) {
		MongoClient.connect(db_url, function (err, db) {
			if (err) throw err
			const dbo = db.db(db_name)
			dbo.collection(remove_cl).deleteOne({_id: obj.symbol}, function (err, res) {
				if (err) throw err
				resolve(`${obj.symbol} removed from ${remove_cl}`)
				db.close()
			})
			dbo.collection(add_cl).updateOne({_id: obj.symbol}, {$set: obj}, {upsert: true}, function (err, res) {
				if (err) throw err
				resolve(`${obj.symbol} added to ${add_cl}`)
				db.close()
			})

		})
	})
}
module.exports.remove_add = remove_add

function update_usd_last (collection, obj) {
	return new Promise(function (resolve) {
		MongoClient.connect(db_url, options, function (err, db) {
			if (err) throw err
			const dbo = db.db(db_name)
			dbo.collection(collection).updateOne({_id: obj._id}, {$set: obj}, {upsert: true}, function (err, res) {
				if (err) throw err
				resolve({
					success: true,
					symbol: obj._id,
					message: `${obj._id} on ${collection} updated....`,
					market: obj
				})
				db.close()
			})

		})
	})
}
module.exports.update_usd_last = update_usd_last

function update_fibs (collection, obj) {
	return new Promise(function (resolve) {
		MongoClient.connect(db_url, options, function (err, db) {
			if (err) throw err
			const dbo = db.db(db_name)
			dbo.collection(collection).updateOne({_id: obj._id}, {$set: obj}, {upsert: true}, function (err, res) {
				if (err) throw err
				let obj_res = {
					success: true,
					message: `fib updated...`,
					data: obj
				}
				log.lightYellow(obj)
				resolve(obj_res)
				db.close()
			})
		})
	})
}
module.exports.update_fibs = update_fibs