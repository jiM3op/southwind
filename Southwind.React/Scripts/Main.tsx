﻿require("!style!css!less!../node_modules/bootstrap/less/bootstrap.less");

import * as React from "react"
import { render, unmountComponentAtNode } from "react-dom"
import { Router, Route, Redirect, IndexRoute, useRouterHistory } from "react-router"

import * as moment from "moment"

import { requestTypes, setTypes} from "../../Framework/Signum.React/Scripts/Reflection"
import * as Navigator from "../../Framework/Signum.React/Scripts/Navigator"
import * as Operations from "../../Framework/Signum.React/Scripts/Operations"
import * as Finder from "../../Framework/Signum.React/Scripts/Finder"
import * as Services from "../../Framework/Signum.React/Scripts/Services"
import * as QuickLinks from "../../Framework/Signum.React/Scripts/QuickLinks"
import * as SouthwindClient from "./Southwind/SouthwindClient"
import Notify from "../../Framework/Signum.React/Scripts/Frames/Notify"
import ErrorModal from "../../Framework/Signum.React/Scripts/Modals/ErrorModal"

import * as ExceptionClient from "../../Framework/Signum.React/Scripts/Exceptions/ExceptionClient"
import * as AuthClient from "../../Extensions/Signum.React.Extensions/Authorization/AuthClient"
import * as UserQueryClient from "../../Extensions/Signum.React.Extensions/UserQueries/UserQueryClient"
import * as OmniboxClient from "../../Extensions/Signum.React.Extensions/Omnibox/OmniboxClient"
import * as ChartClient from "../../Extensions/Signum.React.Extensions/Chart/ChartClient"
import DynamicQueryOmniboxProvider from "../../Extensions/Signum.React.Extensions/Omnibox/DynamicQueryOmniboxProvider"
import EntityOmniboxProvider from "../../Extensions/Signum.React.Extensions/Omnibox/EntityOmniboxProvider"

import * as History from 'history'

import Index from './Index'
import PublicCatalog from './PublicCatalog'
import Home from './Home'
import NotFound from './NotFound'

import * as ConfigureReactWidgets from "../../Framework/Signum.React/Scripts/ConfigureReactWidgets"

require("../Content/site.css");

declare var __webpack_public_path__;

__webpack_public_path__ = window["__baseUrl"] + "/dist/";



ConfigureReactWidgets.asumeGlobalUtcMode(moment, false);
ConfigureReactWidgets.configure();


function fixBaseName<T>(baseFunction: (location: string, ...args: any[]) => T, baseName: string): (location: string) => T{

    return (location, ...args) => {
        if (location && location.startsWith(baseName))
            location = location.after(baseName);

        return baseFunction(location, ...args);
    };
}


function reload() {

    Services.notifyPendingRequests = pending => {
        if (Notify.singletone)
            Notify.singletone.notifyPendingRequest(pending);
    }

    window.onerror = (message: string, filename?: string, lineno?: number, colno?: number, error?: Error) => ErrorModal.showError(error);

    requestTypes().then(types => {
        setTypes(types);

        return AuthClient.Api.retrieveCurrentUser();
    }).then(user => {

        AuthClient.setCurrentUser(user);

        const isFull = !!AuthClient.currentUser();

        var routes: JSX.Element[] = [];

        routes.push(<IndexRoute component={PublicCatalog} />);
        routes.push(<Route path="home" component={Home} />);
        routes.push(<Route path="publicCatalog" component={PublicCatalog} />);
        AuthClient.startPublic({ routes, userTicket: true, resetPassword: true });

        if (isFull) {
            Operations.start();
            Navigator.start({ routes });
            Finder.start({ routes });
            QuickLinks.start();

            ExceptionClient.start({ routes });

            AuthClient.startAdmin();
            UserQueryClient.start({ routes });
            SouthwindClient.start({ routes });

            ChartClient.start({ routes });

            OmniboxClient.start(
                new DynamicQueryOmniboxProvider(),
                new EntityOmniboxProvider());
        }

        routes.push(<Route path="*" component={NotFound}/>);

        var baseName = window["__baseUrl"]

        var history = useRouterHistory(History.createHistory)({
            basename: baseName,
        });


        history.push = fixBaseName(history.push, baseName);
        history.replace = fixBaseName(history.replace, baseName);
        history.createHref = fixBaseName(history.createHref, baseName);
        history.createPath = fixBaseName(history.createPath, baseName);
        //history.createLocation = fixBaseName(history.createHref, baseName) as any;


        Navigator.currentHistory = history;

        var mainRoute = React.createElement(Route as any, { component: Index }, ...routes);

        var wrap = document.getElementById("wrap");
        unmountComponentAtNode(wrap);
        render(
            <Router history={history}>
                <Route component={Index} path="/" > { routes }</Route>
            </Router>, wrap);
    }).done();

}

AuthClient.onLogin = () => {

    reload();
    Navigator.currentHistory.push("/home");
};

reload();


