import { Howl } from 'howler';
import { SoundKey } from '../assets/manifest';

// Implement sound player using the "howler" package
export class Sound {
    private static readonly BASE_PATH = 'assets/sounds/';
    private static sounds: Partial<Record<SoundKey, Howl>> = {};

    private static loaded = false;

    /** @internal */
    public static load(manifest: Record<SoundKey, string>): void {
        if(this.loaded) return;

        for (const [key, file] of Object.entries(manifest)) {
            this.sounds[key as SoundKey] = new Howl({
                src: [this.BASE_PATH + file],
                preload: true,
                html5: true,
                volume: 1
            });
        }

        this.loaded = true;
    }  

    public static play(alias: SoundKey): void {
        const snd = this.sounds[alias];
        if (!snd) return;

        snd.play();
    }

    public static stop(alias: SoundKey): void {
        const snd = this.sounds[alias];
        if (!snd) return;

        snd.stop();
    }
}