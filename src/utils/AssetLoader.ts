import * as PIXI from 'pixi.js';
import { IMAGES, ImagesKey, SPINES, SpinesKey, SOUNDS } from '../assets/manifest';
import { ISkeletonData } from 'pixi-spine';
import { Sound } from './Sound';

interface SpineAsset {
    spineData: ISkeletonData;
}

export class AssetLoader {
    private static readonly IMAGES_PATH = 'assets/images/';
    private static readonly SPINES_PATH = 'assets/spines/';

    private static textureCache: Partial<Record<ImagesKey, PIXI.Texture>> = {};
    private static spineCache: Partial<Record<SpinesKey, ISkeletonData>> = {};

    private static loaded = false;

    public static async loadAssets(): Promise<void> {
        if(this.loaded) return;

        try {
            PIXI.Assets.addBundle('images', Object.entries(IMAGES).map(([key, file]) => ({
                    name: key,
                    srcs: this.IMAGES_PATH + file,
                }))
            );

            PIXI.Assets.addBundle('spines', Object.entries(SPINES).map(([key, file]) => ({
                    name: key,
                    srcs: this.SPINES_PATH + file,
                }))
            );

            const imageAssets = await PIXI.Assets.loadBundle('images');
            console.log('Images loaded successfully');

            for (const [key, texture] of Object.entries(imageAssets)) {
                this.textureCache[key as ImagesKey] = texture as PIXI.Texture;
            }

            try {
                const spineAssets = await PIXI.Assets.loadBundle('spines');
                console.log('Spine animations loaded successfully');

                for (const [key, spine] of Object.entries(spineAssets)) {
                    this.spineCache[key as SpinesKey] = (spine as SpineAsset).spineData;
                }
            } catch (error) {
                console.error('Error loading spine animations:', error);
            }

            Sound.load(SOUNDS);

            this.loaded = true;
            console.log('Assets loaded successfully');
        } catch (error) {
            console.error('Error loading assets:', error);
            throw error;
        }
    }

    public static getTexture(name: ImagesKey): PIXI.Texture {
        return this.textureCache[name]!;
    }

    public static getSpine(name: SpinesKey): ISkeletonData {
        return this.spineCache[name]!;
    }
}
