import {IAppConstantsService} from "./app-constants.service";
import {ILocalStorageService} from "./local-storage.service";

/**
 * Manage the language set by the
 * user. When a new language is set,
 * the app gets reloaded
 */
export interface IAppLanguageService {
	/**
	 * Setup the service: this method has
	 * to be called as soon as the service
	 * gets created
	 */
	start(): void;
	/**
	 * returns the language id selected by the user
	 * or downloaded from the server
	 */
	getLanguageId(): string;
	/**
	 * Set the language id selected by the user
	 *
	 * @param languageId
	 */
	setLanguageId(languageId: string): void;
	/**
	 * return the entire list of supported languages
	 */
	getSupportedLanguagesList(): Array<string>;
	/**
	 * return the default language Id
	 */
	getDefaultLanguageId(): string;
}

export class AppLanguageService implements IAppLanguageService {
	private locale: ng.ILocaleService;
	private tmhDynamicLocale: ng.dynamicLocale.tmhDynamicLocaleService;
	private appConstantsService: IAppConstantsService;
	private localStorageService: ILocalStorageService;
	private selectedLanguageId: string;

	static $inject = ["$locale", "tmhDynamicLocale", "AppConstantsService", "LocalStorageService"];

	constructor($locale: ng.ILocaleService,
				tmhDynamicLocale: ng.dynamicLocale.tmhDynamicLocaleService,
				AppConstantsService: IAppConstantsService,
				LocalStorageService: ILocalStorageService) {
		this.locale = $locale;
		this.tmhDynamicLocale = tmhDynamicLocale;
		this.appConstantsService = AppConstantsService;
		this.localStorageService = LocalStorageService;
	}

	public start(): void {
		const localStorageLang = this.localStorageService.getData<string>(this.appConstantsService.LocalStorageKey.LANGUAGE_ID);
		const browserLang = this.getBrowserLang();
		const defaultLang = this.getDefaultLanguageId();

		if (localStorageLang && this.appConstantsService.Languages.SUPPORTED_LANG.indexOf(localStorageLang) != -1) {
			this.selectedLanguageId = localStorageLang;
			this.tmhDynamicLocale.set(this.selectedLanguageId);
		} else {
			this.selectedLanguageId = this.appConstantsService.Languages.SUPPORTED_LANG.indexOf(browserLang) == -1 ? defaultLang : browserLang;
			this.tmhDynamicLocale.set(this.selectedLanguageId);
			this.localStorageService.setData(this.appConstantsService.LocalStorageKey.LANGUAGE_ID, this.selectedLanguageId);
		}
	}

	public getLanguageId(): string {
		return this.selectedLanguageId;
	}

	public setLanguageId(languageId: string): void {
		if (languageId != undefined && languageId != this.selectedLanguageId && this.appConstantsService.Languages.SUPPORTED_LANG.indexOf(languageId) != -1) {
			this.selectedLanguageId = languageId;
			this.localStorageService.setData(this.appConstantsService.LocalStorageKey.LANGUAGE_ID, this.selectedLanguageId);
			location.reload(true);
		}
	}

	public getSupportedLanguagesList(): Array<string> {
		return this.appConstantsService.Languages.SUPPORTED_LANG;
	}

	public getDefaultLanguageId(): string {
		return this.appConstantsService.Languages.SUPPORTED_LANG[0];
	}

	private getBrowserLang(): string {
		let lang: string = navigator["browserLanguage"];

		if (lang == undefined)
			lang = navigator.language;

		if (lang.length > 0)
			lang = lang.toLowerCase();

		if (lang.length > 2)
			lang = lang.substring(0, 2);

		return lang;
	}
}