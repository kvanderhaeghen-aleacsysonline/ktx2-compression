import { Constants } from '../constants/constants';
import * as Pixi from 'pixi.js';
import _ from 'lodash';
import { OSType } from '../types/osType';

export class CompressedPixi {
    private app: Pixi.Application;
    private stage: Pixi.Container;
    private sprites: Pixi.Sprite[] = [];
    private speeds: number[] = [];

    constructor(app: Pixi.Application, stage: Pixi.Container) {
        this.app = app;
        this.stage = stage;
    }

    public async create(device: OSType): Promise<void> {
        const filename = Constants.COMPRESSION_LIST[device];
        console.log('Pixi - Loading compressed texture:', filename);
        Pixi.Assets.load(filename).then((tex: Pixi.Texture) => {
            const sprite = new Pixi.Sprite(tex);

            const xPos = this.app.view.width / 2;
            const yPos = this.app.view.height / 2;
            sprite.position.set(xPos, yPos);
            sprite.anchor.set(0.5, 0.5);
            sprite.scale.set(0.5, 0.5);

            this.stage.addChild(sprite);
            this.sprites.push(sprite);
            this.speeds.push(Constants.ROTATION_SPEED[0]);
        });
    }

    public reset(): void {
        for (let i = 0; i < this.sprites.length; i++) {
            this.sprites[i].destroy();
        }
        this.sprites = [];
        this.speeds = [];
    }

    public update(): void {
        let count = 0;
        this.sprites.forEach((sprite) => {
            sprite.rotation += this.speeds[count];
            count++;
        });
    }
}
