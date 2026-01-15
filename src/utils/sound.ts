import { Howl } from 'howler';

const SOUNDS = {
    spin: 'Reel spin.webm',
    win: 'win.webm',
    spinButton: 'Spin button.webm',
} as const;

type SoundKey = keyof typeof SOUNDS;

// Implement sound player using the "howler" package
export class Sound {
    private static sounds: Partial<Record<SoundKey, Howl>> = {};
    private static readonly BASE_PATH = 'assets/sounds/';

    private static loaded = false;

    static load(): void {
        if(this.loaded) return;

        for (const [alias, file] of Object.entries(SOUNDS)) {
            this.add(alias as SoundKey, file);
        }

        this.loaded = true;
    }  

    static play(alias: SoundKey): void {
        const snd = this.sounds[alias];
        if (!snd) return;

        snd.play();
    }

    static stop(alias: SoundKey): void {
        const snd = this.sounds[alias];
        if (!snd) return;

        snd.stop();
    }

    private static add(alias: SoundKey, url: string): void {
        if (this.sounds[alias]) return;

        this.sounds[alias] = new Howl({
            src: [this.BASE_PATH + url],
            preload: true,
            html5: true,
            volume: 1
        });
    }
}