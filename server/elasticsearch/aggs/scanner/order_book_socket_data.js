const log = require('ololog').configure({locate: false})
const _ = require('lodash')

const order_book_updates = {
	asks: [

		{price: 6447.37, size: 1.00}, // lowest ask

		{price: 6447.56, size: 0.00},
		{price: 6447.95, size: 1.00},
		{price: 6447.98, size: 0.00},
		{price: 6456.78, size: 1.00},
		{price: 6514.45, size: 0.01},
		{price: 6514.45, size: 0.01},
		{price: 6515.25, size: 0.02},
		{price: 6515.25, size: 0.02},
		{price: 6516.05, size: 0.03},
		{price: 6516.05, size: 0.03},
		{price: 6516.85, size: 0.04},
		{price: 6516.85, size: 0.04},
		{price: 6517.66, size: 0.05},
		{price: 6517.66, size: 0.05},
		{price: 6518.46, size: 0.06},
		{price: 6518.46, size: 0.06},
		{price: 6519.26, size: 0.07},
		{price: 6519.26, size: 0.07},
		{price: 6520.06, size: 0.08},
		{price: 6520.06, size: 0.08}
	],

	bids: [

		{price: 6446.55, size: 0.00},
		{price: 6412.11, size: 0.00},
		{price: 6412.10, size: 44.06},
		{price: 6380.17, size: 0.00},
		{price: 6380.16, size: 0.01},
		{price: 6378.60, size: 0.00},
		{price: 6378.59, size: 0.03},
		{price: 6377.03, size: 0.00},
		{price: 6377.02, size: 0.05},
		{price: 6376.24, size: 0.00},
		{price: 6376.23, size: 0.06},
		{price: 6375.46, size: 0.00},
		{price: 6375.45, size: 0.07},
		{price: 6374.67, size: 0.00},
		{price: 6374.66, size: 0.08}
	]
}

const order_book_best = {

	ask: 6447.37, // lowest ask -- changed because it beat the prev lowest ask

	spd: `0.001 %`, // spread %

	bid: 6447.29, // highest bid -- no change because no other bids came in higher

	dif: 0.08, // $ difference

}



const diff = order_book_best.ask - order_book_best.bid
const niff = order_book_best.bid - order_book_best.ask

console.log(`$ ${_.round(diff, 2)}`)

console.log(`${_.round(_.multiply(diff / order_book_best.ask, 100), 3)} %`)
console.log(`${_.round(_.multiply(niff / order_book_best.bid, 100), 3)} %`)
