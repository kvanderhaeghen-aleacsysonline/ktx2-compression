import { Constants, KTX2Types } from '../constants/constants';
import * as Three from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import _ from 'lodash';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';

export class CompressedThreeModelKTX2 {
    private loader?: KTX2Loader;
    private gltfLoader: GLTFLoader;
    private stage: Three.Group;
    private modelTexture?: Three.CompressedTexture;
    private modelGLTF?: GLTF;
    private models: any[] = [];
    private textures: Three.CompressedTexture[] = [];
    private modelCount = 1;

    constructor(stage: Three.Group, loader: KTX2Loader, gltfLoader: GLTFLoader) {
        this.loader = loader;
        this.gltfLoader = gltfLoader;
        this.stage = stage;
    }

    public async create(type: KTX2Types, modelCount: number): Promise<void> {
        return new Promise<void>(async (resolve) => {
            this.modelCount = modelCount;
            await new Promise<Three.CompressedTexture>(async (texResolve) => {
                if (!this.modelTexture) {
                    const url = Constants.MODEL_KTX2_LIST[type];
                    console.log('Three Model - Loading KTX2.0 texture:', url);
                    this.modelTexture = await this.loader!.loadAsync(url, this.getOnProgress.bind(this));
                    if (this.modelTexture) {
                        texResolve(this.modelTexture);
                    }
                } else {
                    texResolve(this.modelTexture);
                    console.warn('Three.js Texture already exists!');
                }
            });

            await new Promise<GLTF>((modelResolve) => {
                if (!this.modelGLTF) {
                    const url = Constants.MODEL_PATH;
                    console.log('Three Model - Loading model:', url);
                    this.gltfLoader.load(url, this.getOnModelCompleteHandler(modelResolve), undefined, undefined);
                } else {
                    modelResolve(this.modelGLTF);
                    console.warn('Three.js GLTF already exists!');
                }
            });
            resolve();
        });
    }

    private getOnCompleteHandler(
        resolve: (value: Three.CompressedTexture | PromiseLike<Three.CompressedTexture>) => void
    ): (obj: Three.CompressedTexture) => void {
        return (texture: Three.CompressedTexture): void => {
            resolve(texture);
        };
    }

    private getOnProgress(event: ProgressEvent<EventTarget>): void {
        console.error('progress:', event);
    }

    private getOnError(event: ErrorEvent): void {
        console.error('error:', event);
    }

    private getOnModelCompleteHandler(resolve: (gltf: GLTF) => void): (gltf: GLTF) => void {
        return (gltf: GLTF): void => {
            this.modelGLTF = gltf;
            this.createModels(gltf);
            resolve(gltf);
        };
    }

    private createModels(gltf: GLTF): void {
        for (let i = 0; i < this.modelCount; i++) {
            const model = (SkeletonUtils as any).clone(gltf.scene);
            const mesh = model.children.find((v: Three.Object3D) => v.name === Constants.MESH_NAME) as Three.SkinnedMesh;
            const oldTex = (mesh.material as Three.MeshBasicMaterial).map!.clone();
            const newTex = this.modelTexture!.clone();
            const material = new Three.MeshStandardMaterial({ map: newTex, fog: false });
            mesh.material = material;
            mesh.material.needsUpdate = true;
            oldTex?.dispose();
            this.models.push(model);
            this.textures.push(newTex);

            model.scale.set(100, 100, 100);
            model.position.set(_.random(-500, 500), _.random(-250, 250), -100);
            model.rotation.x = Math.PI / 4;
            model.rotation.y = Math.PI / 4;
            this.stage.add(model);
        }
    }

    public reset(): void {
        if(this.textures) {
            console.error(this.textures);
            this.textures.forEach((texture)=> {
                texture.dispose();
            });
            this.textures = [];
        }
        if (this.stage) {
            this.stage.traverse((object) => {
                if (object instanceof Three.Mesh) {
                    (object.material as Three.Material).dispose();
                }
            });
            this.stage.clear();
        }
        if (this.models) {
            this.models.forEach((model) => {
                this.stage.remove(model);
            })
        }
        if (this.modelGLTF) {
            this.modelGLTF.scenes.forEach((scene) => {
                scene.traverse((object) => {
                    if (object instanceof Three.Mesh) {
                        const material = (object.material as Three.MeshBasicMaterial);
                        material.map?.dispose();
                        material.dispose();
                    }
                });
            });
            this.modelGLTF = undefined;
        }
        if (this.modelTexture) {
            this.modelTexture.dispose();
            this.modelTexture = undefined;
       }
    }

    public update(): void {}
}
