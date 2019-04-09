import React, { Component } from 'react'
import { socket } from '../../redux/modules/socket_actions'
import _ from 'lodash'

import { Toggle } from 'office-ui-fabric-react/lib/Toggle'

const log = require('ololog').configure({locate: false})

class Dashboard extends Component {

	constructor (props) {
		super(props)

		this._startInterval = this._startInterval.bind(this)
		this._stopInterval = this._stopInterval.bind(this)
		this._onToggle = this._onToggle.bind(this)

		socket.on('button_push_registered', (data) => {
			log.green(data.msg)
		})

		socket.on('home_page_registered', (data) => {
			log.cyan(data.msg)
			console.log(new Date(data.timestamp))
		})

		socket.on('all_simple_data', (data) => {
			console.log('all_simple_data', data)
		})

		socket.on('simple_data', (data) => {
			console.log('simple_data', data)
		})

		socket.on('compound_data', (data) => {
			console.log('compound_data', data)
		})

		this.state = {
			my_interval: null,
		}

	}

	componentDidMount () {
		this._startInterval()
	}

	componentWillUnmount() {
		socket.removeAllListeners()
		this.setState({
			my_interval: clearInterval(this.state.my_interval)
		})
	}

	_startInterval () {
		socket.emit('push_button')
		socket.emit('home_page_emit', {msg: 'HOME PAGE EMIT!!!!', timestamp: _.now()})
		let my_interval = setInterval(() => {
			socket.emit('home_page_emit', {msg: 'HOME PAGE EMIT!!!!', timestamp: _.now()})
		}, 15000)

		this.setState({
			my_interval: my_interval,
		})
	}

	_stopInterval () {
		this.setState({
			my_interval: clearInterval(this.state.my_interval)
		})
	}

	_onToggle (e, is_checked) {

		console.log({is_checked})

		if (is_checked) {
			this._startInterval()
		} else {
			this._stopInterval()
		}

	}

	render () {
		return (
			<div>

				<button onClick={this._startInterval}>START INTERVAL</button>

				<button onClick={this._stopInterval}>STOP INTERVAL</button>

				<Toggle defaultChecked={true}
						className={'toggle-pause-update'}
						onText={'Data updating every 15s'}
						offText={'Data paused...'}
						onChange={this._onToggle}/>


			</div>
		)
	}
}

export default Dashboard
