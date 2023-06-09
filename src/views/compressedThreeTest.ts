import * as Three from 'three';
import { Constants, ExtensionTypes, getOSToKTXType } from '../constants/constants';
import _ from 'lodash';
import { getOSType } from '../utils/getOSType';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { KTXLoader } from 'three/examples/jsm/loaders/KTXLoader';
import { wait } from '../utils/wait';
import { CompressedThreeModels } from '../models/compressedThreeModels';
import { getExtensionType, getKTX2Type } from '../utils/getKTX2Type';
import { setLabelCount } from '../utils/labelTime';
import { TextureData } from '../types/texturedata';

export class CompressedThreeTest {
    private static renderer?: Three.WebGLRenderer;
    private static cameraOrtho?: Three.OrthographicCamera;

    private sceneOrtho?: Three.Scene;
    private sceneLight?: Three.DirectionalLight;
    private stage?: Three.Group;
    private loader?: Three.TextureLoader;
    private ktxLoader?: KTXLoader;
    private ktx2Loader?: KTX2Loader;
    private gltfLoader?: GLTFLoader;
    private compressedModels?: CompressedThreeModels;

    private objectCount = 1; 
    private isKTX2 = false;

    private onDraw: () => void = this.draw.bind(this);
    // private onClick: () => Promise<void> = this.setup.bind(this);
    private onClick: () => Promise<void> = this.addObjects.bind(this);
    private onResize: () => void = this.resize.bind(this);

    constructor() {
        const renderer = new Three.WebGLRenderer();
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(Constants.WIDTH, Constants.HEIGHT);
        renderer.autoClear = false; // To allow render overlay on top
        renderer.outputEncoding = Three.sRGBEncoding;
        document.body.appendChild(renderer.domElement);
        CompressedThreeTest.renderer = renderer;

        CompressedThreeTest.cameraOrtho = new Three.OrthographicCamera(
            -Constants.WIDTH / 2,
            Constants.WIDTH / 2,
            Constants.HEIGHT / 2,
            -Constants.HEIGHT / 2,
            1,
            1000
        );
        CompressedThreeTest.cameraOrtho.position.z = 10;
        CompressedThreeTest.cameraOrtho.updateProjectionMatrix();
        window.addEventListener('resize', this.onResize);

        this.createLoaders();
        this.setup();
        this.resize();
    }

    private async addObjects(): Promise<void> {
        this.objectCount += 100;
        await this.reload();
        this.init();
    }

    private resize(): void {
        const ratio = Constants.HEIGHT / Constants.WIDTH;
        if (window.innerWidth < Constants.WIDTH) {
            CompressedThreeTest.renderer!.setSize(window.innerWidth, window.innerWidth * ratio);
        } else {
            CompressedThreeTest.renderer!.setSize(Constants.WIDTH, Constants.HEIGHT);
        }
    }

    private createScene(): void {
        this.sceneLight = new Three.DirectionalLight(new Three.Color(255, 255, 255), 0.01);
        this.sceneLight.position.set(2000, 2000, 100);
        this.sceneLight.target.position.set(0, 0, 0);
        this.sceneOrtho = new Three.Scene();
        this.sceneOrtho.add(this.sceneLight);
        this.sceneOrtho.background = new Three.Color(0xc1c2c4);
        this.stage = new Three.Group();
        this.sceneOrtho.add(this.stage);

        const countBtn = document.getElementById('count') as HTMLButtonElement;
        countBtn.addEventListener('click', this.onClick);
    }

    private createLoaders(): void {
        this.loader = new Three.TextureLoader();
        this.ktxLoader = new KTXLoader(this.loader.manager);
        this.ktx2Loader = new KTX2Loader(this.loader.manager);
        this.gltfLoader = new GLTFLoader(this.loader.manager);

        this.ktx2Loader.setTranscoderPath(window.location.origin + '/');
        this.ktx2Loader.detectSupport(CompressedThreeTest.renderer!);
    }

    public init(): void {
        requestAnimationFrame(this.onDraw);
    }

    public async reload(): Promise<void> {
        this.reset();
        this.createLoaders();
        await wait(50);
        return this.setup();
    }

    private setup(): Promise<void> {
        return this.createSprites();
    }

    private async createSprites(): Promise<void> {
        this.createScene();

        this.compressedModels = new CompressedThreeModels(this.stage!, this.loader!, this.ktxLoader!, this.ktx2Loader!, this.gltfLoader!);
        const extension = getExtensionType();
        const type = extension === ExtensionTypes.KTX2 ? getKTX2Type() : getOSToKTXType(getOSType());
        const data: TextureData = {
            extension,
            type,
            objectCount: this.objectCount,
        };
        await this.compressedModels!.create(data);

        await this.createLogo();
        setLabelCount(this.objectCount);
        // requestAnimationFrame(this.onDraw);
    }


    private async createLogo(): Promise<void> {
        return new Promise<void>(async (resolve) => {
            const url = Constants.LOGO_LIST[1];
            this.loader!.load(
                url,
                (tex) => {
                    const material = new Three.SpriteMaterial({ map: tex, color: 0xffffff, fog: false });
                    const logo = new Three.Sprite(material);
                    logo.center.set(0, 1);
                    logo.scale.set(100, 100, 100);
                    logo.position.set(Constants.WIDTH * -0.5 + 5, Constants.HEIGHT * 0.5 - 5, 0);

                    this.stage!.add(logo);
                    resolve();
                },
                undefined,
                undefined
            );
        });
    }

    private draw(): void {
        if (!CompressedThreeTest.renderer || !CompressedThreeTest.cameraOrtho) return;
        if (!this.sceneOrtho || !this.stage) return;
        if (/*!this.compressedImage || */!this.compressedModels) return;

        this.compressedModels!.update();

        CompressedThreeTest.renderer!.clear();
        CompressedThreeTest.renderer!.render(this.sceneOrtho, CompressedThreeTest.cameraOrtho!);
        requestAnimationFrame(this.onDraw);
    }

    private reset(): void {
        // if (this.compressedImage) {
        //     this.compressedImage.reset();
        //     this.compressedImage = undefined;
        // }
        if (this.compressedModels) {
            this.compressedModels.reset();
            this.compressedModels = undefined;
        }
        if (this.gltfLoader) {
            this.gltfLoader = undefined;
        }
        if (this.loader) {
            this.loader = undefined;
        }
        if (this.ktx2Loader) {
            this.ktx2Loader.dispose();
            this.ktx2Loader = undefined;
        }
        
        if (this.sceneOrtho) {
            this.sceneOrtho.clear();
            this.sceneOrtho = undefined;
        }
        if (this.stage) {
            this.stage.clear();
            this.stage = undefined;
        }

        const countBtn = document.getElementById('count') as HTMLButtonElement;
        countBtn.removeEventListener('click', this.onClick);
    }


    public destroy(): void {
        this.onDraw = _.noop.bind(this);
        this.reset();

        document.body.removeChild(CompressedThreeTest.renderer!.domElement);
        CompressedThreeTest.renderer!.resetState();
        CompressedThreeTest.renderer!.dispose();
        CompressedThreeTest.renderer = undefined;

        CompressedThreeTest.cameraOrtho!.clear();
        CompressedThreeTest.cameraOrtho = undefined;

        window.removeEventListener('resize', this.onResize);
        this.onClick = (): Promise<void> => {
            return Promise.resolve();
        };
        this.onResize = _.noop.bind(this);
    }
}
