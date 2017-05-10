import {
    IDelayExecutionService,
    ILocalizedStringService,
    INavigationBarService,
    IUIUtilitiesService,
    IUtilitiesService,
} from "../../app.module";
import {
    Enum,
    ISharedFilterService,
    Logger,
    ResponseWs,
} from "../../shared/shared.module";

import { IUserPostsService } from "./user-posts.data-service";
import { Post } from "./user-posts.model";

export class UserPostsController {
    public static $inject = ["$filter", "$stateParams", "DelayExecutionService", "LocalizedStringService", "UIUtilitiesService", "UtilitiesService", "NavigationBarService", "UserPostsService"];
    public name: string;
    public textFilter: string;

    protected filter: ISharedFilterService;
    protected stateParams: ng.ui.IStateParamsService;
    protected delayExecutionService: IDelayExecutionService;
    protected localizedStringService: ILocalizedStringService;
    protected uiUtilitiesService: IUIUtilitiesService;
    protected utilitiesService: IUtilitiesService;
    protected navigationBarService: INavigationBarService;
    protected userPostsService: IUserPostsService;

    protected posts: Post[];
    protected busy: boolean;
    protected openedPost: Post;
    protected loadPostsKey: Enum;

    constructor($filter: ISharedFilterService,
                $stateParams: ng.ui.IStateParamsService,
                DelayExecutionService: IDelayExecutionService,
                LocalizedStringService: ILocalizedStringService,
                UIUtilitiesService: IUIUtilitiesService,
                UtilitiesService: IUtilitiesService,
                NavigationBarService: INavigationBarService,
                UserPostsService: IUserPostsService) {
        this.filter = $filter;
        this.stateParams = $stateParams;
        this.delayExecutionService = DelayExecutionService;
        this.localizedStringService = LocalizedStringService;
        this.uiUtilitiesService = UIUtilitiesService;
        this.utilitiesService = UtilitiesService;
        this.navigationBarService = NavigationBarService;
        this.userPostsService = UserPostsService;

        this.name = "UserPostsComponent";
    }

    public get isLoadingData(): boolean {
        return this.busy === true;
    }

    public get hasNoData(): boolean {
        return this.posts !== undefined && this.posts.length === 0 && this.isLoadingData === false;
    }

    public get shouldRetry(): boolean {
        return this.posts === undefined && this.isLoadingData === false;
    }

    public get showData(): boolean {
        return this.isLoadingData === false && this.hasNoData === false && this.shouldRetry === false;
    }

    public get textFilterPlaceholder(): string {
        return this.localizedStringService.getLocalizedString("INPUT_TEXT_PLACEHOLDER");
    }

    public get dataSource(): Post[] {
        return this.posts;
    }

    public $onInit(): void {
        this.navigationBarService.setTitle(this.localizedStringService.getLocalizedString("POSTS"));
        this.loadPostsKey = new Enum("POSTS");
        this.busy = false;
        this.loadDataSource();
    }

    public $onDestroy(): void {
        this.userPostsService.cancelOngoingRequests();
    }

    public getPostTitle(post: Post): string {
        return post.id + " " + post.title;
    }

    public isOpen(post: Post): boolean {
        return this.openedPost && post.id === this.openedPost.id;
    }

    public open(post: Post): void {
        this.openedPost = post;
    }

    public close(post: Post): void {
        this.openedPost = undefined;
    }

    public resetTextFilter(): void {
        if (this.textFilter === undefined) {
            return;
        }

        this.textFilter = undefined;
        this.loadDataSource();
    }

    public textFilterDidChange(): void {
        this.delayExecutionService.execute(() => {
            this.loadDataSource();
        }, this.loadPostsKey, 1500);
    }

    public loadDataSource(): void {
        this.busy = true;
        this.posts = undefined;

        const userId = "userId";
        this.userPostsService.getPosts(this.stateParams[userId], this.textFilter).then((response: ResponseWs<Post[]>) => {

            if (response.isSuccess()) {
                this.posts = response.getData();
            }
            else if (response.hasBeenCanceled() === false) {
                // we do not notify the user in case of cancel request
                this.uiUtilitiesService.modalAlert(this.localizedStringService.getLocalizedString("ERROR_ACCESS_DATA"), response.getMessage(), this.localizedStringService.getLocalizedString("CLOSE"));
            }
        }).catch((reason: any) => {
            this.uiUtilitiesService.modalAlert(this.localizedStringService.getLocalizedString("ERROR_ACCESS_DATA_COMPONENT"), reason.toString(), this.localizedStringService.getLocalizedString("CLOSE"));
            Logger.log(reason);
        }).finally(() => {
            this.busy = false;
        });
    }
}

export const UserPostsComponent: ng.IComponentOptions = {
    bindings: {},
    controller: UserPostsController,
    templateUrl: () => {
        return "user-posts.component.html";
    },
};
