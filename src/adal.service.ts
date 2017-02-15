import { Injectable } from '@angular/core';
import { Observable, Subject } from "rxjs";

import 'expose-loader?AuthenticationContext!adal-angular/lib/adal.js';

import { OAuth } from "./oauth.model";

declare const window: any;

@Injectable()
export class AdalService {

  private context: any;
  private contextFn: adal.AuthenticationContextStatic = AuthenticationContext;
  private oauth: OAuth;
  private user$: Subject<any>;

  /**
   * Service constructor
   */
  constructor() {
    this.oauth = {
      isAuthenticated: false,
      userName: '',
      loginError: '',
      profile: {}
    };
    this.user$ = <Subject<any>> new Subject();
  }

  /**
   * Function to init adal context
   *
   * @param configOptions
   */
  init(config: adal.Config) {
    if (!config) {
      throw new Error('You must set config, when calling init.');
    }

    // redirect and logout_redirect are set to current location by default
    let { hash, href } = window.location;

    if (hash) {
      href = href.replace(hash, '');
    }

    config.redirectUri = config.redirectUri || href;
    config.postLogoutRedirectUri = config.postLogoutRedirectUri || href;

    // create instance with given config
    this.context = new this.contextFn(config);

    // loginresource is used to set authenticated status
    this._updateDataFromCache(this.config.loginResource);
  }

  /**
   * Returns adal context config
   *
   * @returns {adal.Config}
   */
  get config(): adal.Config {
    return this.context.config;
  }

  /**
   * Returns user info
   *
   * @returns {OAuth}
   */
  get userInfo(): OAuth {
    return this.oauth;
  }

  /**
   * Returns user info subject as observable
   *
   * @returns {Observable<any>}
   */
  get userInfo$(): Observable<any> {
    return this.user$.asObservable();
  }

  /**
   * Function to login
   */
  login(): void {
    this.context.login();
  }

  /**
   * Returns login in progress flag
   *
   * @returns {boolean}
   */
  loginInProgress(): boolean {
    return this.context.loginInProgress();
  }

  /**
   * Function to logout
   */
  logout(): void {
    this.context.logOut();
  }

  /**
   * Function to handle window callback
   */
  handleWindowCallback(): void {
    const { hash } = window.location;

    if (this.isCallback(hash)) {

      const requestInfo = this.context.getRequestInfo(hash);

      this.context.saveTokenFromHash(requestInfo);

      if ((requestInfo.requestType === this.context.REQUEST_TYPE.RENEW_TOKEN) && window.parent && (window.parent !== window)) {
        // iframe call but same single page
        const callback = window.parent.callBackMappedToRenewStates[requestInfo.stateResponse];

        if (callback) {

          const description = this.context._getItem(this.context.CONSTANTS.STORAGE.ERROR_DESCRIPTION);
          const token = requestInfo.parameters[this.context.CONSTANTS.ACCESS_TOKEN] || requestInfo.parameters[this.context.CONSTANTS.ID_TOKEN];
          const error = this.context._getItem(this.context.CONSTANTS.STORAGE.ERROR)

          callback(description, token, error);
        }

      } else if (requestInfo.requestType === this.context.REQUEST_TYPE.LOGIN) {

        this._updateDataFromCache(this.config.loginResource);
        this.user$.next();
      }
    }
  }

  /**
   * Returns cached token for current resource
   *
   * @param resource
   *
   * @returns {string}
   */
  getCachedToken(resource: string): string {
    return this.context.getCachedToken(resource);
  }

  /**
   * Function to acquire token for given resource
   *
   * @param resource
   *
   * @returns {any}
   */
  acquireToken(resource: string): Observable<string> {
    return Observable.bindCallback((callback: (s: string) => void) => {
      this.context.acquireToken(resource, (error: string, tokenOut: string) => {
        if (error) {
          this.context.error('Error when acquiring token for resource: ' + resource, error);
          callback(null);
        } else {
          callback(tokenOut);
        }
      });
    })();
  }

  /**
   * Function to get user profile
   *
   * @returns {any}
   */
  getUser(): Observable<adal.User> {
    return Observable.bindCallback((callback: (u: adal.User) => void) => {
      this.context.getUser((error: string, user: adal.User) => {
        if (error) {
          this.context.error('Error when getting user', error);
          callback(null);
        } else {
          callback(user);
        }
      });
    })();
  }

  /**
   * Function to clear cache
   */
  clearCache(): void {
    this.context.clearCache();
  }

  /**
   * Function to clear cache for given resource
   */
  clearCacheForResource(resource: string): void {
    this.context.clearCacheForResource(resource);
  }

  /**
   * Returns resource for current endpoint
   *
   * @param url
   *
   * @returns {string}
   */
  getResourceForEndpoint(url: string): string {
    return this.context.getResourceForEndpoint(url);
  }

  /**
   * Function to know if we are in callback
   *
   * @param hash
   *
   * @returns {boolean}
   */
  isCallback(hash?: string): boolean {
    return this.context.isCallback(hash || window.location.hash);
  }

  /**
   *
   * @param resource
   * @private
   */
  private _updateDataFromCache(resource: string): void {

    const token = this.context.getCachedToken(resource);

    this.oauth.isAuthenticated = token !== null && token.length > 0;

    const user = this.context.getCachedUser();

    if (user) {
      this.oauth.userName = user.userName;
      this.oauth.profile = user.profile;
      this.oauth.loginError = this.context.getLoginError();
    } else {
      this.oauth.userName = '';
      this.oauth.profile = {};
      this.oauth.loginError = '';
    }
  };
}
