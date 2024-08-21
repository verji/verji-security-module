/*
Copyright 2022 Verji Tech AS

*/

import { RuntimeModule } from "@matrix-org/react-sdk-module-api/lib/RuntimeModule";
import { ModuleApi } from "@matrix-org/react-sdk-module-api/lib/ModuleApi";

import { 
    UserSearchExtensionsBase, 
    SearchContext,
    SdkContextClass 
} from "@matrix-org/react-sdk-module-api/lib/lifecycles/UserSearchExtensions";

export class VerjiUserSearchExtensions extends UserSearchExtensionsBase {

    public async getSearchContext(client: any, sdkContextClass: SdkContextClass): Promise<SearchContext> {
       
        const spaceRoomId = sdkContextClass.spaceStore.activeSpaceRoom?.roomId as string;
        const roomId =  sdkContextClass.roomViewStore.getRoomId() as string;

        const finalRoomId = spaceRoomId ?? roomId;
        let tenantId = null;


        try {
            // Try to derive tenantId directly
            const event = await client.getStateEvent(finalRoomId as string, "app.verji.tenant_info", "app.verji.tenant_info");
            tenantId = event["tenant_id"];
        }
        catch{
            console.log(`unable to find tenantId for room = ${finalRoomId}, delegating task to backend`)
        }

        return {
            extraBodyArgs: {
                tenant_id: tenantId,
                space_id: spaceRoomId,
                room_id: roomId
            },
            extraRequestOptions: {
                headers: {
                    "Access-Control-Request-Headers": "authorization,content-type",
                    "Access-Control-Request-Method": "POST"
                }
            }
        }
    }
}

export default class VerjiUserSearchModule extends RuntimeModule {

    public constructor(moduleApi: ModuleApi) {

        super(moduleApi);

        this.extensions = {
            userSearch: new VerjiUserSearchExtensions()
        }
    }
}
