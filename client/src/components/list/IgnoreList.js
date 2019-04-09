import * as React from 'react'

import _ from 'lodash'
import { _log, log } from '../../util/utils'
import * as utils from '../../util/utils'
import { Chance } from 'chance'

import { Link } from 'office-ui-fabric-react/lib/Link'
import { Image, ImageFit } from 'office-ui-fabric-react/lib/Image'
import { DetailsList, buildColumns, SelectionMode } from 'office-ui-fabric-react/lib/DetailsList'
import { TextField } from 'office-ui-fabric-react/lib/TextField'

import { Icon } from 'office-ui-fabric-react/lib/Icon'
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip'
import { initializeIcons } from '@uifabric/icons'

initializeIcons()

const chance = new Chance()

let _items = []

let _props = []

let _columns = []

class IgnoreList extends React.Component {

	constructor (props) {
		super(props)

		this._openModal = this._openModal.bind(this)
		this._closeModal = this._closeModal.bind(this)
		this._modalHandler = this._modalHandler.bind(this)
		this._setIgnoreList = this._setIgnoreList.bind(this)


		_props = [
			'is_ignore_list',
			'symbol',
			'close',
		]

		const { all_markets, ignore_list_symbols, list_id } = this.props

		_items = []

		_.each(all_markets, (obj) => {
			if (ignore_list_symbols.includes(obj.symbol)) {
				obj.is_ignore_list = true
				_items.push(obj)
			}
		})

		_columns = [

			{
				key: 'is_ignore_list',
				name: <TooltipHost content={'Ignore'}><Icon iconName="Blocked" className={'icon-list-header icon-list-header-ignore-list'}/></TooltipHost>,
				fieldName: 'is_ignore_list',
				minWidth: 18,
				maxWidth: 18,
				isResizable: false,
				isCollapsable: false,
				data: 'string',
				onColumnClick: function () {

				},
				onRender: (item) => {

					let _id = `${item.market_name}__ignore_list_` + this.props.list_id

					return (
						<i id={_id}
						   className={item.is_ignore_list ? 'ms-Icon ms-Icon--Blocked is-ignore-list' : 'ms-Icon ms-Icon--Blocked not-ignore-list'}
						   onClick={(e) => this._setIgnoreList(e, item.is_ignore_list, item.symbol)}
						   aria-hidden="true"></i>
					)

				},
				isPadded: false,
				className: 'nav-cell'

			},

			{
				key: 'symbol',
				name: 'Symbol',
				fieldName: 'symbol',
				minWidth: 56,
				maxWidth: 56,
				isResizable: true,
				isCollapsable: true,
				data: 'string',
				onColumnClick: this._onColumnClick,
				onRender: (details) => {

					return (
						<div className={'link-btn'} >
							<Link onClick={(e) => this._modalHandler(e, details)}>{details.symbol}</Link>
						</div>
					)
				},
				isPadded: false,
				className: 'nav-cell'
			},

			{
				key: 'close',
				name: 'Last',
				fieldName: 'close',
				minWidth: 56,
				maxWidth: 56,
				isResizable: true,
				isCollapsable: true,
				data: 'string',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {
					return <span className={'nav-cell-usd'}>{utils.numFormat(item.close)}</span>
				},
				isPadded: false
			},

			{
				key: 'volume_quote_btc_24h',
				name: '24h Vol BTC',
				fieldName: 'volume_quote_btc_24h',
				minWidth: 56,
				maxWidth: 56,
				isResizable: true,
				isCollapsable: true,
				data: 'string',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {
					return <span className={'nav-cell-usd'}>{utils.numFormat(item.volume_quote_btc_24h)}</span>
				},
				isPadded: false
			},

			{
				key: 'volume_quote_btc_15m',
				name: '15m Vol BTC',
				fieldName: 'volume_quote_btc_15m',
				minWidth: 56,
				maxWidth: 56,
				isResizable: true,
				isCollapsable: true,
				data: 'string',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {
					return <span className={'nav-cell-usd'}>{utils.numFormat(item.volume_quote_btc_15m)}</span>
				},
				isPadded: false
			},

			{
				key: 'volume_quote_btc_5m',
				name: '5m Vol BTC',
				fieldName: 'volume_quote_btc_5m',
				minWidth: 56,
				maxWidth: 56,
				isResizable: true,
				isCollapsable: true,
				data: 'string',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {
					return <span className={'nav-cell-usd'}>{utils.numFormat(item.volume_quote_btc_5m)}</span>
				},
				isPadded: false
			},

		]

		this.state = {
			items: _items,
			ignore_list_symbols: ignore_list_symbols,
			all_markets: all_markets,
			columns: _columns,
			columns_small: _columns,
			columns_visible: _columns
		}

	}

	componentWillReceiveProps(nextProps) {

		const { all_markets, ignore_list_symbols, list_id } = nextProps

		// log.green(nextProps)

		_items = []

		_.each(all_markets, (obj) => {
			if (ignore_list_symbols.includes(obj.symbol)) {
				obj.is_ignore_list = true
				_items.push(obj)
			}
		})

		let update_state = {
			items: _items,
			ignore_list_symbols: ignore_list_symbols,
			all_markets: all_markets,
		}

		this.setState(update_state)

	}

	_onColumnClick = (event, column) => {

		let { columns, items } = this.state

		let isSortedDescending = column.isSortedDescending

		// If we've sorted this column, flip it.
		if (column.isSorted) {
			isSortedDescending = !isSortedDescending
		}

		// Sort the items.
		items = items.concat([]).sort((a, b) => {
			const firstValue = a[column.fieldName || '']
			const secondValue = b[column.fieldName || '']

			if (isSortedDescending) {
				return firstValue > secondValue ? -1 : 1
			} else {
				return firstValue > secondValue ? 1 : -1
			}
		})

		// Reset the items and columns to match the state.
		this.setState({
			items: items,
			columns: columns.map(col => {
				col.isSorted = col.key === column.key

				if (col.isSorted) {
					col.isSortedDescending = isSortedDescending
				}

				return col
			})
		})

	}

	_closeModal (e, item) {

		const _data = {action: 'close_modal_market_details', item: item}
		this.props._modalHandler(_data)

	}

	_openModal (e, item) {

		const _data = {action: 'open_modal_market_details', item: item}
		this.props._modalHandler(_data)

	}

	_setIgnoreList (e, is_ignore_list, symbol) {

		this.props._setIgnoreList(e, is_ignore_list, symbol)

	}

	_onSearch = (ev, text) => {

		// log.yellow(text)

		let _text = _.toLower(text)

		let _search = _.filter(_items, (obj) => {
			const string = _.toLower(obj.pairing)
			return _text ? string.indexOf(_text) > -1 : _items
		})

		this.setState({
			items: _search
		})

	}

	_modalHandler (e, data) {
		return this.props._modalHandler(e, data)
	}

	render () {

		const { items, columns, columns_small } = this.state

		return (
			<section>

				<TextField id={'search_watchlist'}
						   label={this.props.title}
						   iconProps={{iconName: 'Search'}}
						   onChange={this._onSearch}/>

				<DetailsList
					items={items}
					setKey="set"
					columns={columns_small}
					onRenderItemColumn={this._renderItemColumn}
					selectionMode={SelectionMode.none} />

			</section>
		)
	}

}

export { IgnoreList }