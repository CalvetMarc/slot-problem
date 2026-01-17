/* eslint-disable @typescript-eslint/no-explicit-any */
import { SlotMachine } from './SlotMachine';
import { Reel } from './Reel';

jest.mock('pixi.js', () => {
    class MockContainer {
        addChild = jest.fn();
        mask: any;
        scale = { set: jest.fn() };
        position = { set: jest.fn() };
        x = 0;
        y = 0;
    }

    class MockSprite {
        anchor = { set: jest.fn() };
        scale = { set: jest.fn() };
        position = { set: jest.fn() };
        tint: number = 0;
        texture: any;
    }

    class MockGraphics {
        beginFill = jest.fn();
        drawRect = jest.fn();
        endFill = jest.fn();
        x = 0;
        y = 0;
        width = 500;
        height = 300;
    }

    return {
        Container: MockContainer,
        Sprite: MockSprite,
        Graphics: MockGraphics,
    };
});

jest.mock('pixi-spine', () => ({
    Spine: jest.fn().mockImplementation(() => ({
        state: {
            hasAnimation: jest.fn(() => false),
            setAnimation: jest.fn(),
            addListener: jest.fn(),
            clearTracks: jest.fn(),
            clearListeners: jest.fn()
        },
        skeleton: {
            setToSetupPose: jest.fn(),
        },
        visible: false,
        getLocalBounds: (): { x: number; y: number; width: number; height: number } => ({
            x: 0,
            y: 0,
            width: 500,
            height: 300,
        }),
        x: 0,
        y: 0,
    }))
}));

jest.mock('../utils/AssetLoader', () => ({
    AssetLoader: {
        getTexture: jest.fn(() => ({
            width: 100,
            height: 100,
        })),
        getSpine: jest.fn(() => ({})),
    }
}));

jest.mock('../utils/Sound', () => ({
    Sound: {
        play: jest.fn(),
        stop: jest.fn(),
    }
}));

describe('SlotMachine', () => {
    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });

    afterEach(() => {
        (console.error as jest.Mock).mockRestore();
    });

    it('should create the correct number of reels', () => {
        const slotMachine = new SlotMachine();

        const reels = (slotMachine as any).reels;

        expect(reels).toBeDefined();
        expect(reels.length).toBe(4);
        expect(reels.every((r: any) => r instanceof Reel)).toBe(true);
    });
});
