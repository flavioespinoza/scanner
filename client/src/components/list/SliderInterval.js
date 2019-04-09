import 'rc-slider/assets/index.css'

import React from 'react'

import { connect } from 'react-redux'

import { socket } from '../../redux/modules/socket_actions'

import {
	DocumentCard,
	DocumentCardTitle,
} from 'office-ui-fabric-react/lib/DocumentCard'

import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner'

import Slider from 'rc-slider'

import { ___new_interval } from '../../index'

import { _log, log } from '../../util/utils'

const style = {
	wrapper: {
		paddintTop: 0,
		paddingLeft: 4,
		paddingRight: 4,
		paddingBottom: 4,
		margin: '0 auto'

	},
	title: {
		textAlign: 'center'
	},
	slider_wrapper: {},
	sliders: {
		position: 'relative',
		width: 'calc(100% - 24px)'
	},
	percent_up: {
		color: 'cornflowerblue',
		textAlign: 'center',
		boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.25)'
	},
	percent_down: {
		color: 'blue',
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
		paddingLeft: 12,
		paddingRight: 12,
		paddingTop: 0,
		paddingBottom: 0,
		margin: 0,
		listStyleType: 'none'
	},
	range_wrapper: {
		width: '100%',
		position: 'relative',
		float: 'left',
		paddingBottom: 24,
		paddingLeft: 12,
		marginTop: 12,
		marginBottom: 12,
	},
	percent_rise: {
		width: 125,
		height: 56,
		marginTop: 0,
		marginBottom: 12,
		float: 'left'
	},
	percent_drop: {
		width: 125,
		height: 56,
		marginTop: 0,
		marginBottom: 12,
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
	disable_ctrl: {
		padding: 12,
		fontSize: 14,
		textAlign: 'center',
		textSpacing: 0.5,
		color: 'red'
	}
}

const marks = {
	'0': '1m',
	'20': '5m',
	'40': '15m',
	'60': '30m',
	'80': '1h',
	'100': '4h'
}

const marks_values = {
	 '0': 1,
	'20': 5,
	'40': 15,
	'60': 30,
	'80': 60,
   '100': 240
}

const values = {
	 '1': 0,
	 '5': 20,
	'15': 40,
	'30': 60,
	'60': 80,
   '240': 100
}

class SliderInterval extends React.Component {
	constructor(props) {
		super(props)

		const default_interval = values[this.props.defaultInterval]

		this.state = {
			default_interval: default_interval,
			disable_ctrl: false,
		}

	}

	componentDidMount() {

		const default_interval = values[this.props.defaultInterval]

		this.setState({
			default_interval: default_interval
		})

	}

	_onSliderChange = (idx) => {

		const { auth_user } = this.props

		let _interval = marks_values[idx]

		socket.emit('interval', {
			name: 'interval',
			prop: '_interval',
			auth_user: auth_user,
			value: _interval
		})

		___new_interval(_interval)

	}

	render() {

		const { disable_ctrl, default_interval } = this.state

		return (

			<div style={style.wrapper} className={disable_ctrl ? 'card-fade' : null}>

				{disable_ctrl ? <Spinner size={SpinnerSize.large}
										 className={'spinner-paused-data-feed'}
										 label={'Data feed is paused...'}
										 ariaLive={'assertive'} /> : null}

				<DocumentCard className={'card'}>

					<DocumentCardTitle title={'Interval'} />

					<div style={style.range_wrapper}>

						<Slider style={style.sliders}
								min={0}
								marks={marks}
								step={20}
								included={false}
								defaultValue={default_interval}
								onChange={this._onSliderChange} />


					</div>

				</DocumentCard>

			</div>
		)

	}

}

function mapStateToProps (state) {
	return {
		auth_user: state.allSimpleData.auth_user,
		interval: state.allSimpleData.interval,
	}
}

export default connect(
	mapStateToProps,
)(SliderInterval)