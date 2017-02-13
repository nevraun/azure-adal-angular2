import { Injectable } from '@angular/core';
import {
  Http,
  RequestOptionsArgs,
  RequestMethod,
  RequestOptions,
  URLSearchParams,
  Headers,
  Response
} from "@angular/http";

import { AdalService } from "./adal.service";
import { Observable } from "rxjs";

@Injectable()
export class AdalHttpService {

  /**
   * Service constructor
   *
   * @param http
   * @param adal
   */
  constructor(private http: Http, private adalService: AdalService) { }

  /**
   * Function calls GET request
   *
   * @param uri
   * @param options
   *
   * @returns {Observable<any>}
   */
  get(uri: string, options?: RequestOptionsArgs): Observable<any> {
    return this._call(uri, Object.assign(new RequestOptions({ method: RequestMethod.Get }), options));
  }

  /**
   * Function calls POST request
   * @param uri
   * @param body
   * @param options
   *
   * @returns {Observable<any>}
   */
  post(uri: string, body: any, options?: RequestOptionsArgs): Observable<any> {
    return this._call(uri, Object.assign(new RequestOptions({ method: RequestMethod.Post, body: body }), options));
  }

  /**
   * Function calls DELETE request
   *
   * @param uri
   * @param options
   *
   * @returns {Observable<any>}
   */
  delete(uri: string, options?: RequestOptionsArgs): Observable<any> {
    return this._call(uri, Object.assign(new RequestOptions({ method: RequestMethod.Delete }), options));
  }

  /**
   * Function calls PATCH request
   *
   * @param uri
   * @param body
   * @param options
   *
   * @returns {Observable<any>}
   */
  patch(uri: string, body: any, options?: RequestOptionsArgs): Observable<any> {
    return this._call(uri, Object.assign(new RequestOptions({ method: RequestMethod.Patch, body: body }), options));
  }

  /**
   * Function calls PUT request
   *
   * @param uri
   * @param body
   * @param options
   *
   * @returns {Observable<any>}
   */
  put(uri: string, body: any, options?: RequestOptionsArgs): Observable<any> {
    return this._call(uri, Object.assign(new RequestOptions({ method: RequestMethod.Put, body: body }), options));
  }

  /**
   * Function calls HEAD request
   *
   * @param uri
   * @param options
   *
   * @returns {Observable<any>}
   */
  head(uri: string, options?: RequestOptionsArgs): Observable<any> {
    return this._call(uri, Object.assign(new RequestOptions({ method: RequestMethod.Head }), options));
  }

  /**
   * Function calls appropriate http methods
   *
   * @param uri
   * @param options
   *
   * @private
   */
  private _call(uri: string, options: RequestOptionsArgs): Observable<any> {
    // build request options
    let requestOptions: RequestOptions = new RequestOptions({ method: options.method });

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
    const resource = this.adalService.getResourceForEndpoint(uri);

    // check if we have an adal resource
    if (resource) {
      // check if we are authenicated
      if (this.adalService.userInfo.isAuthenticated) {
        return this.adalService.acquireToken(resource).flatMap((token: string) => {
          // check if we have already some headers
          if (requestOptions.headers === null) {
            requestOptions.headers = new Headers();
          }

          // add authentication token in headers
          requestOptions.headers.append('Authorization', 'Bearer ' + token);

          return this.http.request(uri, requestOptions).map(this._extractData).catch(this._handleError);
        });
      }
      else {
        return Observable.throw(new Error("User Not Authenticated."));
      }
    }
    else {
      return this.http.request(uri, requestOptions).map(this._extractData).catch(this._handleError);
    }
  }

  /**
   * Function to parse response data
   *
   * @param res
   *
   * @returns {{}}
   *
   * @private
   */
  private _extractData(res: Response): any {
    // check status
    if (res.status < 200 || res.status >= 300) {
      throw new Error('Bad response status: ' + res.status);
    }

    let body = {};

    //if there is some content, parse it
    if (res.status != 204) {
      body = res.json();
    }

    return body;
  }

  /**
   *
   * @param error
   * @returns {ErrorObservable}
   * @private
   */
  private _handleError(error: any): Observable<any> {
    // In a real world app, we might send the error to remote logging infrastructure
    let errMsg = error.message || 'Server error';
    console.error(JSON.stringify(error)); // log to console instead

    return Observable.throw(error);
  }
}
