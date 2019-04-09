// import 'rc-slider/assets/index.css'
//
// import React from 'react'
//
// import { connect } from 'react-redux'
//
// import { socket } from '../../redux/modules/socket_actions'
//
// import { _log, log } from '../../util/utils'
//
// import _ from 'lodash'
//
// import {
//
// 	DocumentCard,
// 	DocumentCardTitle,
//
// } from 'office-ui-fabric-react/lib/DocumentCard'
//
// import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner'
//
// import Slider from 'rc-slider'
//
// import {
//
// 	___from_to_value,
// 	___to,
// 	___from,
//
// } from '../../index'
//
//
// const Chance = require('chance')
// const chance = new Chance()
//
// const Range = Slider.Range
//
// const style = {
// 	wrapper: {
// 		padding: 4,
// 		margin: '0 auto'
// 	},
// 	title: {
// 		textAlign: 'center'
// 	},
// 	slider_wrapper: {},
// 	sliders: {
// 		position: 'relative',
// 		width: 400
// 	},
// 	percent_up: {
// 		color: 'cornflowerblue',
// 		textAlign: 'center',
// 		boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.25)'
// 	},
// 	percent_down: {
// 		color: 'blue',
// 		textAlign: 'center',
// 		boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.25)'
// 	},
// 	ul: {
// 		paddingLeft: 12,
// 		paddingRight: 12,
// 		paddingTop: 0,
// 		paddingBottom: 0,
// 		margin: 0,
// 		listStyleType: 'none'
// 	},
// 	li: {
// 		width: '100%',
// 		height: 56,
// 		marginTop: 0,
// 		marginBottom: 12,
// 	},
// 	percent_wrapper: {
// 		width: 280,
// 		position: 'relative',
// 		float: 'left',
// 		paddingLeft: 12,
// 		paddingRight: 12,
// 		paddingTop: 0,
// 		paddingBottom: 0,
// 		margin: 0,
// 		listStyleType: 'none'
// 	},
// 	range_wrapper: {
// 		width: '100%',
// 		position: 'relative',
// 		float: 'left',
// 		paddingBottom: 24,
// 		marginTop: 12,
// 		marginBottom: 12,
// 	},
// 	percent_rise: {
// 		width: 125,
// 		height: 56,
// 		marginTop: 0,
// 		marginBottom: 12,
// 		float: 'left'
// 	},
// 	percent_drop: {
// 		width: 125,
// 		height: 56,
// 		marginTop: 0,
// 		marginBottom: 12,
// 		marginLeft: 12,
// 		float: 'left'
// 	},
// 	div: {
// 		position: 'relative',
// 		float: 'left',
// 		padding: 6
// 	},
// 	quote: {
// 		width: '70%',
// 		float: 'left'
// 	},
// 	no_of_markets: {
// 		width: '30%',
// 		float: 'right',
// 		textAlign: 'right'
// 	},
// 	min: {
// 		float: 'left',
// 		paddingTop: 0,
// 		paddingLeft: 8,
// 	},
// 	max: {
// 		float: 'right',
// 		textAlign: 'right',
// 		paddingTop: 0,
// 		paddingRight: 8,
// 	},
// 	disable_ctrl: {
// 		padding: 12,
// 		fontSize: 14,
// 		textAlign: 'center',
// 		textSpacing: 0.5,
// 		color: 'red'
// 	}
// }
//
// const sliderObj = {
// 	max: 0,
// 	min: -8,
// 	values: {
// 		'0': 'now',
// 		'-1': '-5m',
// 		'-2': '-15m',
// 		'-3': '-30m',
// 		'-4': '-1h',
// 		'-5': '-2h',
// 		'-6': '-12h',
// 		'-7': '-1d',
// 		'-8': '-6w',
// 	}
// }
//
// const marks = {
// 	'0':  0,
// 	'-1': -5,
// 	'-2': -15,
// 	'-3': -30,
// 	'-4': -60,
// 	'-5': -120,
// 	'-6': -720,
// 	'-7': -1440,
// 	'-8': -60480,
// }
//
// const mark_indices = {
// 	'0':		 0,
// 	'-5': 		-1,
// 	'-15': 		-2,
// 	'-30': 		-3,
// 	'-60': 		-4,
// 	'-120': 	-5,
// 	'-720': 	-6,
// 	'-1440': 	-7,
// 	'-60480': 	-8,
// }
//
// class SliderDateRange extends React.Component {
// 	constructor(props) {
// 		super(props);
// 		this.state = {
// 			value: [null, null],
// 			from: null,
// 			to: null,
// 		};
// 	}
//
// 	componentWillMount () {
//
// 		const { from, to } = this.props
//
// 		const _from = -(Math.abs(from))
//
// 		const _to = -(Math.abs(to))
//
// 		const _value = [mark_indices[_from], mark_indices[_to]]
//
// 		this.setState({
// 			value: _value,
// 			from: _from,
// 			to: _to,
// 		})
//
// 	}
//
// 	_onSliderChange = (value) => {
//
// 		const { actions } = this.props
//
// 		const from = value[0]
//
// 		const to   = value[1]
//
// 		const _value = [from, to]
//
// 		const get_mark = (key) => {
// 			return marks[key]
// 		}
//
// 		const _from = get_mark(from)
//
// 		const _to = get_mark(to)
//
// 		socket.emit('from_to_value', _value)
// 		socket.emit('to', _value)
// 		socket.emit('from', _value)
//
// 		___to(_to)
// 		___from(_from)
// 		___from_to_value(_value)
//
// 		this.setState({
// 			value: _value,
// 			from: _from,
// 			to: _to
// 		})
//
// 	}
//
// 	render() {
//
// 		const { disable_ctrl } = this.props
//
// 		const { value } = this.state
//
// 		return (
//
// 			<div style={style.wrapper} className={disable_ctrl ? 'card-fade' : null}>
//
// 				{disable_ctrl ? <Spinner size={SpinnerSize.large}
// 										 className={'spinner-paused-data-feed'}
// 										 label={'Data feed is paused...'}
// 										 ariaLive={'assertive'} /> : null}
//
// 				<DocumentCard className={'card'}>
//
// 					<DocumentCardTitle title={'Last update'} />
//
// 					<div style={style.range_wrapper}>
//
// 						<Range count={7}
// 							   pushable
// 							   // disabled={disable_ctrl}
// 							   handleStyle={
// 								   [
// 									   { backgroundColor: 'gainsboro', borderColor: 'gray' },
// 									   { backgroundColor: 'lightblue', borderColor: 'gray' }
// 								   ]
//
// 							   }
// 							   trackStyle={[{ backgroundColor: '#D7D7D7' }]}
// 							   className={'flavio-marks'}
// 							   min={sliderObj.min}
// 							   max={sliderObj.max}
// 							   marks={sliderObj.values}
// 							   style={{width: 260, marginLeft: 12}}
// 							   value={value}
// 							   onChange={this._onSliderChange} />
//
// 					</div>
//
// 				</DocumentCard>
//
// 			</div>
//
// 		)
//
// 	}
//
// }
//
// function mapStateToProps (state) {
// 	return {
// 		...state.allSimpleData,
// 	}
// }
//
// export default connect(
// 	mapStateToProps
// )(SliderDateRange)