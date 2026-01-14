import { Howl } from 'howler';

type SoundMap = Record<string, Howl>;
const sounds: SoundMap = {};

// TODO: Implement sound player using the "howler" package
export const sound = {
    add: (alias: string, url: string): void => {
        if (sounds[alias]) return;

        sounds[alias] = new Howl({
            src: [url],
            preload: true,
            volume: 1
        });
    },
    play: (alias: string): void => {
        const snd = sounds[alias];
        if (!snd) return;

        snd.stop();
        snd.play();
    }    
};