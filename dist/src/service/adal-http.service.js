var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable } from '@angular/core';
import { Http, RequestMethod, RequestOptions, URLSearchParams, Headers } from "@angular/http";
import { AdalService } from "./adal.service";
import { Observable } from "rxjs";
var AdalHttpService = (function () {
    /**
     * Service constructor
     *
     * @param http
     * @param adal
     */
    function AdalHttpService(http, adalService) {
        this.http = http;
        this.adalService = adalService;
    }
    /**
     * Function calls GET request
     *
     * @param uri
     * @param options
     *
     * @returns {Observable<any>}
     */
    AdalHttpService.prototype.get = function (uri, options) {
        return this._call(uri, Object.assign(new RequestOptions({ method: RequestMethod.Get }), options));
    };
    /**
     * Function calls POST request
     * @param uri
     * @param body
     * @param options
     *
     * @returns {Observable<any>}
     */
    AdalHttpService.prototype.post = function (uri, body, options) {
        return this._call(uri, Object.assign(new RequestOptions({ method: RequestMethod.Post, body: body }), options));
    };
    /**
     * Function calls DELETE request
     *
     * @param uri
     * @param options
     *
     * @returns {Observable<any>}
     */
    AdalHttpService.prototype.delete = function (uri, options) {
        return this._call(uri, Object.assign(new RequestOptions({ method: RequestMethod.Delete }), options));
    };
    /**
     * Function calls PATCH request
     *
     * @param uri
     * @param body
     * @param options
     *
     * @returns {Observable<any>}
     */
    AdalHttpService.prototype.patch = function (uri, body, options) {
        return this._call(uri, Object.assign(new RequestOptions({ method: RequestMethod.Patch, body: body }), options));
    };
    /**
     * Function calls PUT request
     *
     * @param uri
     * @param body
     * @param options
     *
     * @returns {Observable<any>}
     */
    AdalHttpService.prototype.put = function (uri, body, options) {
        return this._call(uri, Object.assign(new RequestOptions({ method: RequestMethod.Put, body: body }), options));
    };
    /**
     * Function calls HEAD request
     *
     * @param uri
     * @param options
     *
     * @returns {Observable<any>}
     */
    AdalHttpService.prototype.head = function (uri, options) {
        return this._call(uri, Object.assign(new RequestOptions({ method: RequestMethod.Head }), options));
    };
    /**
     * Function calls appropriate http methods
     *
     * @param uri
     * @param options
     *
     * @private
     */
    AdalHttpService.prototype._call = function (uri, options) {
        var _this = this;
        // build request options
        var requestOptions = new RequestOptions({ method: options.method });
        if (options.search != null) {
            requestOptions.search = new URLSearchParams(options.search.toString());
        }
        if (options.headers != null) {
            requestOptions.headers = new Headers(options.headers.toJSON());
        }
        if (options.body != null) {
            requestOptions.body = options.body;
        }
        // get adal resource for this endpoint
        var resource = this.adalService.getResourceForEndpoint(uri);
        // check if we have an adal resource
        if (resource) {
            // check if we are authenicated
            if (this.adalService.userInfo.isAuthenticated) {
                return this.adalService.acquireToken(resource).flatMap(function (token) {
                    // check if we have already some headers
                    if (requestOptions.headers === null) {
                        requestOptions.headers = new Headers();
                    }
                    // add authentication token in headers
                    requestOptions.headers.append('Authorization', 'Bearer ' + token);
                    return _this.http.request(uri, requestOptions).map(_this._extractData).catch(_this._handleError);
                });
            }
            else {
                return Observable.throw(new Error("User Not Authenticated."));
            }
        }
        else {
            return this.http.request(uri, requestOptions).map(this._extractData).catch(this._handleError);
        }
    };
    /**
     * Function to parse response data
     *
     * @param res
     *
     * @returns {{}}
     *
     * @private
     */
    AdalHttpService.prototype._extractData = function (res) {
        // check status
        if (res.status < 200 || res.status >= 300) {
            throw new Error('Bad response status: ' + res.status);
        }
        var body = {};
        //if there is some content, parse it
        if (res.status != 204) {
            body = res.json();
        }
        return body;
    };
    /**
     *
     * @param error
     * @returns {ErrorObservable}
     * @private
     */
    AdalHttpService.prototype._handleError = function (error) {
        // In a real world app, we might send the error to remote logging infrastructure
        var errMsg = error.message || 'Server error';
        console.error(JSON.stringify(error)); // log to console instead
        return Observable.throw(error);
    };
    return AdalHttpService;
}());
AdalHttpService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof Http !== "undefined" && Http) === "function" && _a || Object, AdalService])
], AdalHttpService);
export { AdalHttpService };
var _a;
//# sourceMappingURL=C:/Development/public/wolters-kluwer/azure-adal-angular2/src/service/adal-http.service.js.map