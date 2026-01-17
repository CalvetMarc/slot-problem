/* eslint-disable @typescript-eslint/no-explicit-any */
import { Reel } from './Reel';

jest.mock('pixi.js', () => {
    class MockSprite {
        texture: any;
        anchor = { set: jest.fn() };
        scale = { set: jest.fn() };
        position = { x: 0, y: 0, set: jest.fn() };

        constructor() {}
    }

    class MockContainer {
        addChild = jest.fn();
    }

    return {
        Sprite: MockSprite,
        Container: MockContainer,
        Texture: class {},
    };
});

jest.mock('../utils/AssetLoader', () => ({
    AssetLoader: {
        getTexture: jest.fn(() => ({
        width: 100,
        height: 100,
        })),
    },
}));

describe('Reel', () => {
    it('should start spinning when startSpin is called', () => {
        const reel = new Reel(600);

        reel.startSpin();

        expect((reel as any).isSpinning).toBe(true);
        expect((reel as any).speed).toBeGreaterThan(0);
    });

    it('should stop spinning when stopSpin is called', () => {
        const reel = new Reel(600);

        reel.startSpin();
        reel.stopSpin();

        expect((reel as any).isSpinning).toBe(false);
    });

    it('should not update symbols when not spinning', () => {
        const reel = new Reel(600);

        const symbols = (reel as any).symbols;
        const initialPositions = symbols.map((s: any) => s.position.x);

        reel.update(1);

        const updatedPositions = symbols.map((s: any) => s.position.x);
        expect(updatedPositions).toEqual(initialPositions);
    });

    it('should fully stop when speed is below threshold', () => {
        const reel = new Reel(600);

        (reel as any).isSpinning = false;
        (reel as any).speed = 0.1;

        reel.update(1);

        expect((reel as any).speed).toBe(0);
    });

});

