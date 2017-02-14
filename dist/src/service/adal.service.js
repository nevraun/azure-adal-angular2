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
import { Observable, Subject } from "rxjs";
var AdalService = (function () {
    /**
     * Service constructor
     */
    function AdalService() {
        this.contextFn = AuthenticationContext;
        this.oauth = {
            isAuthenticated: false,
            userName: '',
            loginError: '',
            profile: {}
        };
        this.user$ = new Subject();
    }
    /**
     * Function to init adal context
     *
     * @param configOptions
     */
    AdalService.prototype.init = function (config) {
        if (!config) {
            throw new Error('You must set config, when calling init.');
        }
        // redirect and logout_redirect are set to current location by default
        var _a = window.location, hash = _a.hash, href = _a.href;
        if (hash) {
            href = href.replace(hash, '');
        }
        config.redirectUri = config.redirectUri || href;
        config.postLogoutRedirectUri = config.postLogoutRedirectUri || href;
        // create instance with given config
        this.context = new this.contextFn(config);
        // loginresource is used to set authenticated status
        this._updateDataFromCache(this.config.loginResource);
    };
    Object.defineProperty(AdalService.prototype, "config", {
        /**
         * Returns adal context config
         *
         * @returns {Config}
         */
        get: function () {
            return this.context.config;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AdalService.prototype, "userInfo", {
        /**
         * Returns user info
         *
         * @returns {OAuth}
         */
        get: function () {
            return this.oauth;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AdalService.prototype, "userInfo$", {
        /**
         * Returns user info subject as observable
         *
         * @returns {Observable<any>}
         */
        get: function () {
            return this.user$.asObservable();
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Function to login
     */
    AdalService.prototype.login = function () {
        this.context.login();
    };
    /**
     * Returns login in progress flag
     *
     * @returns {boolean}
     */
    AdalService.prototype.loginInProgress = function () {
        return this.context.loginInProgress();
    };
    /**
     * Function to logout
     */
    AdalService.prototype.logout = function () {
        this.context.logOut();
    };
    /**
     * Function to handle window callback
     */
    AdalService.prototype.handleWindowCallback = function () {
        var hash = window.location.hash;
        if (this.isCallback(hash)) {
            var requestInfo = this.context.getRequestInfo(hash);
            this.context.saveTokenFromHash(requestInfo);
            if ((requestInfo.requestType === this.context.REQUEST_TYPE.RENEW_TOKEN) && window.parent && (window.parent !== window)) {
                // iframe call but same single page
                var callback = window.parent.callBackMappedToRenewStates[requestInfo.stateResponse];
                if (callback) {
                    var description = this.context._getItem(this.context.CONSTANTS.STORAGE.ERROR_DESCRIPTION);
                    var token = requestInfo.parameters[this.context.CONSTANTS.ACCESS_TOKEN] || requestInfo.parameters[this.context.CONSTANTS.ID_TOKEN];
                    var error = this.context._getItem(this.context.CONSTANTS.STORAGE.ERROR);
                    callback(description, token, error);
                }
            }
            else if (requestInfo.requestType === this.context.REQUEST_TYPE.LOGIN) {
                this._updateDataFromCache(this.config.loginResource);
                this.user$.next();
            }
        }
    };
    /**
     * Returns cached token for current resource
     *
     * @param resource
     *
     * @returns {string}
     */
    AdalService.prototype.getCachedToken = function (resource) {
        return this.context.getCachedToken(resource);
    };
    /**
     * Function to acquire token for given resource
     *
     * @param resource
     *
     * @returns {any}
     */
    AdalService.prototype.acquireToken = function (resource) {
        var _this = this;
        return Observable.bindCallback(function (callback) {
            _this.context.acquireToken(resource, function (error, tokenOut) {
                if (error) {
                    _this.context.error('Error when acquiring token for resource: ' + resource, error);
                    callback(null);
                }
                else {
                    callback(tokenOut);
                }
            });
        })();
    };
    /**
     * Function to get user profile
     *
     * @returns {any}
     */
    AdalService.prototype.getUser = function () {
        var _this = this;
        return Observable.bindCallback(function (callback) {
            _this.context.getUser(function (error, user) {
                if (error) {
                    _this.context.error('Error when getting user', error);
                    callback(null);
                }
                else {
                    callback(user);
                }
            });
        })();
    };
    /**
     * Function to clear cache
     */
    AdalService.prototype.clearCache = function () {
        this.context.clearCache();
    };
    /**
     * Function to clear cache for given resource
     */
    AdalService.prototype.clearCacheForResource = function (resource) {
        this.context.clearCacheForResource(resource);
    };
    /**
     * Returns resource for current endpoint
     *
     * @param url
     *
     * @returns {string}
     */
    AdalService.prototype.getResourceForEndpoint = function (url) {
        return this.context.getResourceForEndpoint(url);
    };
    /**
     * Function to know if we are in callback
     *
     * @param hash
     *
     * @returns {boolean}
     */
    AdalService.prototype.isCallback = function (hash) {
        return this.context.isCallback(hash || window.location.hash);
    };
    /**
     *
     * @param resource
     * @private
     */
    AdalService.prototype._updateDataFromCache = function (resource) {
        var token = this.context.getCachedToken(resource);
        this.oauth.isAuthenticated = token !== null && token.length > 0;
        var user = this.context.getCachedUser();
        if (user) {
            this.oauth.userName = user.userName;
            this.oauth.profile = user.profile;
            this.oauth.loginError = this.context.getLoginError();
        }
        else {
            this.oauth.userName = '';
            this.oauth.profile = {};
            this.oauth.loginError = '';
        }
    };
    ;
    return AdalService;
}());
AdalService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [])
], AdalService);
export { AdalService };
//# sourceMappingURL=C:/Development/public/wolters-kluwer/azure-adal-angular2/src/service/adal.service.js.map