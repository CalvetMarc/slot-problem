import * as PIXI from 'pixi.js';
import 'pixi-spine';
import { Reel } from './Reel';
import { Sound } from '../utils/Sound';
import { AssetLoader } from '../utils/AssetLoader';
import {Spine} from "pixi-spine";
import { GameEvents } from '../utils/GameEvents';

const REEL_COUNT = 4;

const TOP_CONTENT_MARGIN = 55;
const BOTTOM_CONTENT_MARGIN = 50;

const BACKGROUND_COVER_MARGIN_X = 30;
const BACKGROUND_COVER_MARGIN_Y = 30;

const HORIZONTAL_CONTENT_MARGIN = 100;

const SPIN_START_DELAY_PER_REEL = 200; //MS
const SPIN_SLOW_DOWN_START_DELAY = 500; //MS
const SPIN_STOP_DELAY_PER_REEL = 400; //MS
const SPIN_RESULT_DELAY = 300; //MS

export class SlotMachine extends PIXI.Container {
    private contentContainer: PIXI.Container;
    private reels: Reel[];

    private winAnimation: Spine | null = null;
    private frameSpine: Spine | null = null;
    private background!: PIXI.Sprite;

    private displayAreaWidth!: number;
    private displayAreaHeight!: number;

    private isSpinning: boolean = false;

    constructor() {
        super();
        
        this.contentContainer = new PIXI.Container();
        this.addChild(this.contentContainer);

        this.reels = [];
        
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

                this.setFrameAnimation("static", true);

                this.addChild(this.frameSpine);
            }

            const winSpineData = AssetLoader.getSpine('win');
            if (winSpineData) {
                this.winAnimation = new Spine(winSpineData); 

                this.winAnimation.visible = false;

                this.addChild(this.winAnimation);
            }
        } catch (error) {
            console.error('Error initializing spine animations:', error);
        }
    }

    private createBackground(): void {
        try {
            const bounds = this.frameSpine!.getLocalBounds();      

            this.background = new PIXI.Sprite(AssetLoader.getTexture('background'));
            this.background.tint = 0x555555;
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

    public spin = async (): Promise<void> => {
        if (this.isSpinning) return;

        this.isSpinning = true;
        this.emit(GameEvents.SpinStarted);

        //Play spin animation
        this.setFrameAnimation("idle", true);
        // Play spin sound
        Sound.play('spin');

        // Start reels one by one
        for (const reel of this.reels) {
            reel.startSpin();
            await SlotMachine.delay(SPIN_START_DELAY_PER_REEL);
        }

        // Let them spin for a bit
        await SlotMachine.delay(SPIN_SLOW_DOWN_START_DELAY);

        // Stop reels one by one
        for (const reel of this.reels) {
            reel.stopSpin();
            await SlotMachine.delay(SPIN_STOP_DELAY_PER_REEL);
        }

        // Wait before showing result
        await SlotMachine.delay(SPIN_RESULT_DELAY);

        Sound.stop('spin');
        this.setFrameAnimation("static", true);

        this.checkWin();

        this.isSpinning = false;
        this.emit(GameEvents.SpinFinished);
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

    private setFrameAnimation(animationName: string, loop: boolean = true): void {
        if (!this.frameSpine) return;

        if (this.frameSpine.state.hasAnimation(animationName)) {
            this.frameSpine.state.setAnimation(0, animationName, loop);
        } 
    }

    private static delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
