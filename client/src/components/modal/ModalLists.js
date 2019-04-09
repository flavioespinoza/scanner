import * as React from 'react'
import { Dialog, DialogType, DialogFooter } from 'office-ui-fabric-react/lib/Dialog'
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button'
import { ChoiceGroup } from 'office-ui-fabric-react/lib/ChoiceGroup'

class ModalLists extends React.Component {
	constructor (props) {
		super(props)
		this._showDialog = () => {
			this.setState({hideDialog: false})
		}
		this._closeDialog = () => {
			this.setState({hideDialog: true})
		}
		this.state = {
			hideDialog: true
		}
	}

	render () {
		return (

			<section id={'fabric_modal'}>
				<DefaultButton secondaryText="Opens the Sample Dialog" onClick={this._showDialog} text="Open Dialog"/>
				<Dialog hidden={this.state.hideDialog}
						onDismiss={this._closeDialog}
						dialogContentProps={{
							type: DialogType.largeHeader,
							title: 'All emails together',
							subText: 'Your Inbox has changed. No longer does it include favorites, it is a singular destination for your emails.'
						}} modalProps={{
					isBlocking: false,
					containerClassName: 'ms-dialogMainOverride'
				}}>

					<ChoiceGroup options={[
						{
							key: 'A',
							text: 'Option A'
						},
						{
							key: 'B',
							text: 'Option B',
							checked: true
						},
						{
							key: 'C',
							text: 'Option C',
							disabled: true
						}
					]} onChange={this._onChoiceChanged}/>


					<DialogFooter>
						<PrimaryButton onClick={this._closeDialog} text="Save"/>
						<DefaultButton onClick={this._closeDialog} text="Cancel"/>
					</DialogFooter>
				</Dialog>
			</section>
		)
	}

	_onChoiceChanged () {
		console.log('Choice option change')
	}
}

export {
	ModalLists
}