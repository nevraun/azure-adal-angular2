import { Observable } from "rxjs";
import { Config, OAuth, User } from "../model";
export declare class AdalService {
    private context;
    private contextFn;
    private oauth;
    private user$;
    /**
     * Service constructor
     */
    constructor();
    /**
     * Function to init adal context
     *
     * @param configOptions
     */
    init(config: Config): void;
    /**
     * Returns adal context config
     *
     * @returns {Config}
     */
    readonly config: Config;
    /**
     * Returns user info
     *
     * @returns {OAuth}
     */
    readonly userInfo: OAuth;
    /**
     * Returns user info subject as observable
     *
     * @returns {Observable<any>}
     */
    readonly userInfo$: Observable<any>;
    /**
     * Function to login
     */
    login(): void;
    /**
     * Returns login in progress flag
     *
     * @returns {boolean}
     */
    loginInProgress(): boolean;
    /**
     * Function to logout
     */
    logout(): void;
    /**
     * Function to handle window callback
     */
    handleWindowCallback(): void;
    /**
     * Returns cached token for current resource
     *
     * @param resource
     *
     * @returns {string}
     */
    getCachedToken(resource: string): string;
    /**
     * Function to acquire token for given resource
     *
     * @param resource
     *
     * @returns {any}
     */
    acquireToken(resource: string): Observable<string>;
    /**
     * Function to get user profile
     *
     * @returns {any}
     */
    getUser(): Observable<User>;
    /**
     * Function to clear cache
     */
    clearCache(): void;
    /**
     * Function to clear cache for given resource
     */
    clearCacheForResource(resource: string): void;
    /**
     * Returns resource for current endpoint
     *
     * @param url
     *
     * @returns {string}
     */
    getResourceForEndpoint(url: string): string;
    /**
     * Function to know if we are in callback
     *
     * @param hash
     *
     * @returns {boolean}
     */
    isCallback(hash?: string): boolean;
    /**
     *
     * @param resource
     * @private
     */
    private _updateDataFromCache(resource);
}
