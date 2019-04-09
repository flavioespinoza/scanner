import * as React from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { DetailsList, DetailsListLayoutMode, Selection, ConstrainMode, DetailsRow } from 'office-ui-fabric-react/lib/DetailsList';
import { TooltipHost } from 'office-ui-fabric-react/lib/Tooltip';
import { ScrollablePane, ScrollbarVisibility } from 'office-ui-fabric-react/lib/ScrollablePane';
import { Sticky, StickyPositionType } from 'office-ui-fabric-react/lib/Sticky';
import { MarqueeSelection } from 'office-ui-fabric-react/lib/MarqueeSelection';
import { lorem } from 'office-ui-fabric-react/lib/utilities/exampleData';
import { SelectionMode } from 'office-ui-fabric-react/lib/utilities/selection/index';
const _columns = [
    {
        key: 'column1',
        name: 'Test 1',
        fieldName: 'test1',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        ariaLabel: 'Operations for name'
    },
    {
        key: 'column2',
        name: 'Test 2',
        fieldName: 'test2',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        ariaLabel: 'Operations for value'
    },
    {
        key: 'column3',
        name: 'Test 3',
        fieldName: 'test3',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        ariaLabel: 'Operations for value'
    },
    {
        key: 'column4',
        name: 'Test 4',
        fieldName: 'test4',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        ariaLabel: 'Operations for value'
    },
    {
        key: 'column5',
        name: 'Test 5',
        fieldName: 'test5',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        ariaLabel: 'Operations for value'
    },
    {
        key: 'column6',
        name: 'Test 6',
        fieldName: 'test6',
        minWidth: 100,
        maxWidth: 200,
        isResizable: true,
        ariaLabel: 'Operations for value'
    }
];
export class ScrollablePaneDetailsListExample extends React.Component {
    constructor(props) {
        super(props);
        this._scrollablePane = React.createRef();
        const items = [];
        // Populate with items for demos.
        for (let i = 0; i < 200; i++) {
            items.push({
                key: i,
                test1: lorem(2),
                test2: lorem(2),
                test3: lorem(2),
                test4: lorem(2),
                test5: lorem(2),
                test6: lorem(2)
            });
        }
        this._items = items;
        this._selection = new Selection({
            onSelectionChanged: () => this.setState({ selectionDetails: this._getSelectionDetails() })
        });
        this.state = {
            items: items,
            selectionDetails: this._getSelectionDetails()
        };
    }
    render() {
        const { items, selectionDetails } = this.state;
        return (<div style={{
            height: '80vh',
            position: 'relative'
        }}>
                <ScrollablePane componentRef={this._scrollablePane} scrollbarVisibility={ScrollbarVisibility.auto}>
                    <Sticky stickyPosition={StickyPositionType.Header}>{selectionDetails}</Sticky>
                    <TextField label="Filter by name:" 
        // tslint:disable-next-line:jsx-no-lambda
        onChange={(ev, text) => this.setState({
            items: text ? this._items.filter((item) => hasText(item, text)) : this._items
        })}/>
                <Sticky stickyPosition={StickyPositionType.Header}>
                    <h1 style={{ margin: '0px' }}>Item List</h1>
                </Sticky>
                <MarqueeSelection selection={this._selection}>
                    <DetailsList items={items} columns={_columns} setKey="set" layoutMode={DetailsListLayoutMode.fixedColumns} constrainMode={ConstrainMode.unconstrained} onRenderDetailsHeader={onRenderDetailsHeader} onRenderDetailsFooter={onRenderDetailsFooter} selection={this._selection} selectionPreservedOnEmptyClick={true} ariaLabelForSelectionColumn="Toggle selection" ariaLabelForSelectAllCheckbox="Toggle selection for all items" 
        // tslint:disable-next-line:jsx-no-lambda
        onItemInvoked={item => alert(`Item invoked: ${item.name}`)}/>
            </MarqueeSelection>
    </ScrollablePane>
    </div>);
    }
    _getSelectionDetails() {
        const selectionCount = this._selection.getSelectedCount();
        switch (selectionCount) {
            case 0:
                return 'No items selected';
            case 1:
                return '1 item selected: ' + this._selection.getSelection()[0].name;
            default:
                return `${selectionCount} items selected`;
        }
    }
}
function onRenderDetailsHeader(props, defaultRender) {
    return (<Sticky stickyPosition={StickyPositionType.Header} isScrollSynced={true}>
            {defaultRender(Object.assign({}, props, { onRenderColumnHeaderTooltip: (tooltipHostProps) => <TooltipHost {...tooltipHostProps}/> }))}
        </Sticky>);
}
function onRenderDetailsFooter(props, defaultRender) {
    return (<Sticky stickyPosition={StickyPositionType.Footer} isScrollSynced={true}>
            <div style={{ display: 'inline-block' }}>
                <DetailsRow columns={props.columns} item={{
        key: 'footer',
        test1: 'Total 1',
        test2: 'Total 2',
        test3: 'Total 3',
        test4: 'Total 4',
        test5: 'Total 5',
        test6: 'Total 6'
    }} itemIndex={-1} selection={props.selection} selectionMode={(props.selection && props.selection.mode) || SelectionMode.none} viewport={props.viewport}/>
            </div>
        </Sticky>);
}
function hasText(item, text) {
    return `${item.test1}|${item.test2}|${item.test3}|${item.test4}|${item.test5}|${item.test6}`.indexOf(text) > -1;
}
