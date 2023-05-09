import { Constants, KTX2Types } from '../constants/constants';
import * as Three from 'three';
import _ from 'lodash';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';

export class CompressedThreeKTX2 {
    private loader?: KTX2Loader;
    private stage: Three.Group;
    private texture?: Three.Texture;
    private sprites: Three.Sprite[] = [];
    private speeds: number[] = [];

    constructor(stage: Three.Group, loader: KTX2Loader) {
        this.loader = loader;
        this.stage = stage;
    }

    public async create(type: KTX2Types): Promise<void> {
        return new Promise<void>(async (resolve) => {
            await new Promise<Three.Texture>(async (texResolve) => {
                if (!this.texture) {
                    const url = Constants.MODEL_KTX2_LIST[type];
                    console.log('Three - Loading compressed texture:', url);
                    this.texture = await this.loader!.loadAsync(url, this.getOnProgress.bind(this));
                    console.error(this.texture);
                    if (this.texture) {
                        texResolve(this.texture);
                    }
                } else {
                    this.createSprites(this.texture);
                    texResolve(this.texture);
                }
            });
            resolve();
        });
    }

    private getOnProgress(event: ProgressEvent<EventTarget>): void {
        console.error('progress:', event);
    }

    private createSprites(texture: Three.Texture): void {
        const material = new Three.SpriteMaterial({ map: texture, color: 0xffffff });
        const sprite = new Three.Sprite(material);
        console.error(sprite);

        sprite.center.set(0.5, 0.5);
        sprite.scale.set(500, 500, 500);
        sprite.position.set(0, 0, -200);

        this.stage.add(sprite);
        this.sprites.push(sprite);
        this.speeds.push(Constants.ROTATION_SPEED[0]);
    }

    public reset(): void {
        if (this.stage) {
            this.stage.traverse((object) => {
                if (object instanceof Three.Mesh) {
                    (object.material as Three.Material).dispose();
                }
            });
            this.stage.clear();
        }
        for (let i = 0; i < this.sprites.length; i++) {
            this.sprites[i]?.material?.dispose();
            this.sprites[i]?.clear();
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
