angular.module("tryApp")
    .run(["$rootScope", "$state", "$stateParams", "$http", "$templateCache", "$location", ($rootScope: ITryRootScope, $state: ng.ui.IStateService, $stateParams: ng.ui.IStateParamsService, $http: ng.IHttpService, $templateCache: ng.ITemplateCacheService, $location: ng.ILocationService) => {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.freeTrialClick = (place) => {
            uiTelemetry("FREE_TRIAL_CLICK", { pagePlace: place});
        };

        $rootScope.ibizaClick = () => {
            uiTelemetry("IBIZA_CLICK");
        };

        $rootScope.monacoClick = () => {
            uiTelemetry("MONACO_CLICK");
        };

        $rootScope.downloadContentClick = () => {
            uiTelemetry("DOWNLOAD_CONTENT_CLICK");
        };

        $rootScope.downloadPublishingProfileClick = () => {
            uiTelemetry("DOWNLOAD_PUBLISHING_PROFILE_CLICK");
        };

        $rootScope.gitLinkClick = () => {
            uiTelemetry("GIT_LINK_CLICK");
        };

        $rootScope.downloadMobileClient = (clientType) => {
            uiTelemetry("DOWNLOAD_MOBILE_CLIENT", {clientType : clientType});
        };

        $rootScope.deleteResourceClick = () => {
            uiTelemetry("DELETE_RESOURCE_CLICK");
        };

        $rootScope.logout = () => {
            function deleteAllCookies() {
                var cookies = document.cookie.split(";");
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = cookies[i];
                    var eqPos = cookie.indexOf("=");
                    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
                    if (name !== "uinit" && name !== "aus")
                        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
                }
            }
            deleteAllCookies();
            window.location.replace('https://' + window.location.host + '/');
        };

        $rootScope.cachedQuery = "";
        $(document).ready(init);
        function init() {
            var referrer = getReferer();
            var sourceVariation = getSourceVariation();

            if (referrer && referrer === "aspnet" || sourceVariation === "develop-aspnet" || sourceVariation === "aspnetdirect") {
                $rootScope.branding = "aspnet";
            } else if (sourceVariation === "mkt-b15.22") {
                $rootScope.branding = "mkt-b15.22";
            }

            $rootScope.experiment = Cookies.get("exp2");

            var cleanUp = (s: string) => s ? s.replace("_", "") : "-";
            $rootScope.cachedQuery = "try_websites_"
                + cleanUp(Cookies.get("exp1"))
                + "_"
                + cleanUp(getReferer())
                + "_"
                + cleanUp(getSourceVariation())
                + "_"
                + cleanUp(Cookies.get("type"));
        };

        $rootScope.createAppType = (appType) => {
            var value = Cookies.get("type");
            if (value && value !== appType.toLocaleLowerCase()) {
                value = "mix";
            } else {
                value = appType.toLocaleLowerCase();
            }
            Cookies.set("type", value);
            init();
        };

        var refererNameLookup = [
            { match: /http(s)?:\/\/azure\.microsoft\.com\/([a-z]){2}-([a-z]){2}\/services\/app-service\/.*/, name: "acomaslp"},
            { match: /http(s)?:\/\/azure\.microsoft\.com\/([a-z]){2}-([a-z]){2}\/documentation\/.*/, name: "acomasdoc"},
            { match: /http(s)?:\/\/azure\.microsoft\.com\/([a-z]){2}-([a-z]){2}\/develop\/net\/aspnet\/.*/, name: "aspnet"},
            { match: /http(s)?:\/\/[a-z]*(\.)?google\.com\/.*/, name: "search"},
            { match: /http(s)?:\/\/[a-z]*(\.)?bing\.com\/.*/, name: "search"},
            { match: /http(s)?:\/\/[a-z]*(\.)?yahoo\.com\/.*/, name: "search"},
            { match: /http(s)?:\/\/ad\.atdmt\.com\/.*/, name: "ad"},
            { match: /http(s)?:\/\/[a-z]*(\.)?doubleclick\.net\/.*/, name: "ad"},
            { match: /http(s)?:\/\/[a-z]*(\.)?chango\.com\/.*/, name: "ad"},
            { match: /http(s)?:\/\/[a-z]*(\.)?media6degrees\.com\/.*/, name: "ad"}
        ];

        function getReferer(): string {
            var storedOrigin = Cookies.get("origin");
            if (!document.referrer || document.referrer === "") return storedOrigin;
            var catagory = refererNameLookup.find(e => e.match.test(document.referrer));
            storedOrigin = catagory ? catagory.name : "unc";
            Cookies.set("origin", storedOrigin);
            return storedOrigin;
        }

        function getSourceVariation(): string {
            var sv = $location.search().sv;
            if (sv) {
                Cookies.set("sv", sv);
                return sv;
            }
            else {
                return Cookies.get("sv");
            }
        }

        //http://stackoverflow.com/a/23522925/3234163
        var url;
        $state.get().forEach((s) => {
            if (url = s.templateUrl) {
                $http.get(url, { cache: $templateCache });
            }
        });

        function uiTelemetry(event: string, properties?: any) {
            $http({
                url: "/api/telemetry/" + event,
                method: "POST",
                data: properties
            });
        }

        $state.go("home");
    }])
