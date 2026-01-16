import * as PIXI from 'pixi.js';
import { AssetLoader } from '../utils/AssetLoader';
import { Sound } from '../utils/Sound';
import { GameEvents } from '../utils/GameEvents';

const BUTTON_SCALE = 0.75;

export class Button extends PIXI.Container {
    private spinButton!: PIXI.Sprite;

    constructor() {
        super();
        this.createSpinButton();        
    }

    private createSpinButton(): void {
        try {
            this.spinButton = new PIXI.Sprite();
            this.enable();

            this.spinButton.anchor.set(0.5);
            this.spinButton.scale.set(BUTTON_SCALE);

            this.spinButton.interactive = true;
            this.spinButton.cursor = 'pointer';

            this.spinButton.on('pointerdown', this.onSpinButtonClick);
            this.spinButton.on('pointerover', this.onButtonOver);
            this.spinButton.on('pointerout', this.onButtonOut);

            this.addChild(this.spinButton);

        } catch (error) {
            console.error('Error creating spin button:', error);
        }
    }

    private onSpinButtonClick = (): void => {
        Sound.play('spinButton');
        this.emit(GameEvents.SpinRequested);
    }

    private onButtonOver = (event: PIXI.FederatedPointerEvent): void => {
        (event.currentTarget as PIXI.Sprite).scale.set(BUTTON_SCALE * 1.05);
    }

    private onButtonOut = (event: PIXI.FederatedPointerEvent): void => {
        (event.currentTarget as PIXI.Sprite).scale.set(BUTTON_SCALE);
    }

    public disable = (): void => {
        this.spinButton.interactive = false;
        this.spinButton.texture = AssetLoader.getTexture('spinButtonInactive');
    }
    public enable = (): void => {
        this.spinButton.interactive = true;
        this.spinButton.texture = AssetLoader.getTexture('spinButtonActive');
    }
}
