import { createStore, applyMiddleware, combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import reduxThunk from 'redux-thunk'
import userReducer from './modules/user'
import authenticationReducer from './modules/authentication'
import allSimpleData from './modules/all_simple_data'

const createStoreWithMiddleware = applyMiddleware(reduxThunk)(createStore)

const rootReducer = combineReducers({
	authentication: authenticationReducer,
	user: userReducer,
	form: formReducer,
	allSimpleData: allSimpleData,

})

const configureStore = initialState => createStoreWithMiddleware(rootReducer, initialState)
export default configureStore
