import { Constants, ExtensionTypes } from './constants/constants';
import { CompressedThreeTest } from './views/compressedThreeTest';
import { CompressionPixiTest } from './views/compressedPixiTest';
import { getExtensionType } from './utils/getKTX2Type';

export interface IGame {
    launch(idToChange: string, config: unknown): Promise<void>;
    reload(): Promise<void>;
}

export class Game implements IGame {
    private isPixi = true;
    private buttonRenderer?: HTMLButtonElement;
    private buttonRefresh?: HTMLButtonElement;

    private onClickCompression: () => void = this.clickCompressionTest.bind(this);
    private onReload: () => void = this.reload.bind(this);

    private threeTest: CompressedThreeTest | undefined = undefined;
    private pixiTest: CompressionPixiTest | undefined = undefined;

    public launch(idToChange: string, config: unknown): Promise<void> {
        this.buttonRenderer = document.getElementById('swap') as HTMLButtonElement;
        this.buttonRenderer.innerText = this.isPixi ? Constants.PIXI_TEXT : Constants.THREE_TEXT;
        this.buttonRefresh = document.getElementById('reload') as HTMLButtonElement;

       

        const compressionDropdown = document.getElementById("compression")! as HTMLSelectElement;
        compressionDropdown.addEventListener('click', () => {
            compressionDropdown.classList.toggle("active");
        });

        const extensionDropdown = document.getElementById("extension")! as HTMLSelectElement;
        extensionDropdown.addEventListener('click', () => {
            extensionDropdown.classList.toggle("active");
            this.checkExtension(compressionDropdown);
        });

        this.checkExtension(compressionDropdown);
        return this.compressionTest();
    }

    private checkExtension(element: HTMLSelectElement): void {
        const extension = getExtensionType();
        if (extension !== ExtensionTypes.KTX2) element.disabled = true;
        else element.disabled = false;
    }

    public async reload(): Promise<void> {
        if (this.isPixi) {
            await this.pixiTest!.reload();
            this.pixiTest!.init();
        } else {
            await this.threeTest!.reload();
            this.threeTest!.init();
        }
        return Promise.resolve();
    }

    public compressionTest(): Promise<void> {
        if (this.isPixi) {
            this.pixiTest = this.isPixi ? new CompressionPixiTest() : undefined;
            this.pixiTest!.init();
        } else {
            this.threeTest = this.isPixi ? undefined : new CompressedThreeTest();
            this.threeTest!.init();
        }
        this.buttonRenderer!.addEventListener('click', this.onClickCompression);
        this.buttonRefresh!.addEventListener('click', this.onReload);
        return Promise.resolve();
    }

    private clickCompressionTest(): void {
        this.destroyAll();

        if (this.isPixi) {
            this.isPixi = false;
            this.threeTest = new CompressedThreeTest();
            this.threeTest.init();
            this.buttonRenderer!.innerText = Constants.THREE_TEXT;
        } else {
            this.isPixi = true;
            this.pixiTest = new CompressionPixiTest();
            this.pixiTest.init();
            this.buttonRenderer!.innerText = Constants.PIXI_TEXT;
        }
    }

    private destroyAll(): void {
        if (this.pixiTest) {
            this.pixiTest.destroy();
            this.pixiTest = undefined;
        }
        if (this.threeTest) {
            this.threeTest.destroy();
            this.threeTest = undefined;
        }
    }

    private removeAllListeners(): void {
        this.buttonRenderer!.removeEventListener('click', this.onClickCompression);
    }
}
