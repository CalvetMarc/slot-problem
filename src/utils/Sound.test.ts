/* eslint-disable @typescript-eslint/no-explicit-any */
import { Sound } from './Sound';
import { Howl } from 'howler';

jest.mock('howler', () => {
    return {
        Howl: jest.fn().mockImplementation(() => ({
            play: jest.fn(),
            stop: jest.fn(),
        })),
    };
});

describe('Sound', () => {
    const manifest = {
        spin: 'spin.webm',
        win: 'win.webm',
        spinButton: 'spinButton.webm',
    } as any;

    beforeEach(() => {
        jest.clearAllMocks();

        (Sound as any).loaded = false;
        (Sound as any).sounds = {};
    });

    it('should load sounds from manifest', () => {
        Sound.load(manifest);

        expect(Howl).toHaveBeenCalledTimes(Object.keys(manifest).length);
    });

    it('should play a loaded sound', () => {
        Sound.load(manifest);

        Sound.play('spin' as any);

        const howlInstance = (Howl as jest.Mock).mock.results[0].value;
        expect(howlInstance.play).toHaveBeenCalled();
    });

    it('should stop a loaded sound', () => {
        Sound.load(manifest);

        Sound.stop('spin' as any);

        const howlInstance = (Howl as jest.Mock).mock.results[0].value;
        expect(howlInstance.stop).toHaveBeenCalled();
    });

    it('should not throw if sound does not exist', () => {
        expect(() => Sound.play('not-existing' as any)).not.toThrow();
    });
});
