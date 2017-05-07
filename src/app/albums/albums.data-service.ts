import * as ng from "angular";
import { Album } from "./albums.model";
import {
    RequestWs,
    ResponseWs
} from "../shared/shared.module";
import {
    IAppConstantsService,
    IUtilitiesService
} from "../app.module";

export interface IAlbumsService {
    getAlbums(textFilter: string, page: number): ng.IPromise<ResponseWs<Array<Album>>>;
    cancelOngoingRequests(): void;
}

export class AlbumsService implements IAlbumsService {
    protected http: ng.IHttpService;
    protected q: ng.IQService;
    protected appConstantsService: IAppConstantsService;
    protected utilitiesService: IUtilitiesService;

    // requests
    private getAlbumsRequest: RequestWs<Array<Album>>;

    static $inject = ["$http", "$q", "AppConstantsService", "UtilitiesService"];

    constructor($http: ng.IHttpService,
                $q: ng.IQService,
                AppConstantsService: IAppConstantsService,
                UtilitiesService: IUtilitiesService) {
        this.http = $http;
        this.q = $q;
        this.appConstantsService = AppConstantsService;
        this.utilitiesService = UtilitiesService;

        this.getAlbumsRequest = new RequestWs();
        this.http.defaults = this.httpDefaults;
    }

    private get httpDefaults(): ng.IHttpProviderDefaults {
        return {};
    }

    public getAlbums(textFilter: string, page: number): ng.IPromise<ResponseWs<Array<Album>>> {

        // reset request
        this.getAlbumsRequest.reset(this.utilitiesService);

        // configure new request
        this.getAlbumsRequest.canceler = this.q.defer();
        const config: ng.IRequestShortcutConfig = {
            params: {q: textFilter, _page: page},
            // set a promise that let you cancel the current request
            timeout: this.getAlbumsRequest.canceler.promise
        };

        // setup a timeout for the request
        this.getAlbumsRequest.setupTimeout(this, this.utilitiesService);

        const url = this.appConstantsService.Application.WS_URL + "/albums";
        this.utilitiesService.logRequest(url);
        const startTime = this.utilitiesService.getTimeFrom1970();

        // fetch data
        this.getAlbumsRequest.promise = this.http.get<Album[]>(url, config);

        return this.getAlbumsRequest.promise.then((response: ng.IHttpPromiseCallbackArg<Album[]>) => {
            this.utilitiesService.logResponse(response, startTime);
            let info = this.utilitiesService.parseLinkHeaders(response.headers);

            if (!info.last) {
                // default value: when there are no
                // pages, info is empty
                info = {
                    first: "http://jsonplaceholder.typicode.com/default?_page=1",
                    last: "http://jsonplaceholder.typicode.com/default?_page=1",
                    next: "http://jsonplaceholder.typicode.com/default?_page=1"
                };
            }

            const lastPage = parseInt(this.utilitiesService.parseQueryString(info.last)._page, null);
            return new ResponseWs(response.status === 200, response.statusText, response.data, page === lastPage, response.status === -1);

        }, (response: ng.IHttpPromiseCallbackArg<Album[]>) => {
            this.utilitiesService.logResponse(response, startTime);
            return new ResponseWs(false, response.statusText, undefined, true, response.status === -1);
        });
    }

    public cancelOngoingRequests(): void {

        // reset requests
        this.getAlbumsRequest.reset(this.utilitiesService);
    }
}
