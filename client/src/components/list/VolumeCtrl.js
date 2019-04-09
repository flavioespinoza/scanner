import 'rc-slider/assets/index.css'

import React from 'react'

import { connect } from 'react-redux'

import _ from 'lodash'

import * as utils from '../../util/utils'

import { _log, log } from '../../util/utils'

import { socket } from '../../redux/modules/socket_actions'

import {

	DocumentCard,
	DocumentCardTitle

} from 'office-ui-fabric-react/lib/DocumentCard'

import { TextField } from 'office-ui-fabric-react/lib/TextField'

const Chance = require('chance')
const chance = new Chance()

const style = {
	wrapper: {
		padding: 4,
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
	lower_bound: {
		color: 'red',
		textAlign: 'center',
		boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.25)'
	},
	upper_bound: {
		color: 'green',
		textAlign: 'center',
		boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.25)'
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
		height: 56,
		marginTop: 0,
		marginBottom: 12
	},
	percent_wrapper: {
		width: 280,
		position: 'relative',
		float: 'left',
		paddingLeft: 6,
		paddingRight: 6,
		paddingTop: 0,
		paddingBottom: 0,
		margin: 0,
		listStyleType: 'none'
	},
	range_wrapper: {
		width: '100%',
		position: 'relative',
		float: 'left',
		marginTop: 12,
		marginBottom: 12
	},
	percent_rise: {
		width: 125,
		marginTop: 0,
		float: 'left'
	},
	percent_drop: {
		width: 125,
		marginTop: 0,
		marginLeft: 12,
		float: 'left'
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
	},
	min: {
		float: 'left',
		paddingTop: 0,
		paddingLeft: 8
	},
	max: {
		float: 'right',
		textAlign: 'right',
		paddingTop: 0,
		paddingRight: 8
	},
	footer: {
		paddingBottom: 24
	}
}

class VolumeCtrl extends React.Component {

	constructor (props) {
		super(props)

		this._onUpperBoundChange = this._onUpperBoundChange.bind(this)
		this._onLowerBoundChange = this._onLowerBoundChange.bind(this)

		const { auth_user, lower_bound, upper_bound } = this.props

		this.state = {
			auth_user: auth_user,
			lower_bound: lower_bound,
			upper_bound: upper_bound,
			lower_bound_input: lower_bound,
			upper_bound_input: upper_bound
		}
	}

	componentDidMount () {

		const { lower_bound, upper_bound, auth_user } = this.props

		this.setState({
			auth_user: auth_user,
			lower_bound: lower_bound,
			upper_bound: upper_bound,
			lower_bound_input: lower_bound,
			upper_bound_input: upper_bound
		})

	}

	componentWillReceiveProps(newProps) {

		const { auth_user } = newProps

		this.setState({
			auth_user: auth_user,
		})

	}

	_onUpperBoundChange (e, upper_bound) {

		_log.green('onChange')

		_log.info(upper_bound)

		let data = {
			side: 'upper_bound',
			name: 'upper_bound',
			prop: '_upper_bound',
			auth_user: this.state.auth_user,
			value: upper_bound
		}

		socket.emit('upper_bound', data)

		_log.green('onChange')

	}

	_onLowerBoundChange (e, lower_bound) {

		_log.pink('onChange')

		_log.blood(lower_bound)

		let data = {
			side: 'lower_bound',
			name: 'lower_bound',
			prop: '_lower_bound',
			auth_user: this.state.auth_user,
			value: lower_bound
		}

		socket.emit('lower_bound', data)

		_log.pink('onChange')

	}

	render () {

		const { disable_ctrl } = this.props

		const { upper_bound, lower_bound } = this.state

		return (
			<div style={style.wrapper} className={disable_ctrl ? 'card-fade' : null}>

				<DocumentCard className={'card'}>

					<DocumentCardTitle title={'24hr Quote Volume (BTC Value)'}/>

					<div className={'modal-percent-change__wrapper'}>

						<div style={style.percent_wrapper}>

							<div style={style.percent_rise}>
								{lower_bound && upper_bound ?
									<TextField suffix={'Ƀ'}
											   className={'lower-bound'}
											   min={0}
											   onChange={this._onLowerBoundChange}
											   defaultValue={lower_bound}
											   type="number" /> : null}
							</div>

							<div style={style.percent_drop}>
								{lower_bound && upper_bound ?
									<TextField suffix={'Ƀ'}
											   className={'upper-bound'}
											   min={0}
											   onChange={this._onUpperBoundChange}
											   defaultValue={upper_bound}
											   type="number" /> : null}
							</div>

						</div>

					</div>

					<div style={style.footer}>
						<div style={style.min} className={'ms-fontSize-m ms-fontWeight-light'}>{0} (min btc)</div>
						<div style={style.max} className={'ms-fontSize-m ms-fontWeight-light'}>{utils.numFormat(upper_bound)} (max btc)</div>
					</div>

				</DocumentCard>

			</div>
		)
	}

}

function mapStateToProps (state) {
	return {
		auth_user: state.allSimpleData.auth_user
	}
}

export default connect(
	mapStateToProps,
)(VolumeCtrl)