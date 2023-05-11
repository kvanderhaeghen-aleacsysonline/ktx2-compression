import { Constants, KTX2Types } from '../constants/constants';
import * as Pixi from 'pixi.js';
import _ from 'lodash';
import { Assets } from 'pixi.js';
import { BasisParser } from '@pixi/basis';
import { KTX2Parser } from '@pixi/ktx2';

export class CompressedPixiKTX2 {
    private app: Pixi.Application;
    private stage: Pixi.Container;
    private sprites: Pixi.Sprite[] = [];
    private speeds: number[] = [];
    private isBasis = false;

    constructor(app: Pixi.Application, stage: Pixi.Container, isBasis: boolean) {
        this.app = app;
        this.stage = stage;
        this.isBasis = isBasis;

        // Pixi.extensions.add(loadKTX2GL);
        // Pixi.extensions.add(loadKTX2);
        // TranscoderWorker.loadTranscoder(window.location.origin + '/basis_transcoder.js', window.location.origin + '/basis_transcoder.wasm');
        if (!isBasis) {
            KTX2Parser.loadTranscoder(window.location.origin + '/basis_transcoder.js', window.location.origin + '/basis_transcoder.wasm');
        } else {
            BasisParser.loadTranscoder(window.location.origin + '/basis_transcoder.js', window.location.origin + '/basis_transcoder.wasm');
        }
    }

    public async create(count: number, type?: KTX2Types): Promise<void> {
        let filename = '';
        if (!this.isBasis && type) {
            filename = Constants.MODEL_KTX2_LIST[type];

        } else {
            filename = Constants.MODEL_BASIS;
        }
        console.log('Pixi - Loading compressed texture:', filename);
        const texture = (await Assets.load(filename)) as Pixi.Texture;

        for(let i = 0; i < count; i++) {
        // Create a sprite using the texture
            const sprite = new Pixi.Sprite(texture);

            const xPos = this.app.view.width / 2;
            const yPos = this.app.view.height / 2;
            const xRnd = Math.random() * 1000 - 500;
            const yRnd = Math.random() * 600 - 300;
            sprite.position.set(xPos - xRnd, yPos - yRnd);
            sprite.anchor.set(0.5, 0.5);
            sprite.scale.set(0.05, 0.05);

            this.stage.addChild(sprite);
            this.sprites.push(sprite);
            this.speeds.push(Constants.ROTATION_SPEED[0]);
            console.error(this.speeds);
            console.error(this.sprites);
        }
    }

    public reset(): void {
        for (let i = 0; i < this.sprites.length; i++) {
            const sprite = this.sprites[i];
            this.stage.addChild(sprite);
            sprite.destroy();
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
