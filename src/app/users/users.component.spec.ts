import * as angular from "angular";
import {User, Address, Coordinates, Company} from "./users.model";
import {UsersController} from "./users.component";
import {IAppConstantsService, IUtilitiesService} from "../app.module";

// Addition of angular-mocks and jasmine references is done on the gulpfile
describe("UsersController", () => {
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

		// returns the current list of users
		httpBackend.whenGET((url: string) => {
			return url.startsWith(AppConstantsService.Application.WS_URL + "/users");
		}).respond((method: string, url: string, data: string, headers: Object, params?: any) => {

			let response = [];

			for (let i = 0; i < 4; i++) {
				let user = new User();

				user.id = i;
				user.name = "name " + i.toString();
				user.username = "username " + i.toString();
				user.email = user.name + "@email.com";
				user.address = new Address();
				user.address.street = "street";
				user.address.suite = "suite";
				user.address.city = "city";
				user.address.zipcode = "32332";
				user.address.geo = new Coordinates();
				user.address.geo.lat = "0";
				user.address.geo.lng = "0";
				user.phone = "+39 20151025";
				user.website = "www." + user.name + ".com";
				user.company = new Company();
				user.company.name = "name";
				user.company.catchPhrase = "catchPhrase";
				user.company.bs = "bs";

				response.push(user);
			}

			return [200, response, {}, "ok"];
		});
	}));

	afterEach(() => {
		httpBackend.verifyNoOutstandingExpectation();
		httpBackend.verifyNoOutstandingRequest();
	});

	it("controller.name is defined after $onInit", () => {
		let controller = <UsersController>componentController("users", null, null);
		controller.$onInit();
		httpBackend.flush();
		expect(controller.name).toBe("UsersComponent", "controller.name is not equal to UsersComponent");
	});

	it("expect controller fetches data after $onInit", () => {
		let controller = <UsersController>componentController("users", null, null);
		controller.$onInit();
		httpBackend.flush();
	});

	it("controller.users is not undefined after $onInit", () => {
		let controller = <UsersController>componentController("users", null, null);
		controller.$onInit();
		httpBackend.flush();
		expect(controller.users).not.toBeUndefined("controller.users is undefined...");
	});

	it("controller.users is not null after $onInit", () => {
		let controller = <UsersController>componentController("users", null, null);
		controller.$onInit();
		httpBackend.flush();
		expect(controller.users).not.toBeNull("controller.users is null...");
	});

	it("controller.isLoadingData is false after $onInit", () => {
		let controller = <UsersController>componentController("users", null, null);
		controller.$onInit();
		httpBackend.flush();
		expect(controller.isLoadingData).toBeFalsy("isLoadingData is true after the loading...");
	});
});