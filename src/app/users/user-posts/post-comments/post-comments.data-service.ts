import * as ng from "angular";
import {Comment} from "./post-comments.model";
import {
	RequestWs,
	ResponseWs
} from "../../../shared/shared.module";
import {
	IAppConstantsService,
	IUtilitiesService
} from "../../../app.module";

export interface IPostCommentsService {
	getPostComments(postId: string): ng.IPromise<ResponseWs<Array<Comment>>>;
	cancelOngoingRequests(): void;
}

export class PostCommentsService implements IPostCommentsService {
	protected http: ng.IHttpService;
	protected q: ng.IQService;
	protected appConstantsService: IAppConstantsService;
	protected utilitiesService: IUtilitiesService;

	// requests
	private getPostCommentsRequest: RequestWs<Array<Comment>>;

	static $inject = ["$http", "$q", "AppConstantsService", "UtilitiesService"];

	constructor($http: ng.IHttpService,
				$q: ng.IQService,
				AppConstantsService: IAppConstantsService,
				UtilitiesService: IUtilitiesService) {
		this.http = $http;
		this.q = $q;
		this.appConstantsService = AppConstantsService;
		this.utilitiesService = UtilitiesService;

		this.getPostCommentsRequest = new RequestWs();
		this.http.defaults = this.httpDefaults;
	}

	private get httpDefaults(): ng.IHttpProviderDefaults {
		return {};
	}

	public getPostComments(postId: string): ng.IPromise<ResponseWs<Array<Comment>>> {

		// reset request
		this.getPostCommentsRequest.reset(this.utilitiesService);

		// configure new request
		this.getPostCommentsRequest.canceler = this.q.defer();
		let config: ng.IRequestShortcutConfig = {
			params: {postId: postId},
			// set a promise that let you cancel the current request
			timeout: this.getPostCommentsRequest.canceler.promise
		};

		// setup a timeout for the request
		this.getPostCommentsRequest.setupTimeout(this, this.utilitiesService);

		let url = this.appConstantsService.Application.WS_URL + "/comments";
		this.utilitiesService.logRequest(url);
		let startTime = this.utilitiesService.getTimeFrom1970();

		// fetch data
		this.getPostCommentsRequest.promise = this.http.get<Array<Comment>>(url, config);

		return this.getPostCommentsRequest.promise.then((response: ng.IHttpPromiseCallbackArg<Array<Comment>>) => {
			this.utilitiesService.logResponse(response, startTime);
			return new ResponseWs(response.status == 200, response.statusText, response.data, true, response.status == -1);

		}, (response: ng.IHttpPromiseCallbackArg<Array<Comment>>) => {
			this.utilitiesService.logResponse(response, startTime);
			return new ResponseWs(false, response.statusText, undefined, true, response.status == -1);
		});
	}

	public cancelOngoingRequests(): void {

		// reset requests
		this.getPostCommentsRequest.reset(this.utilitiesService);
	}
}