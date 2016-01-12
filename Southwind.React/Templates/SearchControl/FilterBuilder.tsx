﻿
import * as React from 'react'
import { Modal, ModalProps, ModalClass, ButtonToolbar } from 'react-bootstrap'
import * as Finder from 'Framework/Signum.React/Scripts/Finder'
import { openModal, IModalProps } from 'Framework/Signum.React/Scripts/Modals';
import { FilterOperation, FilterOption, QueryDescription, QueryToken, SubTokensOptions, filterOperations, FilterType } from 'Framework/Signum.React/Scripts/FindOptions'
import { SearchMessage, JavascriptMessage, Lite, Entity, DynamicQuery } from 'Framework/Signum.React/Scripts/Signum.Entities'
import { ValueLine, EntityLine, EntityCombo } from 'Framework/Signum.React/Scripts/Lines'
import { Binding, IsByAll, getTypeInfos } from 'Framework/Signum.React/Scripts/Reflection'
import { TypeContext, FormGroupStyle } from 'Framework/Signum.React/Scripts/TypeContext'
import QueryTokenBuilder from 'Templates/SearchControl/QueryTokenBuilder'


interface FilterBuilderProps extends React.Props<FilterBuilder> {
    filterOptions: FilterOption[];
    subTokensOptions: SubTokensOptions;
    queryDescription: QueryDescription;
}

export default class FilterBuilder extends React.Component<FilterBuilderProps, { token: QueryTokenBuilder }>  {

    handlerNewFilter = () => {
        this.props.filterOptions.push({
            token: null,
            columnName: null,
            operation: null,
            value: null,
        });
        this.forceUpdate();
    };

    handlerDeleteFilter = (filter: FilterOption) => {
        this.props.filterOptions.remove(filter);
        this.forceUpdate();
    };

    render() {


        return (<div className="panel panel-default sf-filters form-xs">
            <div className="panel-body sf-filters-list table-responsive" style={{ overflowX: "visible" }}>
                { <table className="table">
                        <thead>
                            <tr>
                                <th></th>
                                <th className="sf-filter-field-header">{ SearchMessage.Field.niceToString() }</th>
                                <th>{ SearchMessage.Operation.niceToString() }</th>
                                <th>{ SearchMessage.Value.niceToString() }</th>
                                </tr>
                            </thead>
                        <tbody>
                                 {this.props.filterOptions.map((f, i)=> <FilterComponent filter={f} key={i}
                                     onDeleteFilter={this.handlerDeleteFilter}
                                     subTokenOptions={this.props.subTokensOptions}
                                     queryDescription={this.props.queryDescription}/>) }
                                        <tr >
                                            <td colSpan={4}>
                                                <a title={SearchMessage.AddFilter.niceToString() }
                                                className="sf-line-button sf-create"
                                                onClick={this.handlerNewFilter}>
                                                <span className="glyphicon glyphicon-plus"/> {SearchMessage.AddFilter.niceToString() }
                                                </a>
                                            </td>
                                        </tr>
                            </tbody>
                    </table>
                }
                </div>

            </div>);
    }
}


export interface FilterComponentProps extends React.Props<FilterComponent> {
    filter: FilterOption;
    onDeleteFilter: (fo: FilterOption) => void;
    queryDescription: QueryDescription;
    subTokenOptions: SubTokensOptions;
}

export class FilterComponent extends React.Component<FilterComponentProps, {}>{

    handleDeleteFilter = () => {
        this.props.onDeleteFilter(this.props.filter);
    }

    handleTokenChanged = (newToken: QueryToken) => {

        var f = this.props.filter;
        if (newToken.filterType != f.token.filterType) {
            f.operation = filterOperations[f.token.filterType].first();
            f.value = null;
        }

        this.props.filter.token = newToken;

        this.forceUpdate();
    }

    render() {
        var f = this.props.filter;

        return <tr>
            <td>
                {!f.frozen &&
                <a title={SearchMessage.DeleteFilter.niceToString() }
                    className="sf-line-button sf-remove"
                    onClick={this.handleDeleteFilter}>
                    <span className="glyphicon glyphicon-remove"/>
                    </a>}
                </td>
            <td>
                <QueryTokenBuilder
                    queryToken={f.token}
                    onTokenChange={this.handleTokenChanged}
                    queryKey={ this.props.queryDescription.queryKey }
                    subTokenOptions={this.props.subTokenOptions}
                    readOnly={f.frozen}/></td>
            <td>
                {f.token &&
                <select className="form-control" value={f.operation as any} disabled={f.frozen}>
                    { filterOperations[f.token.filterType]
                        .map(ft=> <option value={ft as any}>{ DynamicQuery.FilterOperation_Type.niceName(ft) }</option>) }
                    </select> }
                </td>

             <td>
                 {f.token && this.renderValue() }
                 </td>
            </tr>
    }

    renderValue() {
        var f = this.props.filter;

        var ctx = new TypeContext<any>(null, { formGroupStyle: FormGroupStyle.None, readOnly: f.frozen }, null, new Binding<any>("value", f));

        switch (f.token.filterType) {
            case FilterType.Lite:
                if (f.token.type.name == IsByAll || getTypeInfos(f.token.type).some(ti=> !ti.isLowPopupation))
                    return <EntityLine ctx={ctx} type={f.token.type} create={false} />;
                else
                    return <EntityCombo ctx={ctx} type={f.token.type} create={false}/>
            case FilterType.Embedded:
                return <EntityLine ctx={ctx} type={f.token.type} create={false} autoComplete={false} />;
            case FilterType.Enum:
                var members = Dic.getValues(getTypeInfos(f.token.type).single().members).filter(a=> !a.isReadOnly);
                return <ValueLine ctx={ctx} type={f.token.type} formatText={f.token.format} unitText={f.token.unit} comboBoxItems={members}/>;
            default:
                return <ValueLine ctx={ctx} type={f.token.type} formatText={f.token.format} unitText={f.token.unit}/>;
        }
    }
}



