import * as PIXI from 'pixi.js';
import { SlotMachine } from './slots/SlotMachine';
import { AssetLoader } from './utils/AssetLoader';
import { UI } from './ui/UI';

const baseWidth = 1280;
const baseHeight = 800;

export class Game {
    private app: PIXI.Application;
    private gameRoot!: PIXI.Container;
    private slotMachine!: SlotMachine;
    private ui!: UI;

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

            this.slotMachine = new SlotMachine(this.app);
            this.gameRoot.addChild(this.slotMachine.container);

            this.ui = new UI(this.app, this.slotMachine);
            this.gameRoot.addChild(this.ui.container);
           
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
