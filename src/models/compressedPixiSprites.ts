import { Constants, ExtensionTypes } from '../constants/constants';
import * as Pixi from 'pixi.js';
import _ from 'lodash';
import { Assets } from 'pixi.js';
// import { BasisParser, KTX2Parser } from 'pixi-basis-ktx2';
// import { BasisParser } from '@pixi/basis';
import { BasisParser, KTX2Parser } from '@pixi/basis';
import { LabelTypes, setLabelTime } from '../utils/labelTime';
import { TextureData } from '../types/texturedata';

export class CompressedPixiSprites {
    private app: Pixi.Application;
    private stage: Pixi.Container;
    private sprites: Pixi.Sprite[] = [];
    private speeds: number[] = [];
    private baseTexture?: Pixi.BaseTexture;
    private fileName = '';

    constructor(app: Pixi.Application, stage: Pixi.Container) {
        this.app = app;
        this.stage = stage;
    }

    public async create(data: TextureData): Promise<void> {
        if (data.extension === ExtensionTypes.KTX2) {
            await KTX2Parser.loadTranscoder(window.location.origin + '/basis_transcoder.js', window.location.origin + '/basis_transcoder.wasm');
        } else if (data.extension === ExtensionTypes.Basis) {
            await BasisParser.loadTranscoder(window.location.origin + '/basis_transcoder.js', window.location.origin + '/basis_transcoder.wasm');
        }

        this.fileName = Constants.getCompressedTexture(data.extension, data.type);
        console.log('Pixi - Loading compressed', data.extension, 'texture:', this.fileName);

        const startTime = Date.now();
        const texture = (await Assets.load(this.fileName)) as Pixi.Texture;
        this.baseTexture = texture.baseTexture;

        const endTime = Date.now();
        const difference = endTime - startTime;
        if(difference > 500) {
            setLabelTime(LabelTypes.Transcoding, difference);
        } else {
            setLabelTime(LabelTypes.Loading, difference);
        }

        for(let i = 0; i < data.objectCount; i++) {
            const sprite = new Pixi.Sprite(texture);

            const xPos = this.app.view.width / 2;
            const yPos = this.app.view.height / 2;
            const xRnd = Math.random() * 1000 - 500;
            const yRnd = Math.random() * 600 - 300;
            sprite.position.set(xPos - xRnd, yPos - yRnd);
            sprite.anchor.set(0.5, 0.5);
            sprite.scale.set(0.2, 0.2);

            this.stage.addChild(sprite);
            this.sprites.push(sprite);
            this.speeds.push(Constants.ROTATION_SPEED[0]);
        }
    }

    public reset(): void {
        for (let i = 0; i < this.sprites.length; i++) {
            const sprite = this.sprites[i];
            this.stage.removeChild(sprite);
            Pixi.Texture.removeFromCache(sprite.texture);
            sprite.destroy();
        }
        if(this.baseTexture) {
            Pixi.BaseTexture.removeFromCache(this.baseTexture);
            Pixi.Assets.unload(this.fileName);
            this.baseTexture = undefined;
        }
        this.sprites = [];
        this.speeds = [];
    }

    public update(): void {
        let count = 0;
        if (this.sprites && this.sprites.length > 0) {
            this.sprites.forEach((sprite) => {
                if (sprite) {
                    sprite.rotation += this.speeds[count];
                }
                count++;
            });
        }
    }
}
