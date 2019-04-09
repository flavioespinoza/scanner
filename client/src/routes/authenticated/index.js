import React from 'react'
import { Route, Switch } from 'react-router-dom'
import SimpleList from '../../components/list/SimpleList'
import CompoundList from '../../components/list/CompoundList'


const AuthenticatedRoutes = () => (
	<Switch>
		<Route exact path="/simple_list" component={SimpleList}/>
		<Route exact path="/compound_list" component={CompoundList}/>
	</Switch>
)

export default AuthenticatedRoutes
