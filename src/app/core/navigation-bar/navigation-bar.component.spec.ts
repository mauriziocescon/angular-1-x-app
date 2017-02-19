import * as angular from "angular";
import {NavigationBarController} from "./navigation-bar.component";
import {IAppConstantsService, IUtilitiesService} from "../services/services.module";

// Addition of angular-mocks and jasmine references is done on the gulpfile
describe("NavigationBarController", () => {
	let httpBackend: ng.IHttpBackendService;
	let componentController: ng.IComponentControllerService;
	let AppConstantsService: IAppConstantsService;
	let UtilitiesService: IUtilitiesService;

	// Set up the module
	beforeEach(angular.mock.module("app"));

	beforeEach(inject((_$httpBackend_, _$componentController_, _AppConstantsService_, _UtilitiesService_) => {

		// Set up the mock http service responses
		httpBackend = _$httpBackend_;

		// The $componentController service is used to create instances of controllers
		componentController = _$componentController_;

		AppConstantsService = _AppConstantsService_;
		UtilitiesService = _UtilitiesService_;
	}));

	it("controller.name is defined after $onInit", () => {
		let controller = <NavigationBarController>componentController("navigationBar", null, null);
		controller.$onInit();
		expect(controller.name).toBe("NavigationBarComponent", "controller.name is not equal to NavigationBarComponent");
	});
});