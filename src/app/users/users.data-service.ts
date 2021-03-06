import * as ng from 'angular';

import {
  IAppConstantsService,
  IUtilitiesService,
} from '../app.module';
import {
  RequestWs,
  ResponseWs,
} from '../shared/shared.module';

import { User } from './users.model';

export interface IUsersService {
  getUsers(textFilter: string | undefined): ng.IPromise<ResponseWs<User[] | undefined>>;

  cancelOngoingRequests(): void;
}

export class UsersService implements IUsersService {
  public static $inject = ['$http', '$q', 'AppConstantsService', 'UtilitiesService'];

  // requests
  protected getUsersRequest: RequestWs<User[]>;

  constructor(protected http: ng.IHttpService,
              protected q: ng.IQService,
              protected appConstantsService: IAppConstantsService,
              protected utilitiesService: IUtilitiesService) {
    this.getUsersRequest = new RequestWs();
  }

  public getUsers(textFilter: string | undefined): ng.IPromise<ResponseWs<User[] | undefined>> {

    // reset request
    this.getUsersRequest.reset(this.utilitiesService);

    // configure new request
    this.getUsersRequest.canceler = this.q.defer();
    const config: ng.IRequestShortcutConfig = {
      params: { q: textFilter },
      // set a promise that let you cancel the current request
      timeout: this.getUsersRequest.canceler.promise,
    };

    // setup a timeout for the request
    this.getUsersRequest.setupTimeout(this, this.utilitiesService);

    const url = this.appConstantsService.Api.users;

    // fetch data
    this.getUsersRequest.promise = this.http.get<User[]>(url, config);

    return this.getUsersRequest.promise
      .then((response: ng.IHttpResponse<User[]>) => {
        return new ResponseWs(response.status === 200, response.statusText, response.data, true, response.status === -1);

      }, (response: ng.IHttpResponse<User[]>) => {
        return new ResponseWs(false, response.statusText, undefined, true, response.status === -1);
      });
  }

  public cancelOngoingRequests(): void {

    // reset requests
    this.getUsersRequest.reset(this.utilitiesService);
  }
}
