import * as PIXI from 'pixi.js';
import { AssetLoader } from '../utils/AssetLoader';
import { ImagesKey } from '../assets/manifest';

const SYMBOL_KEYS: ImagesKey[] = [
    'symbol1',
    'symbol2',
    'symbol3',
    'symbol4',
    'symbol5',
];

const SYMBOL_SIZE = 150;
const SYMBOLS_PER_REEL = 6;
const EXTRA_SYMBOLS = 1; // Extra symbols to allow seamless horizontal looping 

const SPIN_SPEED = 50; // Pixels per frame
const SLOWDOWN_RATE = 0.95; // Rate at which the reel slows down

export class Reel {
    public container: PIXI.Container;

    private symbols: PIXI.Sprite[];
    private totalSymbolCount: number;
    private speed: number = 0;
    private isSpinning: boolean = false;

    private symbolsSpacing: number;

    private leftLimit: number;
    private rightLimit: number;

    constructor(displayWidthArea: number) {
        this.container = new PIXI.Container();
        this.symbols = [];

        this.symbolsSpacing = displayWidthArea / (SYMBOLS_PER_REEL - 1);
        this.totalSymbolCount = SYMBOLS_PER_REEL + EXTRA_SYMBOLS;

        this.leftLimit = -this.symbolsSpacing;
        this.rightLimit = this.symbolsSpacing * (this.totalSymbolCount - 1);

        this.createSymbols();       
    }

    private createSymbols(): void {
        // Create symbols for the reel, arranged horizontally
        for(let i = 0; i < this.totalSymbolCount; i++){
            const symbol = this.createRandomSymbol();
            this.symbols.push(symbol);            
            this.container.addChild(symbol);

            this.snapToColumn(symbol, i);
        }
    }

    private createRandomSymbol(): PIXI.Sprite {     
        // Create a sprite with the texture
        const newSprite = new PIXI.Sprite();
        this.assignRandomTexture(newSprite);

        return newSprite;
    }

    private assignRandomTexture(symbol: PIXI.Sprite): void{
        const newTexture = this.getRandomTexture();
        symbol.texture = newTexture;

        symbol.anchor.set(0.5);
        symbol.scale.set(SYMBOL_SIZE / newTexture.width);
    }

    private getRandomTexture(): PIXI.Texture{
        // Get a random symbol texture
        const index = Math.floor(Math.random() * SYMBOL_KEYS.length);
        return AssetLoader.getTexture(SYMBOL_KEYS[index]);
    }    

    public update(delta: number): void {
        if (!this.isSpinning && this.speed === 0) return;

        // Move symbols horizontally
        for(let i = this.totalSymbolCount - 1; i >= 0; i--){
            const symbol = this.symbols[i];

            symbol.position.x -= this.speed * delta;
            const offsetDistance = symbol.position.x - this.leftLimit;

            // Recycle symbol when it exits the reel on the left
            if(offsetDistance < 0){
                this.recycleSymbol(symbol, offsetDistance);
            }
        }

        // If we're stopping, slow down the reel
        if (!this.isSpinning && this.speed > 0) {
            this.speed *= SLOWDOWN_RATE;

            // If speed is very low, stop completely and snap to grid
            if (this.speed < 0.5) {
                this.speed = 0;
                this.snapToGrid();
            }
        }
    }

    private snapToGrid(): void {
        // Snap symbols to horizontal grid positions
        this.symbols.sort((a, b) => a.position.x - b.position.x);
        
        for (let i = 0; i < this.symbols.length; i++) {
            this.snapToColumn(this.symbols[i], i);
        }
    }

    private snapToColumn(symbol: PIXI.Sprite, index: number): void{
       symbol.position.set(this.symbolsSpacing * index, 0);
    }

    private recycleSymbol(symbol: PIXI.Sprite, offsetDistance: number): void{    
        const loopWidth = this.rightLimit - this.leftLimit;

        let x = this.rightLimit + offsetDistance;
        // Wrap symbol position to handle large deltas safely
        x = ((x - this.leftLimit) % loopWidth + loopWidth) % loopWidth + this.leftLimit;

        symbol.position.x = x;

        this.assignRandomTexture(symbol);
    }

    public startSpin(): void {
        this.isSpinning = true;
        this.speed = SPIN_SPEED;
    }

    public stopSpin(): void {
        this.isSpinning = false;
        // The reel will gradually slow down in the update method
    }
}
