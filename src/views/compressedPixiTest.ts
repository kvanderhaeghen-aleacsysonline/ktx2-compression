import * as Pixi from 'pixi.js';
import { Constants, ExtensionTypes, getOSToKTXType } from '../constants/constants';
import { getOSType } from '../utils/getOSType';
import { CompressedPixiSprites } from '../models/compressedPixiSprites';
import _ from 'lodash';
import { wait } from '../utils/wait';
import { getExtensionType, getKTX2Type } from '../utils/getKTX2Type';
import { setLabelCount } from '../utils/labelTime';
import { TextureData } from '../types/texturedata';

export class CompressionPixiTest {
    private static app?: Pixi.Application;

    private stage?: Pixi.Container;
    private compressedSprites?: CompressedPixiSprites;
    private canvas?: HTMLCanvasElement;

    private objectCount = 1;

    private onDraw: () => void = this.draw.bind(this);
    private onClick: () => Promise<void> = this.addObjects.bind(this);
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

    private async addObjects(): Promise<void> {
        this.objectCount += 100;
        await this.reload();
        this.init();
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

        const countBtn = document.getElementById('count') as HTMLButtonElement;
        countBtn.addEventListener('click', this.onClick);
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
        await wait(50);
        return this.setup();
    }

    private setup(): Promise<void> {
        return this.createSprites();
    }

    private async createSprites(): Promise<void> {
        this.createStage();

        this.compressedSprites = new CompressedPixiSprites(CompressionPixiTest.app!, this.stage!);
        const extension = getExtensionType();
        const type = extension === ExtensionTypes.KTX2 ? getKTX2Type() : getOSToKTXType(getOSType());
        const data: TextureData = {
            extension,
            type,
            objectCount: this.objectCount,
        };
        await this.compressedSprites!.create(data);

        await this.createLogo();
        setLabelCount(this.objectCount);
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
        this.stage?.addChild(logo);
    }

    private draw(): void {
        if (!CompressionPixiTest.app || !CompressionPixiTest.app!.renderer) return;
        if (!this.stage) return;
        if (!this.compressedSprites) return;

        this.compressedSprites!.update();
        this.renderStage();

        requestAnimationFrame(this.onDraw);
    }

    private reset(): void {
        if (this.compressedSprites) {
            this.compressedSprites.reset();
            this.compressedSprites = undefined;
        }
        if (this.stage) {
            this.stage.removeChildren();
            this.stage.destroy();
            this.stage = undefined;
        }
        this.removeTextureCache();

        const countBtn = document.getElementById('count') as HTMLButtonElement;
        countBtn.removeEventListener('click', this.onClick);
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

        CompressionPixiTest.app?.stage.destroy();
        CompressionPixiTest.app?.destroy();
        CompressionPixiTest.app = undefined;
        this.objectCount = 1;
    }

    private removeTextureCache(): void {
        for (var textureUrl in Pixi.utils.TextureCache) {
            Pixi.utils.TextureCache[textureUrl].destroy();
        }
        for (var textureUrl in Pixi.utils.BaseTextureCache) {
            Pixi.utils.BaseTextureCache[textureUrl].destroy();
        }
    }
}
