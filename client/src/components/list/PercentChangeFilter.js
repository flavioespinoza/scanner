import React from 'react'

import { connect } from 'react-redux'

import _ from 'lodash'

import * as utils from '../../util/utils'

import { _log, log } from '../../util/utils'

import { socket } from '../../redux/modules/socket_actions'

import {

	DocumentCard,
	DocumentCardTitle,

} from 'office-ui-fabric-react/lib/DocumentCard'

import { IconButton } from 'office-ui-fabric-react/lib/Button'

import { TextField } from 'office-ui-fabric-react/lib/TextField'

import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner'

import { initializeIcons } from '@uifabric/icons'

initializeIcons()

const Chance = require('chance')
const chance = new Chance()

const style = {
	wrapper: {
		padding: 0,
		marginBottom: 4,
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
		marginBottom: 12,
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
		marginBottom: 12,
	},
	percent_rise: {
		width: 112,
		marginTop: 0,
		float: 'left'
	},
	percent_drop: {
		width: 112,
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
		paddingLeft: 8,
	},
	max: {
		float: 'right',
		textAlign: 'right',
		paddingTop: 0,
		paddingRight: 8,
	},
	footer: {
		paddingBottom: 24,
	}
}

let _data_obj

let _prop_name

let _title

let _percent_down

let _percent_up

let _percent_props = {

	open_close: {
		prop_name: 'open_close',
		percent_up: 1,
		percent_down: -1,
		show: true
	},
	open_high: {
		prop_name: 'open_high',
		percent_up: 0.001,
		percent_down: -0.001,
		show: false
	},
	open_low: {
		prop_name: 'open_low',
		percent_up: 0.001,
		percent_down: -0.001,
		show: false
	},

	close_open: {
		prop_name: 'close_open',
		percent_up: 0.001,
		percent_down: -0.001,
		show: false
	},
	close_high: {
		prop_name: 'close_high',
		percent_up: 0.001,
		percent_down: -0.001,
		show: false
	},
	close_low: {
		prop_name: 'close_low',
		percent_up: 0.001,
		percent_down: -0.001,
		show: false
	},

	high_open: {
		prop_name: 'high_open',
		percent_up: 0.001,
		percent_down: -0.001,
		show: false
	},
	high_close: {
		prop_name: 'high_close',
		percent_up: 0.001,
		percent_down: -0.001,
		show: false
	},
	high_low: {
		prop_name: 'high_low',
		percent_up: 0.001,
		percent_down: -0.001,
		show: false
	},

	low_open: {
		prop_name: 'low_open',
		percent_up: 0.001,
		percent_down: -0.001,
		show: false
	},
	low_close: {
		prop_name: 'low_close',
		percent_up: 0.001,
		percent_down: -0.001,
		show: false
	},
	low_high: {
		prop_name: 'low_high',
		percent_up: 0.001,
		percent_down: -0.001,
		show: false
	}

}

class PercentChangeFilter extends React.Component {

	constructor(props) {
		super(props)

		this._onUpperBoundChange = this._onUpperBoundChange.bind(this)

		this._onLowerBoundChange = this._onLowerBoundChange.bind(this)

		this._hideFilter = this._hideFilter.bind(this)

		this.state = {
			disable_ctrl: false,
			auth_user: {},
			lower_bound: null,
			upper_bound: null,
			title: null,
			prop_name: null,
			data_obj: null,
		}
	}

	componentDidMount () {

		const dataObj = this.props.dataObj

		const { auth_user } = this.props

		_data_obj = dataObj
		_prop_name = _data_obj.prop_name
		_percent_down = Math.abs(_data_obj.percent_down)
		_percent_up = _data_obj.percent_up

		let _split = _prop_name.split('_')
		_title = `${_.capitalize(_split[0])}_${_.capitalize(_split[1])}`

		this.setState({
			auth_user: auth_user,
			title: _title,
			prop_name: _prop_name,
			percent_down: _percent_down,
			percent_up: _percent_up,
		})

	}

	componentWillReceiveProps(newProps) {

		const { auth_user, disableCtrl } = newProps

		this.setState({
			disable_ctrl: disableCtrl,
			auth_user: auth_user,
		})

	}

	_onUpperBoundChange (e, set_percent_up) {

		_log.green('set_percent_up')

		_log.info(set_percent_up)

		let data = {
			side: 'percent_up',
			name: this.state.prop_name,
			prop: `_${this.state.prop_name}`,
			auth_user: this.state.auth_user,
			value: set_percent_up
		}

		socket.emit('set_percent_up', data)

		_log.green('set_percent_up')

	}

	_onLowerBoundChange (e, set_percent_down) {

		_log.pink('set_percent_down')

		_log.blood(set_percent_down)

		let data = {
			side: 'percent_down',
			name: this.state.prop_name,
			prop: `_${this.state.prop_name}`,
			auth_user: this.state.auth_user,
			value: set_percent_down
		}

		socket.emit('set_percent_down', data)

		_log.pink('set_percent_down')

	}

	_hideFilter (e, val) {

		_log.blood(this.state.prop_name)

		console.log(this.state.prop_name)

		this.props.handler(this.state.prop_name)

		let data = {
			name: this.state.prop_name,
			prop: `_${this.state.prop_name}`,
			auth_user: this.state.auth_user
		}

		socket.emit('hide_percent_props', data)

		_log.blood(this.state.prop_name)

	}

	render() {

		const { disable_ctrl } = this.state

		const spinner = (title) => {
			let label = `${title} Updating....`
			return (
					<Spinner size={SpinnerSize.small} label={label} ariaLive="assertive" labelPosition="left" />
			)
		}

		return (
			<div style={style.wrapper} className={disable_ctrl ? 'card-fade' : null}>

				<DocumentCard className={'card card-percent-change-filter'}>

					<DocumentCardTitle title={disable_ctrl ? spinner(this.state.title) : this.state.title} />

					<div className={'modal-percent-change__wrapper'}>

						<div style={style.percent_wrapper}>

							<div style={style.percent_rise}>

								<TextField suffix={'%'}
										   className={'lower-bound'}
										   min={0}
										   defaultValue={this.state.percent_down}
										   onChange={this._onLowerBoundChange}
										   type="number" />

							</div>

							<div style={style.percent_drop}>

								<TextField suffix={'%'}
										   className={'upper-bound'}
										   min={0}
										   defaultValue={this.state.percent_up}
										   onChange={this._onUpperBoundChange}
										   type="number" />

							</div>

							<IconButton className={'btn-icon-percent-list btn-percent-list__remove'}
										iconProps={{iconName: 'BoxMultiplySolid'}}
										disabled={this.state.disable_ctrl}
										title="BoxMultiplySolid"
										ariaLabel="BoxMultiplySolid"
										onClick={this._hideFilter}/>

						</div>

					</div>

				</DocumentCard>

			</div>
		)
	}

}


function mapStateToProps (state) {
	return {
		auth_user: state.allSimpleData.auth_user,
		percent_props: state.allSimpleData.percent_props,
	}
}

export default connect(
	mapStateToProps
)(PercentChangeFilter)