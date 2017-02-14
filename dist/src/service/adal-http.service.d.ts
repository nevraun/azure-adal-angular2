import { Http, RequestOptionsArgs } from "@angular/http";
import { AdalService } from "./adal.service";
import { Observable } from "rxjs";
export declare class AdalHttpService {
    private http;
    private adalService;
    /**
     * Service constructor
     *
     * @param http
     * @param adal
     */
    constructor(http: Http, adalService: AdalService);
    /**
     * Function calls GET request
     *
     * @param uri
     * @param options
     *
     * @returns {Observable<any>}
     */
    get(uri: string, options?: RequestOptionsArgs): Observable<any>;
    /**
     * Function calls POST request
     * @param uri
     * @param body
     * @param options
     *
     * @returns {Observable<any>}
     */
    post(uri: string, body: any, options?: RequestOptionsArgs): Observable<any>;
    /**
     * Function calls DELETE request
     *
     * @param uri
     * @param options
     *
     * @returns {Observable<any>}
     */
    delete(uri: string, options?: RequestOptionsArgs): Observable<any>;
    /**
     * Function calls PATCH request
     *
     * @param uri
     * @param body
     * @param options
     *
     * @returns {Observable<any>}
     */
    patch(uri: string, body: any, options?: RequestOptionsArgs): Observable<any>;
    /**
     * Function calls PUT request
     *
     * @param uri
     * @param body
     * @param options
     *
     * @returns {Observable<any>}
     */
    put(uri: string, body: any, options?: RequestOptionsArgs): Observable<any>;
    /**
     * Function calls HEAD request
     *
     * @param uri
     * @param options
     *
     * @returns {Observable<any>}
     */
    head(uri: string, options?: RequestOptionsArgs): Observable<any>;
    /**
     * Function calls appropriate http methods
     *
     * @param uri
     * @param options
     *
     * @private
     */
    private _call(uri, options);
    /**
     * Function to parse response data
     *
     * @param res
     *
     * @returns {{}}
     *
     * @private
     */
    private _extractData(res);
    /**
     *
     * @param error
     * @returns {ErrorObservable}
     * @private
     */
    private _handleError(error);
}
