import * as React from 'react'

import { TextField } from 'office-ui-fabric-react/lib/TextField'

import { DetailsList, DetailsListLayoutMode, Selection, ConstrainMode, DetailsRow } from 'office-ui-fabric-react/lib/DetailsList'

import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip'

import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane'

import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky'

import { SelectionMode } from 'office-ui-fabric-react/lib/utilities/selection/index'

import { Link } from 'office-ui-fabric-react/lib/Link'

import { Icon } from 'office-ui-fabric-react/lib/Icon'

import {

	_time_from_now,
	numFormat

} from '../../util/utils'

import { _log, log } from '../../util/utils'

import _ from 'lodash'

const timeFormat = require('d3-time-format').timeFormat
const format_string = '%b %e,%_I:%M %p'
const formatDate = timeFormat(format_string)

function _WatchlistName (props) {
	return (
		<TooltipHost content={'Watchlist'}>

			<Icon id={props.id}
				  iconName="RedEye"
				  className={'icon-list-header icon-list-header-watchlist'}/>

		</TooltipHost>
	)
}

function _IgnoreListName (props) {
	return (
		<TooltipHost content={'Ignore'}>
			<Icon id={props.id}
				  iconName="Blocked"
				  className={'icon-list-header icon-list-header-ignore-list'}/>
		</TooltipHost>
	)
}

class FixedList extends React.Component {

	constructor (props) {
		super(props)

		this._onSearch = this._onSearch.bind(this)

		this._sortItems = this._sortItems.bind(this)

		this._onColumnClick = this._onColumnClick.bind(this)

		this._buildColsSimple = this._buildColsSimple.bind(this)

		this._buildColsCompound = this._buildColsCompound.bind(this)

		this._scrollablePane = React.createRef()

		let is_2x = this.props.is_2x

		let is_2x_obo = this.props.is_2x_obo

		let items = this.props.items

		let _columns = []

		if (this.props.id === 'simple_list') {
			_columns = this._buildColsSimple()
		}
		else {
			_columns = this._buildColsCompound(is_2x, is_2x_obo)
		}

		let auth_user = this.props.auth_user

		let all_markets = this.props.all_markets

		this._items = items

		this.state = {

			items: items,

			columns: _columns,

			all_markets: all_markets,

			is_2x: is_2x,

			is_2x_obo: is_2x_obo,

			auth_user: auth_user,

			my_interval: null,

		}

	}

	componentWillReceiveProps (newProps) {

		const {

			auth_user,
			items,
			all_markets,
			watchlist_symbols,
			ignore_list_symbols,
			is_2x,
			is_2x_obo

		} = newProps

		let _columns = []

		if (this.props.id === 'simple_list') {
			_columns = this._buildColsSimple()
		}
		else {
			_columns = this._buildColsCompound(is_2x, is_2x_obo)
		}

		this.setState({
			columns: _columns,
			items,
			all_markets,
			watchlist_symbols,
			ignore_list_symbols,
			is_2x,
			is_2x_obo,
			auth_user,
		})

	}

	_onSearch (e, text) {

		let _text = _.toLower(text)

		let _search = _.filter(this._items, (obj) => {
			const string = _.toLower(obj.pairing)
			return _text ? string.indexOf(_text) > -1 : this._items
		})

		this.setState({
			items: _search
		})

	}

	_sortItems = (items, sortBy, descending = false) => {
		if (descending) {
			return items.sort((a, b) => {
				if (a[sortBy] < b[sortBy]) {
					return 1
				}
				if (a[sortBy] > b[sortBy]) {
					return -1
				}
				return 0
			})
		} else {
			return items.sort((a, b) => {
				if (a[sortBy] < b[sortBy]) {
					return -1
				}
				if (a[sortBy] > b[sortBy]) {
					return 1
				}
				return 0
			})
		}
	}

	_onColumnClick = (ev, column) => {

		const {columns, items} = this.state

		let newItems = items.slice()

		const newColumns = columns.slice()

		const currColumn = newColumns.filter((currCol, idx) => {
			return column.key === currCol.key
		})[0]

		newColumns.forEach((newCol) => {
			if (newCol === currColumn) {
				currColumn.isSortedDescending = !currColumn.isSortedDescending
				currColumn.isSorted = true
			} else {
				newCol.isSorted = false
				newCol.isSortedDescending = true
			}
		})

		newItems = this._sortItems(newItems, currColumn.fieldName || '', currColumn.isSortedDescending)

		this.setState({
			columns: newColumns,
			items: newItems
		})
	}

	_buildColsSimple () {

		let _columns_view = {

			id: false,
			market_id: false,
			base: false,
			quote: false,
			quote_raw: false,
			symbol: false,
			pairing: false,
			pairing_raw: false,
			market_name: false,
			date: false,
			date_string: false,
			timestamp: false,
			interval: false,
			open: false,
			close: false,
			close_timestamp: false,
			high: false,
			low: false,
			volume: false,
			volume_quote: false,
			candle_count: false,

			open_close: true,
			open_high: true,
			open_low: true,
			close_open: true,
			close_high: true,
			close_low: true,
			high_open: true,
			high_close: true,
			high_low: true,
			low_open: true,
			low_close: true,
			low_high: true,

			volume_quote_btc_5m: false,
			volume_quote_btc_15m: false,
			volume_quote_btc_24h: false,
			count_pass: false,
			is_watchlist: false,
			is_ignore_list: false

		}

		let _columns = [

			{
				key: 'is_watchlist',
				name: <_WatchlistName id={'col_name_watchlist'} />,
				fieldName: 'is_watchlist',
				minWidth: 40,
				maxWidth: 40,
				isResizable: false,
				isCollapsable: false,
				isSorted: false,
				isSortedDescending: true,
				sortAscendingAriaLabel: 'Sorted A to Z',
				sortDescendingAriaLabel: 'Sorted Z to A',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {

					let _id = `${item.market_name}__simple_list`

					return (
						<Icon id={_id}
							  iconName={'RedEye'}
							  className={item.is_watchlist ? 'is-watchlist' : 'not-watchlist'}
							  onClick={(e) => this.props._setWatchlist(e, item.is_watchlist, item.symbol)} />
					)

				},
				isPadded: false,
				className: 'nav-cell',
				headerClassName: 'fixed-list-header'
			},

			{
				key: 'is_ignore_list',
				name: <_IgnoreListName id={'col_name_ignore_list'} />,
				fieldName: 'is_ignore_list',
				minWidth: 18,
				maxWidth: 18,
				isResizable: false,
				isCollapsable: false,
				onColumnClick: function () {
					_log.green('is_ignore_list --> no sort')
				},
				onRender: (item) => {

					let _id = item.market_name + '__simple_list'

					return (
						<Icon id={_id}
							  iconName={'Blocked'}
							  className={'not-ignore-list'}
							  onClick={(e) => this.props._setIgnoreList(e, item.is_ignore_list, item.symbol)} />
					)

				},
				isPadded: false,
				className: 'nav-cell',
				headerClassName: 'fixed-list-header'
			},

			{
				key: 'symbol',
				name: 'Symbol',
				fieldName: 'symbol',
				minWidth: 56,
				maxWidth: 56,
				isResizable: true,
				isCollapsable: true,
				isSorted: false,
				isSortedDescending: true,
				sortAscendingAriaLabel: 'Sorted A to Z',
				sortDescendingAriaLabel: 'Sorted Z to A',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {

					return (
						<div className={'link-btn'}>
							<Link onClick={(e) => this.props._openMarketDetailsModal(e, item)}>{item.symbol}</Link>
						</div>
					)

				},
				isPadded: false,
				className: 'nav-cell',
				headerClassName: 'fixed-list-header'
			},

			{
				key: 'timestamp',
				name: 'Update',
				fieldName: 'timestamp',
				minWidth: 84,
				maxWidth: 84,
				isRowHeader: false,
				isResizable: true,
				isSorted: true,
				isSortedDescending: true,
				sortAscendingAriaLabel: 'Sorted A to Z',
				sortDescendingAriaLabel: 'Sorted Z to A',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {

					let _timestamp = item.timestamp

					if (item.close_timestamp) {
						_timestamp = item.close_timestamp
					}

					let _last_update = _time_from_now(_timestamp)

					return (<span className={'nav-cell-usd'}>{_last_update}</span>)

				},
				data: 'string',
				isPadded: false,
				className: 'nav-cell',
				headerClassName: 'fixed-list-header'
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
					return <span className={'nav-cell-usd'}>{numFormat(item.volume_quote_btc_24h)}</span>
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
					return <span className={'nav-cell-usd'}>{numFormat(item.volume_quote_btc_15m)}</span>
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
					return <span className={'nav-cell-usd'}>{numFormat(item.volume_quote_btc_5m)}</span>
				},
				isPadded: false
			},

		]

		const _col_scanner_socket = (prop_name) => {

			let width = 66

			if (prop_name === 'timestamp') {
				width = 84
			}

			return {
				key: prop_name,
				name: prop_name,
				fieldName: prop_name,
				minWidth: width,
				maxWidth: width,
				isResizable: true,
				isCollapsable: true,
				onColumnClick: this._onColumnClick,
				onRender: (item) => {

					let val = item[prop_name]

					let display

					if (_.isNaN(val)) {
						display = _.toString(val)
					} else {
						let number = _.round(val, 2)
						display = `${number} %`
					}

					if (prop_name === 'timestamp') {
						display = formatDate(new Date(item.timestamp))
					}

					return (
						<span>{display}</span>
					)

				},
				isPadded: false,
				className: 'percentage'

			}
		}

		_.map(_columns_view, (val, key) => {

			if (val) {
				let _prop_name = _.toString(key)
				_columns.push(_col_scanner_socket(_prop_name))
			}

		})

		return _columns

	}

	_buildColsCompound (_is_x, _is_x_obo) {

		let _columns = [

			{
				key: 'is_watchlist',
				name: <_WatchlistName id={'col_name_watchlist'} />,
				fieldName: 'is_watchlist',
				minWidth: 40,
				maxWidth: 40,
				isResizable: false,
				isCollapsable: false,
				isSorted: false,
				isSortedDescending: true,
				sortAscendingAriaLabel: 'Sorted A to Z',
				sortDescendingAriaLabel: 'Sorted Z to A',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {

					let _id = `${item.market_name}__compound_list`

					return (
						<Icon id={_id}
							  iconName={'RedEye'}
							  className={item.is_watchlist ? 'is-watchlist' : 'not-watchlist'}
							  onClick={(e) => this.props._setWatchlist(e, item.is_watchlist, item.symbol)} />
					)

				},
				isPadded: false,
				className: 'nav-cell',
				headerClassName: 'fixed-list-header'
			},

			{
				key: 'is_ignore_list',
				name: <_IgnoreListName id={'col_name_ignore_list'} />,
				fieldName: 'is_ignore_list',
				minWidth: 18,
				maxWidth: 18,
				isResizable: false,
				isCollapsable: false,
				onColumnClick: function () {
					_log.green('is_ignore_list --> no sort')
				},
				onRender: (item) => {

					let _id = item.market_name + '__compound_list'

					return (
						<Icon id={_id}
							  iconName={'Blocked'}
							  className={'not-ignore-list'}
							  onClick={(e) => this.props._setIgnoreList(e, item.is_ignore_list, item.symbol)} />
					)

				},
				isPadded: false,
				className: 'nav-cell',
				headerClassName: 'fixed-list-header'
			},

			{
				key: 'symbol',
				name: 'Symbol',
				fieldName: 'symbol',
				minWidth: 56,
				maxWidth: 56,
				isResizable: true,
				isCollapsable: true,
				isSorted: false,
				isSortedDescending: true,
				sortAscendingAriaLabel: 'Sorted A to Z',
				sortDescendingAriaLabel: 'Sorted Z to A',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {
					return (
						<div className={'link-btn'}>
							<Link onClick={(e) => this.props._openMarketDetailsModal(e, item)}>{item.symbol}</Link>
						</div>
					)
				},
				isPadded: false,
				className: 'nav-cell',
				headerClassName: 'fixed-list-header'
			},

			{
				key: 'timestamp',
				name: 'Update',
				fieldName: 'timestamp',
				minWidth: 84,
				maxWidth: 84,
				isRowHeader: false,
				isResizable: true,
				isSorted: true,
				isSortedDescending: true,
				sortAscendingAriaLabel: 'Sorted A to Z',
				sortDescendingAriaLabel: 'Sorted Z to A',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {

					let _timestamp = item.timestamp

					if (item.close_timestamp) {
						_timestamp = item.close_timestamp
					}

					let _last_update = _time_from_now(_timestamp)

					return (<span className={'nav-cell-usd'}>{_last_update}</span>)

				},
				data: 'string',
				isPadded: false,
				className: 'nav-cell',
				headerClassName: 'fixed-list-header'
			},

			{
				key: 'vol_quote_avg_1hr',
				name: 'Vol Avg (A)',
				fieldName: 'vol_quote_avg_1hr',
				minWidth: 84,
				maxWidth: 84,
				isRowHeader: false,
				isResizable: true,
				isSorted: false,
				isSortedDescending: true,
				sortAscendingAriaLabel: 'Sorted A to Z',
				sortDescendingAriaLabel: 'Sorted Z to A',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {

					return (<span className={'nav-cell-usd'}>{numFormat(item.vol_quote_avg_1hr)}</span>)

				},
				data: 'string',
				isPadded: false,
				className: 'nav-cell',
				headerClassName: 'vol-quote-header'

			},

			{
				key: 'vol_quote_avg_60hr',
				name: 'Vol Avg (B)',
				fieldName: 'vol_quote_avg_60hr',
				minWidth: 84,
				maxWidth: 84,
				isRowHeader: false,
				isResizable: true,
				isSorted: false,
				isSortedDescending: true,
				sortAscendingAriaLabel: 'Sorted A to Z',
				sortDescendingAriaLabel: 'Sorted Z to A',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {

					return (<span className={'nav-cell-usd'}>{numFormat(item.vol_quote_avg_60hr)}</span>)

				},
				data: 'string',
				isPadded: false,
				className: 'nav-cell',
				headerClassName: 'vol-quote-header',
			},

			{
				key: 'vol_quote_percent_diff',
				name: 'Vol Avg % diff',
				fieldName: 'vol_quote_percent_diff',
				minWidth: 84,
				maxWidth: 84,
				isRowHeader: false,
				isResizable: true,
				isSorted: false,
				isSortedDescending: true,
				sortAscendingAriaLabel: 'Sorted A to Z',
				sortDescendingAriaLabel: 'Sorted Z to A',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {

					let percentage = `${_.round(item.vol_quote_percent_diff, 0)} %`

					return (<span className={'nav-cell-usd'}>{percentage}</span>)

				},
				data: 'string',
				isPadded: false,
				className: 'nav-cell',
				headerClassName: 'vol-quote-header',
			},

			{
				key: `vol_quote_is_${_is_x}x`,
				name: `Vol Avg is ${_is_x}x`,
				fieldName: `vol_quote_is_${_is_x}x`,
				minWidth: 72,
				maxWidth: 72,
				isRowHeader: false,
				isResizable: true,
				isSorted: false,
				isSortedDescending: true,
				sortAscendingAriaLabel: 'Sorted A to Z',
				sortDescendingAriaLabel: 'Sorted Z to A',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {

					if (item[`vol_quote_is_${_is_x}x`]) {
						return (
							<i className={'ms-Icon ms-Icon--SkypeCircleCheck icon-is_2x'} aria-hidden={'true'}></i>
						)
					}
					else {
						return null

					}

				},
				data: 'string',
				isPadded: false,
				className: 'is_2x',
				headerClassName: 'vol-quote-header',
			},

			{
				key: `bids_is_${_is_x_obo}x`,
				name: `OB Bids ${_is_x_obo}x`,
				fieldName: `bids_is_${_is_x_obo}x`,
				minWidth: 84,
				maxWidth: 84,
				isRowHeader: false,
				isResizable: true,
				isSorted: false,
				isSortedDescending: true,
				sortAscendingAriaLabel: 'Sorted A to Z',
				sortDescendingAriaLabel: 'Sorted Z to A',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {

					let prop = `bids_is_${_is_x_obo}x`

					// _log.alert(prop)

					let bids_x = item[prop]

					// console.log({bids_x})

					if (bids_x) {
						return (
							<i className={'ms-Icon ms-Icon--SkypeCircleCheck icon-obo'} aria-hidden={'true'}></i>
						)
					}
					else {
						return null
					}

				},
				data: 'string',
				isPadded: false,
				className: 'is_2x',
				headerClassName: 'obo-header',

			},

			{
				key: `asks_is_${_is_x_obo}x`,
				name: `OB Asks ${_is_x_obo}x`,
				fieldName: `asks_is_${_is_x_obo}x`,
				minWidth: 84,
				maxWidth: 84,
				isRowHeader: false,
				isResizable: true,
				isSorted: false,
				isSortedDescending: true,
				sortAscendingAriaLabel: 'Sorted A to Z',
				sortDescendingAriaLabel: 'Sorted Z to A',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {

					if (item[`asks_is_${_is_x_obo}x`]) {
						return (
							<i className={'ms-Icon ms-Icon--SkypeCircleCheck icon-obo'} aria-hidden={'true'}></i>
						)
					}
					else {
						return null
					}

				},
				data: 'string',
				isPadded: false,
				className: 'is_2x',
				headerClassName: 'obo-header',

			},



			{
				key: 'doc_count',
				name: 'doc_count',
				fieldName: 'doc_count',
				minWidth: 84,
				maxWidth: 84,
				isRowHeader: false,
				isResizable: true,
				isSorted: false,
				isSortedDescending: true,
				sortAscendingAriaLabel: 'Sorted A to Z',
				sortDescendingAriaLabel: 'Sorted Z to A',
				onColumnClick: this._onColumnClick,
				onRender: (item) => {

					return (
						<span>{item.doc_count}</span>
					)

				},
				data: 'string',
				isPadded: false,
				className: 'doc-count',

			},


		]

		return _columns

	}

	render () {

		const { items, columns } = this.state

		const label = () => {

			let text = `${items.length} Markets meet your criteria`

			return (
				<span className={'ms-fontWeight-semibold text-markets-count'}>{text}</span>
			)
		}

		return (
			<section>

				<TextField label={label()}
						   className={'fixed-list-search-box'}
						   placeholder="Filter by symbol"
						   onChange={this._onSearch} />

				<div style={{height: '80vh', position: 'relative'}}>

					<ScrollablePane componentRef={this._scrollablePane} scrollbarVisibility={ScrollbarVisibility.auto}>

						{items.length > 0 ? <DetailsList items={items}
														 columns={columns}
														 setKey="set"
														 layoutMode={DetailsListLayoutMode.fixedColumns}
														 constrainMode={ConstrainMode.unconstrained}
														 onRenderDetailsHeader={onRenderDetailsHeader}
														 selectionMode={SelectionMode.none}
														 selectionPreservedOnEmptyClick={true} /> : null}

					</ScrollablePane>

				</div>

			</section>
		)
	}

}

function onRenderDetailsHeader (props, defaultRender) {
	return (
		<Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true} className={'fixed-sticky-header'} >

			{defaultRender(Object.assign({}, props, {onRenderColumnHeaderTooltip: (tooltipHostProps) => <TooltipHost {...tooltipHostProps}/>}))}

		</Sticky>
	)
}

export default FixedList