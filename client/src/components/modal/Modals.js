import * as React from 'react'

import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog'

import { List } from '../list/List'

import { Label } from 'office-ui-fabric-react/lib/Label'

import { Link } from 'office-ui-fabric-react/lib/Link'

import { ActionButton, PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button'

import { socket } from '../../redux/modules/socket_actions'

import Modal from 'react-modal'

import _ from 'lodash'

import { _log, log } from '../../util/utils'

const Chance = require('chance')

const chance = new Chance()

Modal.setAppElement('#root')

/**
 * @param {{list_items:array}} list row data
 * */
/**
 * @param {{list_id:string}} list component id
 * */
/**
 * @param {{field_name:string}} unique field name for selection
 * */
function _List (props) {
	return (
		<div className={'twin-list'} style={props.style} >
			<List list_id={props.list_id}
				  field_name={props.field_name}
				  title={props.title}
				  all_markets={props.all_markets}
				  list_items={props.list_items}
				  _listHandler={props._listHandler}
				  _modalHandler={props._modalHandler} />
		</div>
	)
}

let _items = []

let _all_markets = []

/**
 *
 * @param {{container_class:string}} css class to control modal width and height
 * @param {{sub_text:string}} secondary modal message
 *
 * */
class WatchlistModal extends React.Component {

	constructor (props) {
		super(props)

		this._closeModal = this._closeModal.bind(this)

		this._modalHandler = this._modalHandler.bind(this)

		this._modalListHandler = this._modalListHandler.bind(this)

		let browser_height = window.innerHeight

		let header_height = 172

		let list_height = browser_height - header_height

		const { all_markets, watchlist_symbols, list_id } = this.props

		_items = []

		_all_markets = all_markets

		log.red(watchlist_symbols)

		_.each(_all_markets, (obj) => {
			if (watchlist_symbols.includes(obj.symbol)) {
				obj.is_watchlist = true
				_items.push(obj)
			}
		})

		this.state = {
			items: _items,
			watchlist_symbols: watchlist_symbols,
			all_markets: all_markets,
			list_id: list_id,
			hide_dialog: true,
			list_height: list_height

		}

	}

	componentWillReceiveProps(nextProps) {

		const { all_markets, watchlist_symbols } = nextProps

		_items = []
		_all_markets = all_markets

		_.each(_all_markets, (obj) => {
			if (watchlist_symbols.includes(obj.symbol)) {
				obj.is_watchlist = true
				_items.push(obj)
			}
		})

		this.setState({
			all_markets: _all_markets,
			items: _items,
			watchlist_symbols: watchlist_symbols,
		})

	}

	_closeModal (e) {
		return this.props._closeModal(e, 'watchlist_modal')
	}

	_modalHandler (e, data) {
		return this.props._modalHandler(e, data)
	}

	_modalListHandler (e, is_watchlist, symbol) {

		let { all_markets } = this.state

		_all_markets = _all_markets

		for (let i = 0; i < _all_markets.length; i++) {
			if (is_watchlist) {
				if (_all_markets[i].symbol === symbol) {
					_all_markets[i].is_watchlist = false
				}
			} else {
				if (_all_markets[i].symbol === symbol) {
					_all_markets[i].is_watchlist = true
				}
			}

		}

		this.setState({
			all_markets: _all_markets,
		})

		this.props._modalListHandler(e, is_watchlist, symbol)

	}

	render () {

		const { all_markets, items } = this.state

		return (
			<section>

				<Dialog hidden={this.props.hide_dialog}
						onDismiss={this._closeModal}
						dialogContentProps={{
							type: DialogType.normal,
							title: this.props.title,
							subText: this.props.sub_text,
						}}
						modalProps={{
							isBlocking: false,
							containerClassName: this.props.container_class
						}}>

					<section id={'watchlist_modal_twin_lists'} className={'watchlist-modal-lists-wrapper'}>

						<_List list_id={'all_markets_list'}
							   field_name={'is_watchlist'}
							   list_items={all_markets}
							   all_markets={all_markets}
							   title={'All Markets'}
							   style={{height: this.state.list_height}}
							   _listHandler={this._modalListHandler}
							   _modalHandler={this._modalHandler} />

						<_List list_id={'watchlist'}
							   field_name={'is_watchlist'}
							   list_items={items}
							   all_markets={all_markets}
							   title={'Your Watchlist'}
							   style={{height: this.state.list_height, marginLeft: '2%'}}
							   _listHandler={this._modalListHandler}
							   _modalHandler={this._modalHandler} />


					</section>

				</Dialog>

			</section>
		)
	}

}

/**
 * @param {{is_open:boolean}} modal open close state
 * */
class MarketDetailsModal extends React.Component {
	constructor (props) {
		super(props)

		this._onRequestClose = this._onRequestClose.bind(this)

		const browser_height = window.innerHeight

		const header_height = 172

		const list_height = browser_height - header_height

		const { candle_data, market_details } = this.props

		this.state = {
			candle_data: candle_data,
			market_details: market_details,
			hide_dialog: true,
			list_height: list_height
		}

	}

	componentWillReceiveProps (nextProps) {

		const { candle_data, market_details } = nextProps

		this.setState({
			candle_data: candle_data,
			market_details: market_details,
		})

	}

	componentWillUnmount () {

		this.setState({
			candle_data: [],
			market_details: {},
		})

	}

	_onRequestClose (e) {

		return this.props._onRequestClose(e, 'market_details_modal')

	}

	_addToWatchList (e, symbol) {

	}

	render () {

		const { candle_data, market_details } = this.state

		const _market_details = _.map(market_details, (val, prop_name) => {
			return (
				<div key={chance.guid()} className={'market-details__list-item'}>
					<Label>{`${prop_name}: ${val}`}</Label>
				</div>
			)
		})

		let modal_title = `${market_details.symbol}`

		let _base = market_details.base

		let _quote = market_details.quote

		if (_quote === 'USDT') {
			_quote = 'USD'
		}

		return (
			<section id={'compound_list'}>

				<div className={'market-list__wraper'}>

					<Modal className={'Modal'}
						   isOpen={this.props.is_open}
						   onRequestClose={this._onRequestClose}
						   contentLabel="Market Details">

						<div className={'modal-header'}>

							<div className={'ms-font-xl modal__title'}>{modal_title}</div>

							<Link className={'link__coinigy'} href={`https://www.coinigy.com/main/markets/HITB/${_base}/${_quote}`} target={'_blank'}>Go to Coinigy</Link>

							{/*<DefaultButton className={'modal-add-to-watchlist-btn'} onClick={(e) => {this._addToWatchList(e, market_details.symbol)}} text={'ADD TO WATCHLIST'}/>*/}

							<PrimaryButton className={'modal-close-btn'} onClick={this._onRequestClose} text={'CLOSE'}/>

						</div>

						<section>

							<div className={'market_details__chart-wrapper'}>

								{/*<ChartComponent />*/}

							</div>

							<div className={'market-details__list'}>
								{_market_details}
							</div>

						</section>

					</Modal>

				</div>

			</section>
		)
	}

}

export {
	WatchlistModal,
	MarketDetailsModal,
}