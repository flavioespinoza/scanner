import * as React from 'react'
import { CommandBarButton } from 'office-ui-fabric-react/lib/Button'

class ControlsNavBar extends React.Component {
	constructor (props) {
		super(props)

		this._changeTab = this._changeTab.bind(this)

		const { enable_filters } = this.props

		this.state = {
			enable_filters: enable_filters,
			filters_visible: true,
			watchlist_visible: false,
			ignore_list_visible: false
		}

	}

	componentWillReceiveProps(newProps) {

		const { enable_filters } = newProps

		this.setState({
			enable_filters: enable_filters,
		})

	}

	_changeTab (e, id) {

		if (id === 'filters_visible') {

			let update = {
				filters_visible: true,
				watchlist_visible: false,
				ignore_list_visible: false
			}

			this.props._tabsHandler(update)

			this.setState(update)
		}
		else if (id === 'watchlist_visible') {

			let update = {
				filters_visible: false,
				watchlist_visible: true,
				ignore_list_visible: false
			}

			this.props._tabsHandler(update)

			this.setState(update)
		}
		else if (id === 'ignore_list_visible') {

			let update = {
				filters_visible: false,
				watchlist_visible: false,
				ignore_list_visible: true
			}

			this.props._tabsHandler(update)

			this.setState(update)

		}

	}

	render () {

		const { enable_filters } = this.state

		return (
			<section className={'controls-nav-bar'}>
				<div style={{display: 'flex', alignItems: 'stretch', height: '40px'}}>
					<CommandBarButton
						className={this.state.filters_visible ? 'active filters-icon' : 'filters-icon'}
						data-automation-id="filters_visible"
						checked={this.state.filters_visible}
						iconProps={{iconName: 'Filter'}}
						disabled={!enable_filters}
						onClick={(e) => this._changeTab(e, 'filters_visible')}
					/>
					<CommandBarButton
						className={this.state.watchlist_visible ? 'active watchlist-icon' : 'watchlist-icon'}
						data-automation-id="watchlist_visible"
						checked={this.state.watchlist_visible}
						iconProps={{iconName: 'RedEye'}}
						disabled={!enable_filters}
						onClick={(e) => this._changeTab(e, 'watchlist_visible')}
					/>

					<CommandBarButton
						className={this.state.ignore_list_visible ? 'active ignore-list-icon' : 'ignore-list-icon'}
						data-automation-id="ignore_list_visible"
						checked={this.state.ignore_list_visible}
						iconProps={{iconName: 'Blocked'}}
						disabled={!enable_filters}
						onClick={(e) => this._changeTab(e, 'ignore_list_visible')}
					/>
				</div>
			</section>
		)
	}

}

export default ControlsNavBar