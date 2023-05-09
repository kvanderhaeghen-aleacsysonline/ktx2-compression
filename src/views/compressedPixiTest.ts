import * as Pixi from 'pixi.js';
import { Constants } from '../constants/constants';
import { getOSType } from '../utils/getOSType';
import { CompressedPixiKTX2 } from '../models/compressedPixiKTX2';
import _ from 'lodash';
import { wait } from '../utils/wait';
import { getKTX2Type } from '../utils/getKTX2Type';

export class CompressionPixiTest {
    private static app?: Pixi.Application;

    private stage?: Pixi.Container = undefined;
    private compressedImage?: CompressedPixiKTX2 = undefined;

    private canvas?: HTMLCanvasElement;

    private onDraw: () => void = this.draw.bind(this);
    private onClick: () => Promise<void> = this.setup.bind(this);
    private onResize: () => void = this.resize.bind(this);

    constructor() {
        this.createPixiRenderer();
        window.addEventListener('resize', this.onResize);

        this.resize();
        this.setup();
    }
    private createPixiRenderer(): void {
        this.canvas = document.createElement('canvas');
        CompressionPixiTest.app = new Pixi.Application();
        CompressionPixiTest.app.renderer = Pixi.autoDetectRenderer({
            width: Constants.WIDTH,
            height: Constants.HEIGHT,
            backgroundColor: 0xc1c2c4,
            view: this.canvas,
        });
        document.body.appendChild(this.canvas);
    }

    private resize(): void {
        const ratio = Constants.HEIGHT / Constants.WIDTH;
        if (window.innerWidth < Constants.WIDTH) {
            CompressionPixiTest.app!.renderer.resize(window.innerWidth, window.innerWidth * ratio);
        } else {
            CompressionPixiTest.app!.renderer.resize(Constants.WIDTH, Constants.HEIGHT);
        }
    }

    private createStage(): void {
        this.stage = new Pixi.Container();
        this.stage.interactive = true;
        this.stage.hitArea = new Pixi.Rectangle(0, 0, 1000, 1000);
        this.renderStage();
    }

    private renderStage(): void {
        CompressionPixiTest.app!.stage = this.stage!;
        CompressionPixiTest.app!.render();
    }

    public init(): void {
        requestAnimationFrame(this.onDraw);
    }

    public async reload(): Promise<void> {
        this.reset();
        this.removeTextureCache();
        await wait(50);
        return this.setup();
    }

    private setup(): Promise<void> {
        return this.createSprites();
    }

    private async createSprites(): Promise<void> {
        this.createStage();
        this.compressedImage = new CompressedPixiKTX2(CompressionPixiTest.app!, this.stage!, false);

        await this.compressedImage!.create(getKTX2Type());
        await this.createLogo();

        // requestAnimationFrame(this.onDraw);
    }

    private async createLogo(): Promise<void> {
        const texture = Pixi.Texture.from(Constants.LOGO_LIST[0], {
            resourceOptions: { autoLoad: false },
        });
        await texture.baseTexture.resource.load();

        const logo = new Pixi.Sprite(texture);
        logo.anchor.set(0, 0);
        logo.scale.set(0.5, 0.5);
        logo.position.set(10, -30);
        this.stage!.addChild(logo);
    }

    private draw(): void {
        if (!CompressionPixiTest.app || !CompressionPixiTest.app!.renderer) return;
        if (!this.stage) return;
        if (!this.compressedImage) return;

        this.compressedImage!.update();
        this.renderStage();

        requestAnimationFrame(this.onDraw);
    }

    private reset(): void {
        if (this.compressedImage) {
            this.compressedImage.reset();
            this.compressedImage = undefined;
        }
        if (this.stage) {
            this.stage.removeChildren();
            this.stage.destroy();
            this.stage = undefined;
        }
    }

    public destroy(): void {
        this.onDraw = _.noop.bind(this);
        this.reset();

        document.body.removeChild(this.canvas!);
        window.removeEventListener('resize', this.onResize);
        this.onClick = (): Promise<void> => {
            return Promise.resolve();
        };
        this.onResize = _.noop.bind(this);

        this.removeTextureCache();

        CompressionPixiTest.app!.stage.destroy();
        CompressionPixiTest.app!.destroy();
        CompressionPixiTest.app = undefined;
    }

    private removeTextureCache(): void {
        for (var textureUrl in Pixi.utils.BaseTextureCache) {
            delete Pixi.utils.BaseTextureCache[textureUrl];
        }
        for (var textureUrl in Pixi.utils.TextureCache) {
            delete Pixi.utils.TextureCache[textureUrl];
        }
    }
}
