import React from 'react'

import { connect } from 'react-redux'

import * as utils from '../../util/utils'

import { _log, log } from '../../util/utils'

import { socket } from '../../redux/modules/socket_actions'

import _ from 'lodash'

import {

	DocumentCard,
	DocumentCardTitle

} from 'office-ui-fabric-react/lib/DocumentCard'

import { Dropdown } from 'office-ui-fabric-react/lib/Dropdown'

import { Label } from 'office-ui-fabric-react/lib/Label'

class CompoundRangeFilter extends React.Component {
	constructor (props) {
		super(props)

		this._onSelectPastHrs = this._onSelectPastHrs.bind(this)

		this._onSelectRecentHrs = this._onSelectRecentHrs.bind(this)

		this._onSelectVol2x = this._onSelectVol2x.bind(this)

		this._onSelectPastObo = this._onSelectPastObo.bind(this)

		this._onSelectRecentObo = this._onSelectRecentObo.bind(this)

		this._onSelectObo2x = this._onSelectObo2x.bind(this)


		const {

			is_2x_obo,
			is_2x,

			vol_last_to,
			vol_last_from,
			vol_past_to,
			vol_past_from,

			obo_last_to,
			obo_last_from,

			obo_past_to,
			obo_past_from,

			get_trades_last_to,
			get_trades_last_from,

			get_trades_past_to,
			get_trades_past_from,

		} = this.props


		// Volume - Volatility
		let recent_hr_options = [
			{ key: '1', to: 0, from: 60,  text: '1 hr' },
			{ key: '2', to: 0, from: 120, text: '2 hr' },
			{ key: '3', to: 0, from: 180, text: '3 hr' },
			{ key: '4', to: 0, from: 240, text: '4 hr' },
			{ key: '5', to: 0, from: 300, text: '5 hr' },
		]

		let past_hrs_options = [
			{ key: '10', to: 60, from: 600,  text: '10 hrs' },
			{ key: '20', to: 60, from: 1200, text: '20 hrs' },
			{ key: '30', to: 60, from: 1800, text: '30 hrs' },
			{ key: '40', to: 60, from: 2400, text: '40 hrs' },
			{ key: '50', to: 60, from: 3000, text: '50 hrs' },
			{ key: '60', to: 60, from: 3600, text: '60 hrs' },
		]

		let vol_2x_options = [
			{ key: '2', text: '2x' },
			{ key: '3', text: '3x' },
			{ key: '4', text: '4x' },
			{ key: '5', text: '5x' },
		]

		let vol_2x = _.find(vol_2x_options, (obj) => {
			return obj.key === `${is_2x}`
		})

		let recent_hrs = _.find(recent_hr_options, (obj) => {
			return obj.from === vol_last_from
		})

		let past_hrs = _.find(past_hrs_options, (obj) => {
		    return obj.from === vol_past_from
		})


		// Order Book
		let obo_recent_hr_options = [
			{ key: '1', to: 0, from: 60,  text: '1 hr' },
			{ key: '2', to: 0, from: 120, text: '2 hr' },
			{ key: '3', to: 0, from: 180, text: '3 hr' },
		]

		let obo_past_hrs_options = [
			{ key: '4',  to: 0,  from: 240,  text: '4 hr' },
			{ key: '5',  to: 60, from: 300,  text: '5 hrs' },
			{ key: '6',  to: 60, from: 360,  text: '6 hrs' },
			{ key: '7',  to: 60, from: 420,  text: '7 hrs' },
			{ key: '8',  to: 60, from: 480,  text: '8 hrs' },
		]

		let obo_2x_options = [
			{ key: '2', text: '2x' },
			{ key: '3', text: '3x' },
			{ key: '4', text: '4x' },
			{ key: '5', text: '5x' },
		]

		let obo_2x = _.find(obo_2x_options, (obj) => {
			return obj.key === `${is_2x_obo}`
		})

		let obo_recent_hrs = _.find(obo_recent_hr_options, (obj) => {
			return obj.from === obo_last_from
		})

		let obo_past_hrs = _.find(obo_past_hrs_options, (obj) => {
		    return obj.from === obo_past_from
		})

		this.state = {

			obo_2x: obo_2x,

			obo_past_hrs: obo_past_hrs,

			obo_recent_hrs: obo_recent_hrs,

			obo_recent_hr_options: obo_recent_hr_options,

			obo_past_hrs_options: obo_past_hrs_options,

			obo_2x_options: obo_2x_options,

			vol_2x: vol_2x,

			past_hrs: past_hrs,

			recent_hrs: recent_hrs,

			vol_2x_options: vol_2x_options,

			past_hrs_options: past_hrs_options,

			recent_hr_options: recent_hr_options,

			is_2x,

			is_2x_obo,

			vol_last_to,

			vol_last_from,

			vol_past_to,

			vol_past_from,

			obo_last_to,

			obo_last_from,

			obo_past_to,

			obo_past_from,

			get_trades_last_to,

			get_trades_last_from,

			get_trades_past_to,

			get_trades_past_from,

		}

	}

	_onSelectPastObo = (e, item) => {

		const { auth_user } = this.props

		let _data = {
			pref_to: '_obo_past_to',
			pref_from: '_obo_past_from',
			auth_user: auth_user,
			item: item,
		}

		log.yellow('_onSelectRecentHrs', _data)

		socket.emit('obo_past_hrs', _data)

		this.setState({
			obo_past_hrs: item
		})

	}

	_onSelectRecentObo = (e, item) => {

		const { auth_user } = this.props

		let _data = {
			pref_to: '_obo_last_to',
			pref_from: '_obo_last_from',
			auth_user: auth_user,
			item: item,
		}

		log.yellow('_onSelectRecentHrs', _data)

		socket.emit('obo_recent_hrs', _data)

		this.setState({
			obo_recent_hrs: item
		})

	}

	_onSelectObo2x = (e, item) => {

		this.props._onSelectObo2x(e, item)

		const { auth_user } = this.props

		let _data = {
			pref: '_is_2x_obo',
			auth_user: auth_user,
			item: item,
		}

		log.yellow('_onSelectObo2x', _data)

		socket.emit('obo_multiplier', _data)

		this.setState({
			obo_2x: item,
			is_2x_obo: +item.key,
		})

	}

	_onSelectRecentHrs = (e, item) => {

		const { auth_user } = this.props

		let _data = {
			pref_to: '_vol_last_to',
			pref_from: '_vol_last_from',
			auth_user: auth_user,
			item: item,
		}

		log.cyan('_onSelectRecentHrs', _data)

		socket.emit('vol_recent_hrs', _data)

		this.setState({
			recent_hrs: item
		})
	}

	_onSelectPastHrs = (e, item) => {

		const { auth_user } = this.props

		let _data = {
			pref_to: null,
			pref_from: '_vol_past_from',
			auth_user: auth_user,
			item: item,
		}

		log.yellow('_onSelectPastHrs', item)

		socket.emit('vol_past_hrs', _data)

		this.setState({
			past_hrs: item
		})

	}

	_onSelectVol2x = (e, item) => {

		this.props._onSelectVol2x(e, item)

		const { auth_user } = this.props

		let _data = {
			pref: '_is_2x',
			auth_user: auth_user,
			item: item,
		}

		socket.emit('vol_multiplier', _data)

		this.setState({
			vol_2x: item
		})

	}

	render () {

		const {

			// Volume - Volatility
			recent_hrs,
			past_hrs,
			vol_2x,
			recent_hr_options,
			past_hrs_options,
			vol_2x_options,

			// Order Book
			obo_past_hrs,
			obo_recent_hrs,
			obo_2x,
			obo_recent_hr_options,
			obo_past_hrs_options,
			obo_2x_options,

		} = this.state


		return (
			<section className={'compare-ctrl-wrapper'}>

				{/* ================== VOLUME ================== */}
				<DocumentCard className={'card compare-card'}>

					<DocumentCardTitle title={'Volume'} />

					<div className={'compare-ctrl-drop-down-wrapper'}>

						<section id={'hours_recent'} className={'compare-ctrl-section'}>

							<Label className={'compare-ctrl-label'}>
								(A): Compare the Vol Avg of the past
							</Label>

							<div className={'compare-ctrl-drop-down'}>

								<Dropdown selectedKey={recent_hrs.key}
										  onChange={this._onSelectRecentHrs}
										  options={recent_hr_options} />

							</div>

						</section>

						<section id={'hours_past'} className={'compare-ctrl-section'}>

							<Label className={'compare-ctrl-label'}>
								(B): To the Vol Avg of the previous
							</Label>

							<div className={'compare-ctrl-drop-down'}>

								<Dropdown placeholder={'Select'}
										  selectedKey={past_hrs.key}
										  onChange={this._onSelectPastHrs}
										  options={past_hrs_options} />

							</div>

						</section>

						<section id={'is_2x'} className={'compare-ctrl-section'}>

							<Label className={'compare-ctrl-label-before'}>
								Include Markets where Vol Avg (A) is at least
							</Label>

							<div className={'compare-ctrl-drop-down'}>

								<Dropdown placeholder={'Select'}
										  selectedKey={vol_2x.key}
										  onChange={this._onSelectVol2x}
										  options={vol_2x_options} />

							</div>

							<Label className={'compare-ctrl-label-after'}>
								the Vol Avg (B)
							</Label>

						</section>


					</div>

				</DocumentCard>


				{/* ================== ORDER BOOK ================== */}
				<DocumentCard className={'card compare-card'}>

					<DocumentCardTitle title={'Order Book'} />

					<div className={'compare-ctrl-drop-down-wrapper'}>

						<section id={'obo_recent'} className={'compare-ctrl-section'}>

							<Label className={'compare-ctrl-label'}>
								(A): Compare New Orders of the past
							</Label>

							<div className={'compare-ctrl-drop-down'}>

								<Dropdown selectedKey={obo_recent_hrs.key}
										  onChange={this._onSelectRecentObo}
										  options={obo_recent_hr_options} />

							</div>

						</section>

						<section id={'obo_past'} className={'compare-ctrl-section'}>

							<Label className={'compare-ctrl-label'}>
								(B): To the New Orders of the previous
							</Label>

							<div className={'compare-ctrl-drop-down'}>

								<Dropdown placeholder={'Select'}
										  selectedKey={obo_past_hrs.key}
										  onChange={this._onSelectPastObo}
										  options={obo_past_hrs_options} />

							</div>

						</section>

						<section id={'is_2x'} className={'compare-ctrl-section obo-compare-ctrl-section'}>

							<Label className={'compare-ctrl-label-before'}>
								Highlight Markets where total of (A) is at least
							</Label>

							<div className={'compare-ctrl-drop-down'}>

								<Dropdown placeholder={'Select'}
										  selectedKey={obo_2x.key}
										  onChange={this._onSelectObo2x}
										  options={obo_2x_options} />

							</div>

							<Label className={'compare-ctrl-label-after'}>
								the total of (B)
							</Label>

						</section>

					</div>

				</DocumentCard>

			</section>
		)

	}

}

function mapStateToProps (state) {
	return {

		...state.allSimpleData

	}
}

export default connect(
	mapStateToProps
)(CompoundRangeFilter)
