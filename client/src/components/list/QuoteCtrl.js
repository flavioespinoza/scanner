import React from 'react'

import { connect } from 'react-redux'

import _ from 'lodash'

import { socket } from '../../redux/modules/socket_actions'

import { _log, log } from '../../util/utils'

import {

	DocumentCard,
	DocumentCardTitle,

} from 'office-ui-fabric-react/lib/DocumentCard'

import { TextField } from 'office-ui-fabric-react/lib/TextField'

import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox'

import { ___filter_by_quote } from '../../index'

const Chance = require('chance')

const chance = new Chance()

const style = {
	wrapper: {
		padding: 4,
		paddingTop: 8,
		margin: '0 auto'
	},
	title: {
		textAlign: 'center'
	},
	slider_wrapper: {},
	sliders: {
		position: 'relative',
		width: 400
	},
	percent_up: {
		position: 'relative',
		width: 320,
		float: 'right'
	},
	percent_down: {
		position: 'relative',
		width: 320,
		float: 'left'
	},
	ul: {
		paddingLeft: 12,
		paddingRight: 12,
		paddingTop: 0,
		paddingBottom: 0,
		margin: 0,
		listStyleType: 'none'
	},
	li: {
		width: '100%',
		height: 40
	},
	div: {
		position: 'relative',
		float: 'left',
		padding: 6
	},
	quote: {
		width: '70%',
		float: 'left'
	},
	no_of_markets: {
		width: '30%',
		float: 'right',
		textAlign: 'right'
	}
}

class QuoteCtrl extends React.Component {
	constructor (props) {
		super(props)

		const quote_state = this.props.quoteState

		const { auth_user } = this.props

		this.state = {
			auth_user: auth_user,
			btc: quote_state.btc,
			usdt: quote_state.usdt,
			eth: quote_state.eth,
			quote_state: quote_state,
		}

	}

	componentWillMount () {

		const quote_state = this.props.quoteState

		const { auth_user } = this.props

		let update = {
			auth_user: auth_user,
			btc: quote_state.btc,
			usdt: quote_state.usdt,
			eth: quote_state.eth,
			quote_state: quote_state,
		}

		this.setState(update)

	}

	componentWillReceiveProps(newProps) {

		const { auth_user } = newProps

		const quote_state = newProps.quoteState

		this.setState({
			quote_state: quote_state,
			btc: quote_state.btc,
			usdt: quote_state.usdt,
			eth: quote_state.eth,
			auth_user: auth_user,
		})

	}

	_onCheckboxChange (obj, e, is_checked) {

		// log.red(obj)
		// log.blue(is_checked)

		const crypto = obj.crypto

		const { quote_state, auth_user } = this.state

		quote_state[crypto] = is_checked

		let data = {
			side: 'quote_state',
			name: 'quote_state',
			prop: '_quote_state',
			auth_user: auth_user,
			quote_state: quote_state,
		}

		socket.emit('filter_by_quote', data)

		this.setState({
			quote_state: quote_state,
			btc: quote_state.btc,
			usdt: quote_state.usdt,
			eth: quote_state.eth,
		})

		___filter_by_quote(quote_state)

	}

	render () {

		const self = this

		const { itemsAll, disable_ctrl} = this.props

		const quote_group = _.groupBy(itemsAll, function (obj) {
			if (obj.quote) {
				return obj.quote
			}
		})

		const map = []

		_.map(quote_group, function (val, key) {
			if (key !== 'undefined') {
				map.push({
					quote: key,
					crypto: _.toLower(key),
					no_of_markets: val.length
				})
			}
		})

		const sorted = _.sortBy(map, function (obj) {
			return obj.quote
		})

		const list = _.map(sorted, function (obj) {

			return (
				<li key={chance.guid()} style={style.li}>
					<span style={style.quote}>
						<Checkbox label={obj.quote}
							// disabled={disable_ctrl}
								  defaultChecked={self.state[obj.crypto]}
								  onChange={(e, is_checked) => {self._onCheckboxChange(obj, e, is_checked)}} />
					</span>
					<span style={style.no_of_markets}>
						<div style={style.no_of_markets} className={'ms-font-m-plus'}>{obj.no_of_markets}</div>
					</span>
				</li>
			)
		})

		return (
			<div style={style.wrapper} className={disable_ctrl ? 'card-fade' : null}>

				<DocumentCard className={'card'}>

					<DocumentCardTitle title={'Markets by Quote Coin'} />

					<ul style={style.ul}>
						{list}
					</ul>

					<div style={{opacity: 0, background: 'red'}}>
						<TextField className={'text-field__hidden'} />
					</div>

				</DocumentCard>

			</div>
		)

	}

}

function mapStateToProps (state) {
	return {
		auth_user: state.allSimpleData.auth_user,
	}
}

export default connect(
	mapStateToProps
)(QuoteCtrl)