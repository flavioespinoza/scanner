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

/**
 * @param {{_modalHandler:method}} connection method to send actions and data to parent component
 *
 * */
class List extends React.Component {
	constructor (props) {
		super(props)

		this._openModal = this._openModal.bind(this)

		this._closeModal = this._closeModal.bind(this)

		this._onSearch = this._onSearch.bind(this)

		this._modalHandler = this._modalHandler.bind(this)
		
		this._listHandler = this._listHandler.bind(this)

		this._listHandlerIgnore = this._listHandlerIgnore.bind(this)

		const { field_name } = this.props

		_items = this.props.list_items

		_columns = [

			{
				key: 'is_watchlist',
				name: <TooltipHost content={'Watchlist'}><Icon iconName="RedEye" className={'icon-list-header icon-list-header-watchlist'}/></TooltipHost>,
				fieldName: 'is_watchlist',
				minWidth: 32,
				maxWidth: 32,
				isResizable: false,
				isCollapsable: false,
				data: 'string',
				onColumnClick: function () {
					_log.cyan('is_watchlist --> no sort')
				},
				onRender: (item) => {

					let _id = `${item.market_name}__simple_data`

					return (
						<i id={_id}
						   className={item.is_watchlist ? 'ms-Icon ms-Icon--RedEye is-watchlist' : 'ms-Icon ms-Icon--RedEye not-watchlist'}
						   onClick={(e) => this._listHandler(e, item.is_watchlist, item.symbol)}
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
							<Link onClick={(e) => this._openMarketDetailsModal(e, details)}>{details.symbol}</Link>
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
				minWidth: 76,
				maxWidth: 76,
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
				minWidth: 76,
				maxWidth: 76,
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
				minWidth: 76,
				maxWidth: 76,
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
				minWidth: 76,
				maxWidth: 76,
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
			field_name: field_name,
			_items_search: _items,
			sorted_items: _items,
			columns: _columns,
			columns_small: _columns,
			columns_visible: _columns
		}

	}

	componentWillReceiveProps(nextProps) {

		_items = nextProps.list_items

		let update_state = {
			sorted_items: _items,
			_items_search: _items,
		}

		this.setState(update_state)

	}

	_onSearch = (ev, text) => {

		let _text = _.toLower(text)

		let _search = _.filter(this.state._items_search, (obj) => {
			const string = _.toLower(obj.pairing)
			return _text ? string.indexOf(_text) > -1 : this.state._items_search
		})

		this.setState({
			sorted_items: _search
		})

	}

	_onColumnClick = (event, column) => {

		let {columns} = this.state
		let {sorted_items} = this.state

		let isSortedDescending = column.isSortedDescending

		// If we've sorted this column, flip it.
		if (column.isSorted) {
			isSortedDescending = !isSortedDescending
		}

		// Sort the items.
		sorted_items = sorted_items.concat([]).sort((a, b) => {
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
			sorted_items: sorted_items,
			columns: columns.map(col => {
				col.isSorted = col.key === column.key

				if (col.isSorted) {
					col.isSortedDescending = isSortedDescending
				}

				return col
			})
		})

	}

	_closeModal (e, data) {

		data.aaa = '_closeModal'
		this._modalHandler(e, data)

	}

	_openModal (e, data) {

		this._modalHandler(data)

	}

	_modalHandler (e, data) {

		data.list_id = this.props.list_id
		return this.props._modalHandler(e, data)
		
	}

	_listHandler (e, is_watchlist, symbol) {

		this.props._listHandler(e, is_watchlist, symbol)
	}

	_listHandlerIgnore (e, is_ignore_list, symbol) {

		this.props._listHandlerIgnore(e, is_ignore_list, symbol)
	}

	render () {

		const {sorted_items, columns_small} = this.state

		return (
			<section>

				<TextField id={'search_AllMarkets'}
						   label={this.props.title}
						   iconProps={{iconName: 'Search'}}
						   onChange={this._onSearch}/>

				<DetailsList items={sorted_items}
							 setKey="set"
							 columns={columns_small}
							 onRenderItemColumn={this._renderItemColumn}
							 onColumnHeaderClick={this._onColumnClick}
							 selectionMode={SelectionMode.none} />

			</section>
		)
	}

}

export { List }