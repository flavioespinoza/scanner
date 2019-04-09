import React from 'react'

import { connect } from 'react-redux'

import _ from 'lodash'

import { socket } from '../../redux/modules/socket_actions'

import {
	DocumentCard,
	DocumentCardTitle
} from 'office-ui-fabric-react/lib/DocumentCard'

import { Label } from 'office-ui-fabric-react/lib/Label'

import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog'

import { ActionButton, PrimaryButton } from 'office-ui-fabric-react/lib/Button'

import { IconButton } from 'office-ui-fabric-react/lib/Button'

import { Spinner } from 'office-ui-fabric-react/lib/Spinner'

import { Checkbox } from 'office-ui-fabric-react/lib/Checkbox'

import PercentChangeFilter from './PercentChangeFilter'

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

		socket.on('enable_ctrl', () => {
			this.setState({
				disable_ctrl: false,
			})
		})

		const { percent_props, prop_name } = this.props

		this.state = {
			disable_ctrl: false,
			auth_user: {},
			hideDialog: true,
			percent_props: percent_props
		}

	}

	componentWillReceiveProps(newProps) {

		const { auth_user, disable_ctrl } = newProps

		this.setState({
			disable_ctrl: disable_ctrl,
			auth_user: auth_user,
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

	_showFilter (e, isChecked, prop_name) {

		const percent_props = this.state.percent_props

		this.setState({
			disable_ctrl: true
		})

		log.red(`${prop_name} = ${isChecked}`)

		percent_props[prop_name].show = isChecked

		let data = {
			name: prop_name,
			prop: `_${prop_name}`,
			auth_user: this.state.auth_user
		}

		if (isChecked) {
			socket.emit('show_percent_props', data)
		} else {
			socket.emit('hide_percent_props', data)
		}

		this.setState({
			percent_props: percent_props
		})

	}

	_handler (prop_name_child) {

		this.setState({
			disable_ctrl: true
		})

		const percent_props = this.state.percent_props

		percent_props[prop_name_child].show = false

		this.setState({
			percent_props: percent_props
		})
	}

	render () {

		const { disable_ctrl } = this.state

		const { percent_props } = this.state

		const checkboxes = _.map(percent_props, (val, key) => {

			let _split = key.split('_')
			let _title = `${_.capitalize(_split[0])}_${_.capitalize(_split[1])}`

			let prop_name = key

			return (
				<div className={'modal-percent-change__checkbox-wrapper'} key={chance.guid()}>

					<Checkbox
						label={`${_title}`}
						disabled={disable_ctrl}
						defaultChecked={val.show}
						className={'modal-percent-change__checkbox'}
						onChange={(e, isChecked) => this._showFilter(e, isChecked, prop_name)}/>

				</div>
			)

		})

		const filter_list = _.map(percent_props, (obj, prop_name) => {
			return (
				<div key={prop_name}>
					{this.state.percent_props ?
						<div> {this.state.percent_props[prop_name].show ?
							<PercentChangeFilter handler={(e) => this._handler(prop_name)}
												 disableCtrl={this.state.disable_ctrl}
												 dataObj={this.state.percent_props[prop_name]} /> : null}
						</div> : null}
				</div>
			)
		})

		const spinner = () => {
			return (
				<div className={'percent-change-filer__spinner'}>
					<Spinner label="Updating filters..." />
				</div>
			)
		}

		return (
			<div style={style.wrapper} className={disable_ctrl ? 'card-fade' : null}>

				<DocumentCard className={'card card-percent-list'}>

					<div className={'ms-DocumentCardTitle'}>

							<ActionButton data-automation-id="watchlist_modal"
										  iconProps={{iconName: 'Add'}}
										  disabled={disable_ctrl}
										  onClick={this._showDialog.bind(this)}>

								Percent change filters

							</ActionButton>

					</div>

					{filter_list}

					<div style={{paddingTop: 0, paddingBottom: 12}}>

					</div>

				</DocumentCard>

				<section className={'modal-percent-change__section'}>

					<Dialog hidden={this.state.hideDialog}
							onDismiss={this._closeDialog}
							dialogContentProps={{
								type: DialogType.normal,
								title: 'Percent change filters',
								subText: 'Select percent change filters you want to add.'
							}}
							modalProps={{
								isBlocking: false,
								containerClassName: 'modal-percent-change-wrapper'
							}}>

						<div className={'modal-percent-change__wrapper'}>

							{disable_ctrl ? spinner() : null}

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

function mapStateToProps (state) {
	return {
		auth_user: state.allSimpleData.auth_user,
		percent_props: state.allSimpleData.percent_props,
	}
}

export default connect(
	mapStateToProps,
)(PercentChangeList)
