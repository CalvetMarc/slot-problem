import * as PIXI from 'pixi.js';
import { SlotMachine } from './slots/SlotMachine';
import { AssetLoader } from './utils/AssetLoader';
import { Button } from './ui/Button';
import { GameEvents } from './utils/GameEvents';

const baseWidth = 1280;
const baseHeight = 800;

export class Game {
    private app: PIXI.Application;
    private gameRoot!: PIXI.Container;
    private slotMachine!: SlotMachine;
    private spinButton!: Button;

    constructor() {
        this.app = new PIXI.Application({
            width: baseWidth,
            height: baseHeight,
            backgroundColor: 0x1099bb,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true,
        });

        const gameContainer = document.getElementById('game-container');
        if (gameContainer) {
            gameContainer.appendChild(this.app.view as HTMLCanvasElement);
        }

        this.init = this.init.bind(this);
        this.resize = this.resize.bind(this);

        window.addEventListener('resize', this.resize);
    }

    public async init(): Promise<void> {
        try {
            await AssetLoader.loadAssets();

            this.gameRoot = new PIXI.Container();
            this.app.stage.addChild(this.gameRoot);

            this.slotMachine = new SlotMachine();
            this.gameRoot.addChild(this.slotMachine);
            // Center the slot machine
            this.slotMachine.x = this.app.screen.width / 2;
            this.slotMachine.y = this.app.screen.height / 2;        

            this.spinButton = new Button();
            this.gameRoot.addChild(this.spinButton);
            // Center the button horizontally
            this.spinButton.x = this.app.screen.width / 2;
            this.spinButton.y = this.app.screen.height - 50;

            //Handle Events
            this.slotMachine.on(GameEvents.SpinStarted, this.spinButton.disable);
            this.slotMachine.on(GameEvents.SpinFinished, this.spinButton.enable);
            this.spinButton.on(GameEvents.SpinRequested, this.slotMachine.spin);
           
            this.app.ticker.add(this.update.bind(this));

            this.resize();

            console.log('Game initialized successfully');
        } catch (error) {
            console.error('Error initializing game:', error);
        }
    }

    private update(delta: number): void {
        if (this.slotMachine) {
            this.slotMachine.update(delta);
        }
    }

    private resize(): void {
        if (!this.app || !this.app.renderer) return;

        const gameContainer = document.getElementById('game-container');
        if (!gameContainer) return;

        const w = gameContainer.clientWidth;
        const h = gameContainer.clientHeight;

        // Calculate scale to fit the container while maintaining aspect ratio
        const scale = Math.min(w / baseWidth, h / baseHeight);

        this.app.renderer.resize(w, h);
        this.gameRoot.scale.set(scale);
        
        // Center the game
        this.gameRoot.x = (w - (baseWidth * scale)) / 2;
        this.gameRoot.y = (h - (baseHeight * scale)) / 2;
    }
}
