import { OSTypes } from "../types/osType";

export enum ExtensionTypes {
    PNG = 'png',
    KTX = 'ktx',
    Basis = 'basis',
    KTX2 = 'ktx2',
}

export enum KTX2Types {
    ETC1S = 'etc1s',
    UASTC = 'uastc',
    ASTC_4X4 = 'astc-4x4',
    ASTC_6X6 = 'astc-6x6',
    ASTC_8X8    = 'astc-8x8',
    ASTC_12X12 = 'astc-12x12',
}

export enum KTXTypes {
    ETC1 = 'etc1',
    ETC2 = 'etc2',
    PVRTC = 'pvrtc',
    DXT = 'dxt',
}

export function getOSToKTXType(osType: OSTypes): KTXTypes {
    switch (osType) {
        case OSTypes.android:
            return KTXTypes.ETC2
        case OSTypes.apple:
            return KTXTypes.PVRTC;
        default:
            break;
    }
    return KTXTypes.DXT;
}

export class Constants {
    static readonly WIDTH: number = 1280;
    static readonly HEIGHT: number = 720;
    static readonly LOGO_LIST: string[] = ['./assets/pixijs.png', './assets/threejs.png'];
    static readonly ROTATION_SPEED: number[] = [0.01, 0.1];
    static readonly THREE_TEXT = 'Three mode - Click for Pixi mode';
    static readonly PIXI_TEXT = 'Pixi mode - Click for Three mode';
    static readonly MODEL_PATH = './assets/models/book/book.gltf';
    static readonly MESH_NAME = 'M_Book';
    static readonly MODEL_COMPRESSION_LIST: Record<string, string> = {
        [KTXTypes.DXT]: './assets/compressed/ktx/book.dxt.ktx',
        [KTXTypes.PVRTC]:'./assets/compressed/ktx/book.pvrtc.ktx',
        [KTXTypes.ETC2]:'./assets/compressed/ktx/book.etc2.ktx',
    };
    static readonly MODEL_BASIS: string = './assets/models/book/basis/book.basis';
    static readonly MODEL_KTX2_LIST: Record<string, string> = {
        [KTX2Types.ETC1S]: './assets/compressed/ktx2/book-etc1s.ktx2',
        [KTX2Types.UASTC]: './assets/compressed/ktx2/book-uastc.ktx2',
        [KTX2Types.ASTC_4X4]: './assets/compressed/ktx2/book-astc-4x4.ktx2',
        [KTX2Types.ASTC_6X6]: './assets/compressed/ktx2/book-astc-6x6.ktx2',
        [KTX2Types.ASTC_8X8]: './assets/compressed/ktx2/book-astc-8x8.ktx2',
        [KTX2Types.ASTC_12X12]: './assets/compressed/ktx2/book-astc-12x12.ktx2',
    }
    static readonly MODEL_TEXTURE: string = './assets/models/book/book.png';
    public static getCompressedTexture(extension: ExtensionTypes, type = ''): string {
        switch (extension) {
            case ExtensionTypes.KTX:
                return Constants.MODEL_COMPRESSION_LIST[type];
            case ExtensionTypes.Basis:
                return Constants.MODEL_BASIS;
            case ExtensionTypes.KTX2:
                    return Constants.MODEL_KTX2_LIST[type];
            default:
            case ExtensionTypes.PNG:
                return Constants.MODEL_TEXTURE;
        }
    }
}
