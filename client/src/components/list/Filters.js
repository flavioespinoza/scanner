import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import _ from 'lodash'

import * as utils from '../../util/utils'

import { socket } from '../../redux/modules/socket_actions'

import {
	DocumentCard,
	DocumentCardTitle
} from 'office-ui-fabric-react/lib/DocumentCard'

import { Label } from 'office-ui-fabric-react/lib/Label'

import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog'

import { PrimaryButton } from 'office-ui-fabric-react/lib/Button'

import { IconButton } from 'office-ui-fabric-react/lib/Button'

import { TextField } from 'office-ui-fabric-react/lib/TextField'

import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox'

import PercentChangeFilter from './PercentChangeFilter'

import { ___set_percent_props } from '../../index'

import { _log, log } from '../../util/utils'

import { initializeIcons } from '@uifabric/icons'

initializeIcons()

const Chance = require('chance')
const chance = new Chance()

const style = {
	card_title: {
		textSize: '10px !important',
		borderBottom: 'none !important'
	},
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
	percent_up: {
		color: 'green',
		textAlign: 'center',
		boxShadow: 'inset 0 0 6px rgba(0, 0, 0, 0.25)'
	},
	percent_down: {
		color: 'red',
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

	percent_rise: {
		width: 108,
		marginTop: 0,
		marginBottom: 24,
		float: 'left'
	},
	percent_drop: {
		width: 108,
		marginTop: 0,
		marginLeft: 12,
		marginBottom: 24,
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
	choice_group_wrapper: {
		height: 300,
		backgroundColor: 'pink'
	}
}

let _percent_props

let _count = 0

class PercentChangeList extends React.Component {

	constructor (props) {
		super(props)

		this._closeDialog = this._closeDialog.bind(this)
		this._showFilter = this._showFilter.bind(this)

		this.state = {
			hideDialog: true,
			percent_props: null
		}

	}

	componentDidMount () {

		_log.info('componentDidMount')

		console.log(JSON.stringify(this.props.percentProps))

		_percent_props = this.props.percentProps

		this.setState({
			percent_props: this.props.percentProps
		})

	}

	_showDialog (e) {

		this.setState({
			hideDialog: false
		})

	}

	_closeDialog () {

		this.setState({
			hideDialog: true
		})

	}

	_onTextChange (e, val, prop_name, percent_sign) {

		socket.emit(`set_${percent_sign}`, {
			prop_name: prop_name,
			val: val,
		})

	}

	_showFilter (e, isChecked, prop_name) {

		const percent_props = this.state.percent_props

		log.red(`${prop_name} = ${isChecked}`)

		percent_props[prop_name].show = isChecked

		let obj = percent_props[prop_name]

		socket.emit('show_percent_props', obj)

		this.setState({
			percent_props: percent_props
		})

	}

	_hideFilter (prop_name) {

		let percent_props =  this.state.percent_props

		percent_props[prop_name].show = false

		let obj = percent_props[prop_name]

		socket.emit('hide_percent_props', obj)

		this.setState({
			percent_props: percent_props
		})

	}

	_handler (prop_name_child) {

		const percent_props = this.state.percent_props

		percent_props[prop_name_child].show = false

		this.setState({
			percent_props: percent_props
		})
	}

	render () {

		const {disable_ctrl} = this.props
		const {percent_props} = this.state

		const checkboxes = _.map(percent_props, (val, key) => {

			let _split = key.split('_')
			let _title = `${_.capitalize(_split[0])}_${_.capitalize(_split[1])}`

			let prop_name = key

			return (

				<div className={'modal-percent-change__checkbox-wrapper'} key={chance.guid()}>

					<Checkbox
						label={`${_title}`}
						defaultChecked={val.show}
						className={'modal-percent-change__checkbox'}
						onChange={(e, isChecked) => this._showFilter(e, isChecked, prop_name)}/>

				</div>

			)

		})

		return (
			<div style={style.wrapper} className={disable_ctrl ? 'card-fade' : null}>

				<DocumentCard className={'card card-percent-list'}>

					<div className={'card-percent-list-title__main'}>

						<DocumentCardTitle className={'main-title'} title={'Percent change filters'}/>

						<IconButton className={'btn-icon-percent-list'}
									iconProps={{iconName: 'BoxAdditionSolid'}}
									title="BoxAdditionSolid"
									ariaLabel="BoxAdditionSolid"
									onClick={this._showDialog.bind(this)}/>

						<Label style={{paddingRight: 12, color: '#A6A6A6', fontSize: 9}}>Click the square + button in the upper right to add a filter.</Label>

					</div>


					{this.state.percent_props ? <div>
						{this.state.percent_props['open_close'].show ?
							<PercentChangeFilter handler={(e) => this._handler(e, 'open_close')} dataObj={this.state.percent_props['open_close']} /> : null}
					</div> : null}

					{this.state.percent_props ? <div>
						{this.state.percent_props['open_high'].show ?
							<PercentChangeFilter dataObj={this.state.percent_props['open_high']} /> : null}
					</div> : null}

					{this.state.percent_props ? <div>
						{this.state.percent_props['open_low'].show ?
							<PercentChangeFilter dataObj={this.state.percent_props['open_low']} /> : null}
					</div> : null}

					{this.state.percent_props ? <div>
						{this.state.percent_props['close_open'].show ?
							<PercentChangeFilter dataObj={this.state.percent_props['close_open']} /> : null}
					</div> : null}

					{this.state.percent_props ? <div>
						{this.state.percent_props['close_high'].show ?
							<PercentChangeFilter dataObj={this.state.percent_props['close_high']} /> : null}
					</div> : null}

					{this.state.percent_props ? <div>
						{this.state.percent_props['close_low'].show ?
							<PercentChangeFilter dataObj={this.state.percent_props['close_low']} /> : null}
					</div> : null}

					{this.state.percent_props ? <div>
						{this.state.percent_props['high_open'].show ?
							<PercentChangeFilter dataObj={this.state.percent_props['high_open']} /> : null}
					</div> : null}

					{this.state.percent_props ? <div>
						{this.state.percent_props['high_close'].show ?
							<PercentChangeFilter dataObj={this.state.percent_props['high_close']} /> : null}
					</div> : null}

					{this.state.percent_props ? <div>
						{this.state.percent_props['high_low'].show ?
							<PercentChangeFilter dataObj={this.state.percent_props['high_low']} /> : null}
					</div> : null}

					{this.state.percent_props ? <div>
						{this.state.percent_props['low_open'].show ?
							<PercentChangeFilter dataObj={this.state.percent_props['low_open']} /> : null}
					</div> : null}

					{this.state.percent_props ? <div>
						{this.state.percent_props['low_close'].show ?
							<PercentChangeFilter dataObj={this.state.percent_props['low_close']} /> : null}
					</div> : null}

					{this.state.percent_props ? <div>
						{this.state.percent_props['low_high'].show ?
							<PercentChangeFilter dataObj={this.state.percent_props['low_high']} /> : null}
					</div> : null}


					<div style={{paddingTop: 0, paddingBottom: 36, borderTop: '1px solid gainsboro'}}>

					</div>

				</DocumentCard>

				<section className={'modal-percent-change__section'}>

					<Dialog hidden={this.state.hideDialog}
							className={'modal-percent-change__dialog'}
							onDismiss={this._closeDialog}
							dialogContentProps={{
								type: DialogType.largeHeader,
								title: 'Percent change filters',
								subText: 'Select a checkbox and hit the "LOAD SELECTED FILTERS" button.  Then select percent above zero and percent below zero you want to include in your query and hit the "UPDATE QUERY" button.'
							}}
							modalProps={{
								isBlocking: false,
								containerClassName: 'ms-dialogMainOverride'
							}}>

						<div className={'modal-percent-change__wrapper'}>

							{this.state.percent_props ? checkboxes : null}

						</div>

						<DialogFooter>

							<PrimaryButton onClick={this._closeDialog} text={'CLOSE'}/>

						</DialogFooter>

					</Dialog>

				</section>

			</div>
		)

	}

}

export default PercentChangeList
