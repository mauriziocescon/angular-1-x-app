/**
 * Establish if the device is
 * online or not.
 *
 * When the status changes, an
 * apply to the rootScope gets
 * trigger
 */
export interface IConnectionService {
	/**
	 * Setup the service: call this method
	 * as soon as the service gets created
	 */
	start(): void;
	/**
	 * Tell you if you're online or not
	 */
	isOnline(): boolean;
}

export class ConnectionService implements IConnectionService {
	private rootScope: ng.IRootScopeService;
	private window: ng.IWindowService;

	private onLine: boolean;

	static $inject = ["$rootScope", "$window"];

	constructor($rootScope: ng.IRootScopeService,
				$window: ng.IWindowService) {
		this.rootScope = $rootScope;
		this.window = $window;
	}

	public start(): void {
		this.onLine = navigator.onLine;

		this.window.onoffline = () => {
			this.onLine = false;
			this.rootScope.$apply()
		};

		this.window.ononline = () => {
			this.onLine = true;
			this.rootScope.$apply()
		};
	}

	public isOnline(): boolean {
		return this.onLine;
	}
}