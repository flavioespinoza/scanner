import * as React from 'react'
import { createListItems } from 'office-ui-fabric-react/lib/utilities/exampleData'
import { Link } from 'office-ui-fabric-react/lib/Link'
import { Image, ImageFit } from 'office-ui-fabric-react/lib/Image'
import { DetailsList, buildColumns } from 'office-ui-fabric-react/lib/DetailsList'
import { mergeStyles } from 'office-ui-fabric-react/lib/Styling'

const _items = createListItems(500)

class CustomColList extends React.Component {

	constructor () {
		super(...arguments)
		this.state = {
			sortedItems: _items,
			columns: _buildColumns()
		}
		this._onColumnClick = (event, column) => {
			const {columns} = this.state
			let {sortedItems} = this.state
			let isSortedDescending = column.isSortedDescending
			// If we've sorted this column, flip it.
			if (column.isSorted) {
				isSortedDescending = !isSortedDescending
			}
			// Sort the items.
			sortedItems = _copyAndSort(sortedItems, column.fieldName, isSortedDescending)
			// Reset the items and columns to match the state.
			this.setState({
				sortedItems: sortedItems,
				columns: columns.map(col => {
					col.isSorted = col.key === column.key
					if (col.isSorted) {
						col.isSortedDescending = isSortedDescending
					}
					return col
				})
			})
		}
	}

	render () {
		const {sortedItems, columns} = this.state
		return (<DetailsList items={sortedItems} setKey="set" columns={columns} onRenderItemColumn={_renderItemColumn} onColumnHeaderClick={this._onColumnClick} onItemInvoked={this._onItemInvoked}
							 onColumnHeaderContextMenu={this._onColumnHeaderContextMenu} ariaLabelForSelectionColumn="Toggle selection" ariaLabelForSelectAllCheckbox="Toggle selection for all items"/>)
	}

	_onColumnHeaderContextMenu (column, ev) {
		console.log(`column ${column.key} contextmenu opened.`)
	}

	_onItemInvoked (item, index) {
		alert(`Item ${item.name} at index ${index} has been invoked.`)
	}
}

function _buildColumns () {
	const columns = buildColumns(_items)
	const thumbnailColumn = columns.filter(column => column.name === 'thumbnail')[0]
	// Special case one column's definition.
	thumbnailColumn.name = ''
	thumbnailColumn.maxWidth = 50
	return columns
}

function _renderItemColumn (item, index, column) {
	const fieldContent = item[column.fieldName]
	switch (column.key) {
		case 'thumbnail':
			return <Image src={fieldContent} width={50} height={50} imageFit={ImageFit.cover}/>
		case 'name':
			return <Link href="#">{fieldContent}</Link>
		case 'color':
			return (<span data-selection-disabled={true} className={mergeStyles({color: fieldContent, height: '100%', display: 'block'})}>
          {fieldContent}
        </span>)
		default:
			return <span>{fieldContent}</span>
	}
}

function _copyAndSort (items, columnKey, isSortedDescending) {
	const key = columnKey
	return items.slice(0).sort((a, b) => ((isSortedDescending ? a[key] < b[key] : a[key] > b[key]) ? 1 : -1))
}

export default CustomColList