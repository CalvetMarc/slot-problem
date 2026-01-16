export const IMAGES = {
    symbol1: 'symbol1.png',
    symbol2: 'symbol2.png',
    symbol3: 'symbol3.png',
    symbol4: 'symbol4.png',
    symbol5: 'symbol5.png',
    background: 'background.png',
    spinButtonActive: 'button_spin.png',
    spinButtonInactive: 'button_spin_disabled.png'
} as const;

export type ImagesKey = keyof typeof IMAGES;

export const SPINES = {
    win: 'big-boom-h.json',
    frame: 'base-feature-frame.json'
} as const;

export type SpinesKey = keyof typeof SPINES;

export const SOUNDS = {
    spin: 'Reel spin.webm',
    win: 'win.webm',
    spinButton: 'Spin button.webm',
} as const;

export type SoundKey = keyof typeof SOUNDS;