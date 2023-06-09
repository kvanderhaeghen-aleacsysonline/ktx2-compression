import { Constants, ExtensionTypes, KTX2Types, KTXTypes } from '../constants/constants';
import * as Three from 'three';
import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import _ from 'lodash';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { KTXLoader } from 'three/examples/jsm/loaders/KTXLoader';
import { LabelTypes, setLabelTime } from '../utils/labelTime';
import { TextureData } from '../types/texturedata';

export class CompressedThreeModels {
    private loader?: Three.TextureLoader;
    private loaderKTX?: KTXLoader;
    private loaderKTX2?: KTX2Loader;
    private gltfLoader: GLTFLoader;
    private stage: Three.Group;
    private texture?: Three.Texture;
    private compressedTexture?: Three.CompressedTexture;
    private modelGLTF?: GLTF;
    private models: any[] = [];
    private textures: Three.CompressedTexture[] | Three.Texture [] = [];
    private objectCount = 1;

    constructor(stage: Three.Group, loader: Three.TextureLoader, loaderKTX: KTXLoader, loaderKTX2: KTX2Loader, gltfLoader: GLTFLoader) {
        this.loader = loader;
        this.loaderKTX = loaderKTX;
        this.loaderKTX2 = loaderKTX2;
        this.gltfLoader = gltfLoader;
        this.stage = stage;
    }

    public async create(data: TextureData): Promise<void> {
        return new Promise<void>(async (resolve) => {
            this.objectCount = data.objectCount;
            await new Promise<Three.CompressedTexture | Three.Texture>(async (texResolve) => {
                if (!this.compressedTexture && !this.texture) {
                    let filename = Constants.getCompressedTexture(data.extension, data.type);
                    console.log('Three Model - Loading', data.extension, 'texture:', filename);

                    const startTime = Date.now();
                    switch (data.extension) {
                        case ExtensionTypes.PNG:
                            this.texture = await this.loader!.loadAsync(filename, this.getOnProgress.bind(this));
                            break;
                        case ExtensionTypes.KTX:
                            this.compressedTexture = await this.loaderKTX!.loadAsync(filename, this.getOnProgress.bind(this));
                            break;
                        case ExtensionTypes.KTX2:
                            this.compressedTexture = await this.loaderKTX2!.loadAsync(filename, this.getOnProgress.bind(this));
                            break;
                        default:
                            console.warn('Three cannot load this extension type.');
                            return;
                    }

                    const endTime = Date.now();
                    const difference = endTime - startTime;
                    if(difference > 500 && data.extension === ExtensionTypes.KTX2) {
                        setLabelTime(LabelTypes.Transcoding, difference);
                    } else {
                        setLabelTime(LabelTypes.Loading, difference);
                    }
                    
                    if (this.texture) {
                        texResolve(this.texture);
                    } else if (this.compressedTexture) {
                        texResolve(this.compressedTexture);
                    }
                } else {
                    if (this.texture) {
                        texResolve(this.texture);
                    } else if (this.compressedTexture) {
                        texResolve(this.compressedTexture);
                    }
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
        resolve: (value: Three.CompressedTexture | PromiseLike<Three.CompressedTexture> | Three.Texture | PromiseLike<Three.Texture>) => void
    ): (obj: Three.CompressedTexture | Three.Texture) => void {
        return (texture: Three.CompressedTexture | Three.Texture): void => {
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
        for (let i = 0; i < this.objectCount; i++) {
            const model = (SkeletonUtils as any).clone(gltf.scene);
            const mesh = model.children.find((v: Three.Object3D) => v.name === Constants.MESH_NAME) as Three.SkinnedMesh;
            const oldTex = (mesh.material as Three.MeshBasicMaterial).map!.clone();
            const newTex = this.texture ? this.texture.clone() : this.compressedTexture!.clone();
            const material = new Three.MeshStandardMaterial({ map: newTex, fog: false });
            mesh.material = material;
            mesh.material.needsUpdate = true;
            oldTex?.dispose();
            this.models.push(model);
            this.textures.push(newTex as any);
            

            model.scale.set(100, 100, 100);
            model.position.set(_.random(-500, 500), _.random(-250, 250), -100);
            model.rotation.x = Math.PI / 4;
            model.rotation.y = Math.PI / 4;
            this.stage.add(model);
        }
    }

    public reset(): void {
        if(this.textures) {
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
        if (this.compressedTexture) {
            this.compressedTexture.dispose();
            this.compressedTexture = undefined;
       }
    }

    public update(): void {}
}
