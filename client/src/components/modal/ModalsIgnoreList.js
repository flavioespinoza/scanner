import * as React from 'react'
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog'
import { _log, log } from '../../util/utils'
import { ListIgnore } from '../list/ListIgnore'
import Modal from 'react-modal'
import _ from 'lodash'

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
function _ListIgnore (props) {

	// console.log(props)

	return (
		<div className={'twin-list'} style={props.style} >
			<ListIgnore list_id={props.list_id}
						field_name={props.field_name}
						title={props.title}
						all_markets={props.all_markets}
						list_items={props.list_items}
						_listHandlerIgnore={props._listHandlerIgnore}
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
class IgnoreListModal extends React.Component {
	constructor (props) {
		super(props)

		this._closeModal = this._closeModal.bind(this)

		this._modalHandler = this._modalHandler.bind(this)

		this._modalListHandlerIgnore = this._modalListHandlerIgnore.bind(this)

		let browser_height = window.innerHeight

		let header_height = 172

		let list_height = browser_height - header_height

		const { all_markets, ignore_list_symbols, list_id } = this.props

		_items = []

		_all_markets = all_markets

		// log.blue(ignore_list_symbols)

		_.each(_all_markets, (obj) => {
			if (ignore_list_symbols.includes(obj.symbol)) {
				obj.is_ignore_list = true
				_items.push(obj)
			}
		})

		// console.log(JSON.stringify(_items))

		this.state = {
			items: _items,
			ignore_list_symbols: ignore_list_symbols,
			all_markets: all_markets,
			list_id: list_id,
			hide_dialog: true,
			list_height: list_height

		}

	}

	componentDidMount() {

		const { all_markets, ignore_list_symbols } = this.state

		_items = []

		_all_markets = all_markets

		_.each(_all_markets, (obj) => {
			if (ignore_list_symbols.includes(obj.symbol)) {
				obj.is_ignore_list = true
				_items.push(obj)
			}
		})

		this.setState({
			all_markets: _all_markets,
			items: _items,
			ignore_list_symbols: ignore_list_symbols,
		})

	}

	componentWillReceiveProps(nextProps) {

		const { all_markets, ignore_list_symbols } = nextProps

		_items = []

		_all_markets = all_markets

		if (!ignore_list_symbols) {
			window.location.reload(true)
		} else {

			_.each(_all_markets, (obj) => {
				if (ignore_list_symbols.includes(obj.symbol)) {
					obj.is_ignore_list = true
					_items.push(obj)
				}
			})

			this.setState({
				all_markets: _all_markets,
				items: _items,
				ignore_list_symbols: ignore_list_symbols,
			})
		}

	}

	_closeModal (e) {
		return this.props._closeModal(e, 'ignore_list_modal')
	}

	_modalHandler (e, data) {
		return this.props._modalHandler(e, data)
	}

	_modalListHandlerIgnore (e, is_ignore_list, symbol) {

		let { all_markets } = this.state

		_all_markets = all_markets

		for (let i = 0; i < _all_markets.length; i++) {
			if (is_ignore_list) {
				if (_all_markets[i].symbol === symbol) {
					_all_markets[i].is_ignore_list = false
				}
			} else {
				if (_all_markets[i].symbol === symbol) {
					_all_markets[i].is_ignore_list = true
				}
			}

		}

		this.setState({
			all_markets: _all_markets,
		})

		this.props._modalListHandlerIgnore(e, is_ignore_list, symbol)

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

					<section id={'ignore_list_modal_twin_lists'} className={'watchlist-modal-lists-wrapper'}>

						<_ListIgnore list_id={'all_markets_list'}
							   		 field_name={'is_ignore_list'}
							   		 list_items={all_markets}
							   		 all_markets={all_markets}
							   		 title={'All Markets'}
							   		 style={{height: this.state.list_height}}
							   		 _listHandlerIgnore={this._modalListHandlerIgnore}
							   		 _modalHandler={this._modalHandler} />

						<_ListIgnore list_id={'ignore_list'}
							   		 field_name={'is_ignore_list'}
							   		 list_items={items}
							   		 all_markets={all_markets}
							   		 title={'Your Ignore List'}
							   		 style={{height: this.state.list_height, marginLeft: '2%'}}
							   		 _listHandlerIgnore={this._modalListHandlerIgnore}
							   		 _modalHandler={this._modalHandler} />

					</section>

				</Dialog>

			</section>
		)
	}
}

export {
	IgnoreListModal,
}