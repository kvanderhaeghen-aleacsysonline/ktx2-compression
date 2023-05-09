import { Constants } from '../constants/constants';
import * as Three from 'three';
import _ from 'lodash';
import { OSType } from '../types/osType';
import { ThreeKTXLoader } from '../loaders/KTXLoader';

export class CompressedThree {
    private loader: ThreeKTXLoader;
    private stage: Three.Group;
    private texture?: Three.Texture;
    private sprites: Three.Sprite[] = [];
    private speeds: number[] = [];

    constructor(stage: Three.Group, loader: ThreeKTXLoader) {
        this.loader = loader;
        this.stage = stage;
    }

    public async create(device: OSType): Promise<void> {
        return new Promise<void>(async (resolve) => {
            await new Promise<Three.Texture>((resolve) => {
                if (!this.texture) {
                    const url = Constants.COMPRESSION_LIST[device];
                    console.log('Three - Loading compressed texture:', url);
                    this.texture = this.loader.load(url, this.getOnCompleteHandler(resolve), undefined, undefined);
                } else {
                    this.createSprites(this.texture!);
                    resolve(this.texture!);
                    this.texture.mipmaps;
                }
            });
            resolve();
        });
    }

    private getOnCompleteHandler(resolve: (value: Three.Texture | PromiseLike<Three.Texture>) => void): (obj: Three.Texture) => void {
        return (texture: Three.Texture): void => {
            this.createSprites(texture);
            resolve(texture);
        };
    }

    private createSprites(texture: Three.Texture): void {
        const material = new Three.SpriteMaterial({ map: texture, color: 0xffffff, fog: false });
        const sprite = new Three.Sprite(material);

        sprite.center.set(0.5, 0.5);
        sprite.scale.set(500, 500, 500);
        sprite.position.set(0, 0, -200);

        this.stage.add(sprite);
        this.sprites.push(sprite);
        this.speeds.push(Constants.ROTATION_SPEED[0]);
    }

    public reset(): void {
        this.stage.clear();
        for (let i = 0; i < this.sprites.length; i++) {
            this.sprites[i].material.dispose();
            this.sprites[i].clear();
        }
        this.sprites = [];
        this.speeds = [];
    }

    public update(): void {
        let count = 0;
        this.sprites.forEach((sprite) => {
            sprite.material.rotation += this.speeds[count];
            count++;
        });
    }
}
