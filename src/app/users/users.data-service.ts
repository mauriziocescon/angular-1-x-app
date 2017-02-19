import * as ng from "angular";
import {User} from "./users.model";
import {
	RequestWs,
	ResponseWs
} from "../shared/shared.module";
import {
	IAppConstantsService,
	IUtilitiesService
} from "../app.module";

export interface IUsersService {
	getUsers(textFilter: string): ng.IPromise<ResponseWs<Array<User>>>;
	cancelOngoingRequests(): void;
}

export class UsersService implements IUsersService {
	protected http: ng.IHttpService;
	protected q: ng.IQService;
	protected appConstantsService: IAppConstantsService;
	protected utilitiesService: IUtilitiesService;

	// requests
	private getUsersRequest: RequestWs<Array<User>>;

	static $inject = ["$http", "$q", "AppConstantsService", "UtilitiesService"];

	constructor($http: ng.IHttpService,
				$q: ng.IQService,
				AppConstantsService: IAppConstantsService,
				UtilitiesService: IUtilitiesService) {
		this.http = $http;
		this.q = $q;
		this.appConstantsService = AppConstantsService;
		this.utilitiesService = UtilitiesService;

		this.getUsersRequest = new RequestWs();
		this.http.defaults = this.httpDefaults;
	}

	private get httpDefaults(): ng.IHttpProviderDefaults {
		return {};
	}

	public getUsers(textFilter: string): ng.IPromise<ResponseWs<Array<User>>> {

		// reset request
		this.getUsersRequest.reset(this.utilitiesService);

		// configure new request
		this.getUsersRequest.canceler = this.q.defer();
		let config: ng.IRequestShortcutConfig = {
			params: {q: textFilter},
			// set a promise that let you cancel the current request
			timeout: this.getUsersRequest.canceler.promise
		};

		// setup a timeout for the request
		this.getUsersRequest.setupTimeout(this, this.utilitiesService);

		let url = this.appConstantsService.Application.WS_URL + "/users";
		this.utilitiesService.logRequest(url);
		let startTime = this.utilitiesService.getTimeFrom1970();

		// fetch data
		this.getUsersRequest.promise = this.http.get<Array<User>>(url, config);

		return this.getUsersRequest.promise.then((response: ng.IHttpPromiseCallbackArg<Array<User>>) => {
			this.utilitiesService.logResponse(response, startTime);
			return new ResponseWs(response.status == 200, response.statusText, response.data, true, response.status == -1);

		}, (response: ng.IHttpPromiseCallbackArg<Array<User>>) => {
			this.utilitiesService.logResponse(response, startTime);
			return new ResponseWs(false, response.statusText, undefined, true, response.status == -1);
		});
	}

	public cancelOngoingRequests(): void {

		// reset requests
		this.getUsersRequest.reset(this.utilitiesService);
	}
}