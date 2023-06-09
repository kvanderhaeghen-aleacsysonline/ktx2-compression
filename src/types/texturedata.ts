import { ExtensionTypes, KTX2Types, KTXTypes } from "../constants/constants";

export interface TextureData {
    extension: ExtensionTypes;
    type: KTXTypes | KTX2Types | string;
    objectCount: number;
}