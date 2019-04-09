import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getAuthenticatedUser } from '../../redux/modules/user'
import { logoutUser } from '../../redux/modules/authentication'
import { mobileBreakpoint } from '../../constants/ui-constants'
import _ from 'lodash'
import { _log, log } from '../../util/utils'

class Header extends Component {
	constructor (props) {
		super(props)

		this._mobileCheck = this._mobileCheck.bind(this)
		this._toggleMobileNav = this._toggleMobileNav.bind(this)
		this._nav = this._nav.bind(this)

		this.state = {
			is_mobile: window.innerWidth <= mobileBreakpoint,
			mobileNavOpen: false
		}

	}

	componentDidMount () {

		window.addEventListener('resize', this._mobileCheck)

	}

	componentWillUnmount () {

		window.removeEventListener('resize', this._mobileCheck)

	}

	_mobileCheck () {

		_log.alert('_mobileCheck')

		let check = window.innerWidth <= mobileBreakpoint

		this.setState({
			is_mobile: check
		})

	}



	_toggleMobileNav () {

		this.setState({
			mobileNavOpen: !this.state.mobileNavOpen
		})

	}

	_nav () {

		const { user } = this.props

		const { is_mobile } = this.state

		const path_name = window.location.pathname

		const links = [

			{
				name: 'Simple List',
				link: 'simple_list',
				authenticated: true,
				show: true,
			},
			{
				name: 'Compound List',
				link: 'compound_list',
				authenticated: true,
				show: true,
			},
			{
				name: ' | ',
				link: 'spacer',
				authenticated: true,
				show: true,
			},
			{
				name: 'Logout',
				onClick: this.props.logoutUser,
				link: 'logout',
				authenticated: true,
				show: true,
			}
		]

		const _filter = _.filter(links, (link) => {
			return link.authenticated === this.props.authenticated
		})

		const _links = _.map(_filter, (link) => {
			if (link.link === 'spacer' && !is_mobile) {

				return (
					<li key={link.name}>{link.name}</li>
				)

			}
			else if (link.link === 'simple_list' || link.link === 'compound_list') {

				let link_path = `/${link.link}`

				let class_active = ''

				if (link_path === path_name) {
					class_active = 'active'
				}

				return (
					<li key={link.name} className={class_active}>
						<a href={link_path}>{link.name}</a>
					</li>
				)

			}
			else if (link.link === 'logout') {

				return (
					<li key={link.name}>
						{link.onClick && <a href="javascript:void(null);" onClick={link.onClick}>{link.name}</a>}
					</li>
				)

			}
		})

		return (
			<ul className={is_mobile ? 'header-ul header-ul-mobile' : 'header-ul'}>
				{_links}
			</ul>
		)

	}

	render () {

		const { is_mobile, mobileNavOpen } = this.state

		const host = window.location.hostname

		return (
			<header style={{ zIndex: 100 }} className={host === 'localhost' ? 'is-localhost' : null}>

				<strong className="logo left">The God Particle</strong>

				{is_mobile &&
				<a href="javascript:void(null);"
				   role="button"
				   className="mobile-nav-toggle clearfix right material-icons"
				   onClick={this._toggleMobileNav}
				   aria-label="Toggle navigation">

					{mobileNavOpen ? 'close' : 'menu'}

				</a>
				}

				<nav className={`main-navigation right ${is_mobile ? `mobile ${mobileNavOpen ? 'is-expanded' : ''}` : ''}`}>
					{this._nav()}
				</nav>

			</header>
		)
	}
}

Header.propTypes = {
	user: PropTypes.shape({
		firstName: PropTypes.string
	}),
	authenticated: PropTypes.bool,
	logoutUser: PropTypes.func
}

const mapStateToProps = ({user, authentication}) => ({
	user: getAuthenticatedUser({user, authentication}),
	authenticated: authentication.authenticated
})

export default connect(mapStateToProps, {logoutUser})(Header)
