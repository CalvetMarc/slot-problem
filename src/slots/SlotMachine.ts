import * as PIXI from 'pixi.js';
import 'pixi-spine';
import { Reel } from './Reel';
import { Sound } from '../utils/Sound';
import { AssetLoader } from '../utils/AssetLoader';
import {Spine} from "pixi-spine";

const REEL_COUNT = 4;

const TOP_CONTENT_MARGIN = 55;
const BOTTOM_CONTENT_MARGIN = 50;

const BACKGROUND_COVER_MARGIN_X = 30;
const BACKGROUND_COVER_MARGIN_Y = 30;

const HORIZONTAL_CONTENT_MARGIN = 100;

export class SlotMachine {
    public container: PIXI.Container;

    private app: PIXI.Application;
    private contentContainer: PIXI.Container;
    private reels: Reel[];

    private winAnimation: Spine | null = null;
    private frameSpine: Spine | null = null;
    private background!: PIXI.Sprite;
    private spinButton: PIXI.Sprite | null = null;

    private displayAreaWidth!: number;
    private displayAreaHeight!: number;

    private isSpinning: boolean = false;

    constructor(app: PIXI.Application) {
        this.app = app;
        this.container = new PIXI.Container();
        this.contentContainer = new PIXI.Container();

        this.container.addChild(this.contentContainer);

        this.reels = [];

        // Center the slot machine
        this.container.x = this.app.screen.width / 2;
        this.container.y = this.app.screen.height / 2;
        
        this.initSpineAnimations();

        this.createBackground();      

        this.applyFrameMask();

        this.createReels(); 
    }    

    private initSpineAnimations(): void {
        try {
            const frameSpineData = AssetLoader.getSpine('frame');
            if (frameSpineData) {
                this.frameSpine = new Spine(frameSpineData);                

                if (this.frameSpine.state.hasAnimation('idle')) {
                    this.frameSpine.state.setAnimation(0, 'idle', true);
                }

                this.container.addChild(this.frameSpine);
            }

            const winSpineData = AssetLoader.getSpine('win');
            if (winSpineData) {
                this.winAnimation = new Spine(winSpineData); 

                this.winAnimation.visible = false;

                this.container.addChild(this.winAnimation);
            }
        } catch (error) {
            console.error('Error initializing spine animations:', error);
        }
    }

    private createBackground(): void {
        try {
            const bounds = this.frameSpine!.getLocalBounds();      

            this.background = new PIXI.Sprite(AssetLoader.getTexture('background'));
            this.background.anchor.set(0.5);

            this.background.position.set(this.frameSpine!.x, this.frameSpine!.y);

            const innerW = bounds.width - BACKGROUND_COVER_MARGIN_X * 2;
            const innerH = bounds.height - BACKGROUND_COVER_MARGIN_Y * 2;

            //Scale the background to cover the frame
            const scale = Math.max(innerW / this.background.texture.width, innerH / this.background.texture.height);
            this.background.scale.set(scale);

            this.contentContainer.addChild(this.background);
        } catch (error) {
            console.error('Error creating background:', error);
        }
    }

    private applyFrameMask(): void {
        if (!this.frameSpine || !this.background) return;

        const bounds = this.frameSpine.getLocalBounds();        

        //Create a mask to hide overflowing symbols
        const mask = new PIXI.Graphics();
        mask.beginFill(0xffffff);

        mask.drawRect(bounds.x + BACKGROUND_COVER_MARGIN_X, bounds.y + BACKGROUND_COVER_MARGIN_Y, 
            bounds.width - (BACKGROUND_COVER_MARGIN_X * 2), bounds.height - (BACKGROUND_COVER_MARGIN_Y * 2));

        mask.endFill();

        mask.x = this.frameSpine.x;
        mask.y = this.frameSpine.y;

        this.contentContainer.addChild(mask);
        this.contentContainer.mask = mask;

        this.displayAreaWidth = mask.width - (2 * HORIZONTAL_CONTENT_MARGIN);
        this.displayAreaHeight = mask.height - (2 * (TOP_CONTENT_MARGIN + BOTTOM_CONTENT_MARGIN));
    }

    private createReels(): void {        
        // Create each reel       
        for (let i = 0; i < REEL_COUNT; i++) {
            const reel = new Reel(this.displayAreaWidth);
            this.contentContainer.addChild(reel.container);

            const verticalOffset = TOP_CONTENT_MARGIN - BOTTOM_CONTENT_MARGIN;
            reel.container.position.set(-this.displayAreaWidth / 2, (-this.displayAreaHeight / 2) + verticalOffset + (i * (this.displayAreaHeight / (REEL_COUNT - 1))));

            this.reels.push(reel);
        }
    }

    public update(delta: number): void {
        // Update each reel
        for (const reel of this.reels) {
            reel.update(delta);
        }
    }

    public spin(): void {
        if (this.isSpinning) return;

        this.isSpinning = true;

        // Play spin sound
        Sound.play('spin');

        // Disable spin button
        if (this.spinButton) {
            this.spinButton.texture = AssetLoader.getTexture('spinButtonInactive');
            this.spinButton.interactive = false;
        }

        for (let i = 0; i < this.reels.length; i++) {
            setTimeout(() => {
                this.reels[i].startSpin();
            }, i * 200);
        }

        // Stop all reels after a delay
        setTimeout(() => {
            this.stopSpin();
        }, 500 + (this.reels.length - 1) * 200);

    }

    private stopSpin(): void {
        for (let i = 0; i < this.reels.length; i++) {
            setTimeout(() => {
                this.reels[i].stopSpin();

                // If this is the last reel, check for wins and enable spin button
                if (i === this.reels.length - 1) {
                    setTimeout(() => {
                        Sound.stop('spin')
                        this.checkWin();
                        this.isSpinning = false;

                        if (this.spinButton) {
                            this.spinButton.texture = AssetLoader.getTexture('spinButtonActive');
                            this.spinButton.interactive = true;
                        }
                    }, 500);
                }
            }, i * 400);
        }
    }

    private checkWin(): void {
        // Simple win check - just for demonstration
        const randomWin = Math.random() < 0.3; // 30% chance of winning

        if (randomWin) {
            Sound.play('win');
            console.log('Winner!');

            if (this.winAnimation) {
                // Play the win animation found in "big-boom-h" spine
                this.winAnimation.visible = true;

                this.winAnimation.state.clearTracks();
                this.winAnimation.skeleton.setToSetupPose();

                if (this.winAnimation.state.hasAnimation('start')) {
                    this.winAnimation.state.setAnimation(0, 'start', false);
                }
                
                this.winAnimation.state.addListener({
                    complete: () => {
                        this.winAnimation!.visible = false;
                        this.winAnimation!.state.clearListeners();
                    }
                });        
            }
        }
    }

    public setSpinButton(button: PIXI.Sprite): void {
        this.spinButton = button;
    }    

}
