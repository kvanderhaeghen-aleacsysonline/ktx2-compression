import * as Three from 'three';
import { Constants, KTX2Types } from '../constants/constants';
import _ from 'lodash';
import { getOSType } from '../utils/getOSType';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { CompressedThreeKTX2 } from '../models/compressedThreeKTX2';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { wait } from '../utils/wait';
import { CompressedThreeModelKTX2 } from '../models/compressedThreeModelKTX2';
import { getKTX2Type } from '../utils/getKTX2Type';

export class CompressedThreeTest {
    private static renderer?: Three.WebGLRenderer;
    private static cameraOrtho?: Three.OrthographicCamera;

    private sceneOrtho?: Three.Scene;
    private sceneLight?: Three.DirectionalLight;
    private stage?: Three.Group;
    private loader: Three.TextureLoader = new Three.TextureLoader();
    // private compressedLoader: ThreeKTXLoader = new ThreeKTXLoader(this.loader.manager);
    private ktx2Loader: KTX2Loader = new KTX2Loader(this.loader.manager);
    private gltfLoader: GLTFLoader = new GLTFLoader(this.loader.manager);
    private compressedImage?: CompressedThreeKTX2;
    private compressedModel?: CompressedThreeModelKTX2;

    private onDraw: () => void = this.draw.bind(this);
    private onClick: () => Promise<void> = this.setup.bind(this);
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

        this.ktx2Loader.setTranscoderPath(window.location.origin + '/');
        this.ktx2Loader.detectSupport(CompressedThreeTest.renderer);
        window.addEventListener('resize', this.onResize);

        this.setup();
        this.resize();
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
        this.createScene();
        this.compressedImage = new CompressedThreeKTX2(this.stage!, this.ktx2Loader);
        this.compressedModel = new CompressedThreeModelKTX2(this.stage!, this.ktx2Loader, this.gltfLoader);

        await this.compressedImage!.create(getKTX2Type());
        await this.compressedModel!.create(getKTX2Type(), 1);
        await this.createLogo();

        // requestAnimationFrame(this.onDraw);
    }


    private async createLogo(): Promise<void> {
        return new Promise<void>(async (resolve) => {
            const url = Constants.LOGO_LIST[1];
            this.loader.load(
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
        if (!this.compressedImage || !this.compressedModel) return;

        this.compressedImage!.update();
        this.compressedModel!.update();

        CompressedThreeTest.renderer!.clear();
        CompressedThreeTest.renderer!.render(this.sceneOrtho, CompressedThreeTest.cameraOrtho!);
        requestAnimationFrame(this.onDraw);
    }

    private reset(): void {
        if (this.compressedImage) {
            this.compressedImage.reset();
            this.compressedImage = undefined;
        }
        if (this.compressedModel) {
            this.compressedModel.reset();
            this.compressedModel = undefined;
        }
        
        if (this.sceneOrtho) {
            this.sceneOrtho.clear();
            this.sceneOrtho = undefined;
        }
        if (this.stage) {
            this.stage.clear();
            this.stage = undefined;
        }
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
