/*
Copyright 2022 Verji Tech AS

*/

import { RuntimeModule } from "@matrix-org/react-sdk-module-api/lib/RuntimeModule";
import { ModuleApi } from "@matrix-org/react-sdk-module-api/lib/ModuleApi";
import {
    SecurityLifecycle,
    ExamineLoginResponseListener,
    SecurityExtensionMethods
} from "@matrix-org/react-sdk-module-api/lib/lifecycles/SecurityLifecycle";

// import { 
//     FetcherTypes,
//     ValueFetcher,
//     ValueFetcherResult 
// } from "@matrix-org/react-sdk-module-api/lib/lifecycles/types";

export default class VerjiSecurityModule extends RuntimeModule {

    //public override fetchers = new Map<FetcherTypes, ValueFetcher<ValueFetcherResult>>();

    public constructor(moduleApi: ModuleApi) {

        super(moduleApi);

        // Register handlers for events raised by ModuleRunner.invoke()
        this.on(SecurityLifecycle.ExamineLoginResponse, this.onExamineLoginResponse);

        // Expose methods which shall be reachable by ModuleRunner.invokeMethod()
        this.fetchers.set(SecurityExtensionMethods.GetSecretStorageKey, this.getSecretStorageKey)
    }

    protected onExamineLoginResponse: ExamineLoginResponseListener = (loginResponse, cred) => {
        console.log("Examining login response", loginResponse, cred)
    };

    public getSecretStorageKey(args:any): string {
        console.log(`verji getSecretStorageKey(): with args = , ${args}`)
        return "verji getSecretStorageKey";
    };
}
