/*
Copyright 2022 Verji Tech AS

*/

import { RuntimeModule } from "@matrix-org/react-sdk-module-api/lib/RuntimeModule";
import { ModuleApi } from "@matrix-org/react-sdk-module-api/lib/ModuleApi";
import { decodeBase64 } from "matrix-js-sdk/src/base64";
import {
    CryptoSetupExtensionsBase,
    ExtendedMatrixClientCreds,
    SecretStorageKeyDescription,
    CryptoSetupArgs
} from "@matrix-org/react-sdk-module-api/lib/lifecycles/CryptoSetupExtensions";

export class VerjiCryptoSetupExtensions extends CryptoSetupExtensionsBase {

    static setupEncryptionBusy = false;


    examineLoginResponse(response: any, credentials: ExtendedMatrixClientCreds): void {
        console.log("VerjiCryptoSetupExtensions: examineLoginResponse(): Enter", response, credentials);
        if (response.secure_backup_key) {
            credentials.secureBackupKey = response.secure_backup_key;
        }
        console.log("VerjiCryptoSetupExtensions: examineLoginResponse(): Exit", response, credentials);
    }
    persistCredentials(credentials: ExtendedMatrixClientCreds): void {
        console.log("VerjiCryptoSetupExtensions: persistCredentials()", credentials);
        if (credentials.secureBackupKey) {
            console.log("VerjiCryptoSetupExtensions: Received secure backup key during login");
            localStorage.setItem("mx_secure_backup_key", credentials.secureBackupKey);
        }    
    }

    getSecretStorageKey(): Uint8Array {
        console.log("VerjiCryptoSetupExtensions.getSecretStorageKey()");
        if (!localStorage.getItem("mx_secure_backup_key")) {
            return null;
        }
        return decodeBase64(localStorage.getItem("mx_secure_backup_key"));
    }

    createSecretStorageKey(): Uint8Array {
        console.log("VerjiCryptoSetupExtensions.createSecretStorageKey(): Delegating to getSecretStorageKey()");
        return this.getSecretStorageKey();
    }

    catchAccessSecretStorageError(e: Error): void {
        console.log("VerjiCryptoSetupExtensions.catchAccessSecretStorageError()", e);
    }

    setupEncryptionNeeded(args: CryptoSetupArgs): boolean {
        console.log(`VerjiCryptoSetupExtensions.setupEncryptionNeeded(${args.kind})`);
        if (!this.getSecretStorageKey()) {
            return false;
        }
        (async () => {
            if (VerjiCryptoSetupExtensions.setupEncryptionBusy) {
                return;
            }
            try {
               VerjiCryptoSetupExtensions.setupEncryptionBusy = true;
               //const store = SetupEncryptionStore.sharedInstance();
               //const store = window.mxSetupEncryptionStore
               const store = args.storeProvider.getInstance();

                // TODO: Explore ways to ensure store is available. Possibly via RuntimeModule  
                if(store){
                    console.log(`VerjiCryptoSetupExtensions.setupEncryptionNeeded(${args.kind}): will call store.usePassphrase()`)
                    // This will trigger secret storage, key backup, etc.
                    await store.usePassPhrase();
                }
                else {
                    console.error(`VerjiCryptoSetupExtensions.setupEncryptionNeeded(${args.kind}): store not available`)
                }
            } catch (e) {
                console.error(e);
            } finally {
                VerjiCryptoSetupExtensions.setupEncryptionBusy = false;
            }
        })();
        return true;
    }

    getDehydrationKeyCallback(): (keyInfo: SecretStorageKeyDescription, checkFunc: (key: Uint8Array) => void) => Promise<Uint8Array> {

        console.log("VerjiCryptoSetupExtensions: getDehydrationKeyCallback()");
        var b64key = localStorage.getItem("mx_secure_backup_key");
        if (!b64key) {
            return null;
        }
        console.log("VerjiCryptoSetupExtensions: getDehydrationKeyCallback() => REDACTED_KEY");
        return (_,__) => Promise.resolve(decodeBase64(b64key));
    }

    SHOW_ENCRYPTION_SETUP_UI: boolean = false;
}

export default class VerjiSecurityModule extends RuntimeModule {

    public constructor(moduleApi: ModuleApi) {

        super(moduleApi);

        this.extensions = {
            cryptoSetup: new VerjiCryptoSetupExtensions()
        }
    }
}
