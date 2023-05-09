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

export class Constants {
    static readonly WIDTH: number = 1280;
    static readonly HEIGHT: number = 720;
    static readonly COMPRESSION_LIST: Record<string, string> = {
        [KTXTypes.DXT]:'./assets/compressed/dice_square.dxt.ktx',
        [KTXTypes.PVRTC]:'./assets/compressed/dice_square.pvrtc.ktx',
        [KTXTypes.ETC1]:'./assets/compressed/dice_square.etc1.ktx',
        [KTXTypes.ETC2]:'./assets/compressed/dice_square.etc2.ktx',
    };
    static readonly LOGO_LIST: string[] = ['./assets/pixijs.png', './assets/threejs.png'];
    static readonly ROTATION_SPEED: number[] = [0.01, 0.1];
    static readonly THREE_TEXT = 'Three mode - Click to show Pixi mode';
    static readonly PIXI_TEXT = 'Pixi mode - Click to show Three mode';
    static readonly MODEL_PATH = './assets/models/book/book.gltf';
    static readonly MESH_NAME = 'M_Book';
    static readonly MODEL_COMPRESSION_LIST: Record<string, string> = {
        [KTXTypes.DXT]: './assets/models/book/book.dxt.ktx',
        [KTXTypes.PVRTC]:'./assets/models/book/book.pvrtc.ktx',
        [KTXTypes.ETC2]:'./assets/models/book/book.etc2.ktx',
    };
    static readonly MODEL_BASIS: string = './assets/models/book/basis/book.basis';
    static readonly MODEL_KTX2_LIST: Record<KTX2Types, string> = {
        [KTX2Types.ETC1S]: './assets/compressed/ktx2/book-etc1s.ktx2',
        [KTX2Types.UASTC]: './assets/compressed/ktx2/book-uastc.ktx2',
        [KTX2Types.ASTC_4X4]: './assets/compressed/ktx2/book-astc-4x4.ktx2',
        [KTX2Types.ASTC_6X6]: './assets/compressed/ktx2/book-astc-6x6.ktx2',
        [KTX2Types.ASTC_8X8]: './assets/compressed/ktx2/book-astc-8x8.ktx2',
        [KTX2Types.ASTC_12X12]: './assets/compressed/ktx2/book-astc-12x12.ktx2',
    }
}
