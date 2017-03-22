import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/bindCallback';

import 'expose-loader?AuthenticationContext!adal-angular/lib/adal.js';

declare const window: any;

@Injectable()
export class AdalService {

  private context: any;
  private contextFn: adal.AuthenticationContextStatic = AuthenticationContext;
  private token: string;
  private user: adal.User;
  private user$: Subject<any>;

  /**
   * Service constructor
   */
  constructor() {
    this.user$ = <Subject<any>> new Subject();
  }

  /**
   * Function to init adal context
   *
   * @param configOptions
   */
  init(config: adal.Config, production: boolean = true) {

    if (!production) {
      window.Logging.level = 3;
      window.Logging.log = window.console.log;
    }

    if (!config) {
      throw new Error('You must set config, when calling init.');
    }

    // redirect and logout_redirect are set to current location by default
    const { hash } = window.location;
    let { href } = window.location;

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
   * Returns user
   *
   * @returns {adal.User}
   */
  getUser(): adal.User {
    return this.user;
  }

  /**
   * Returns token
   *
   * @returns {string}
   */
  getToken(): string {
    return this.token;
  }

  /**
   * Returns the authentication status
   *
   * @returns {boolean}
   */
  isAuthenticated(): boolean {
    return (!!this.user) ? true : false;
  }

  /**
   * Returns user info subject as observable
   *
   * @returns {Observable<adal.User>}
   */
  get userSubscription$(): Observable<adal.User> {
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

      const info = this.context.getRequestInfo(hash);

      this.context.saveTokenFromHash(info);

      if ((info.requestType === this.context.REQUEST_TYPE.RENEW_TOKEN) && window.parent && (window.parent !== window)) {
        // iframe call but same single page
        const callback = window.parent.callBackMappedToRenewStates[info.stateResponse];

        if (callback) {

          const description = this.context._getItem(this.context.CONSTANTS.STORAGE.ERROR_DESCRIPTION);
          const token = info.parameters[this.context.CONSTANTS.ACCESS_TOKEN] || info.parameters[this.context.CONSTANTS.ID_TOKEN];
          const error = this.context._getItem(this.context.CONSTANTS.STORAGE.ERROR);

          callback(description, token, error);
        }

      } else if (info.requestType === this.context.REQUEST_TYPE.LOGIN) {

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
   * Returns cached user
   *
   * @returns {adal.User}
   */
  getCachedUser(): adal.User {
    return this.context.getCachedUser();
  }

  /**
   * Function to acquire token for given resource
   *
   * @param resource
   *
   * @returns {any}
   */
  acquireToken(resource: string): Observable<string> {
    return Observable.bindCallback((callback: (s: string) => string) => {
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
    this.token = this.getCachedToken(resource);
    this.user = this.getCachedUser();
  };
}
