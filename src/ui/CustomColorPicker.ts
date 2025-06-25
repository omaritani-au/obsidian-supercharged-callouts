// src/ui/CustomColorPicker.ts

import { TextComponent, setIcon, Notice } from "obsidian";

// --- TypeScript Declarations for EyeDropper API ---
interface EyeDropperResult {
    sRGBHex: string;
}
interface EyeDropper {
    open: () => Promise<EyeDropperResult>;
}
declare global {
    interface Window {
        EyeDropper?: new () => EyeDropper;
    }
}

// A curated palette of colors, organized by hue.
const PALETTE_COLORS = [
    // Reds & Pinks
    '#e74c3c', '#c0392b', '#ff7675', '#d63031', '#fd79a8', '#e84393',
    // Oranges & Yellows
    '#e67e22', '#d35400', '#f39c12', '#f1c40f', '#ffc107', '#ff9f1a',
    // Greens
    '#2ecc71', '#27ae60', '#1abc9c', '#16a085', '#badc58', '#4cd137',
    // Blues
    '#3498db', '#2980b9', '#0984e3', '#74b9ff', '#0097e6', '#1e90ff',
    // Purples
    '#9b59b6', '#8e44ad', '#a29bfe', '#6c5ce7', '#be2edd', '#9c88ff',
    // Grays & Neutrals
    '#ecf0f1', '#bdc3c7', '#95a5a6', '#7f8c8d', '#34495e', '#2c3e50',
];

export class CustomColorPicker {
    private parent: HTMLElement;
    public textInput: TextComponent;
    public swatch: HTMLElement;
    private popover: HTMLElement | null = null;
    private onChangeCallback: (color: string) => void;

    constructor(parent: HTMLElement) {
        this.parent = parent;
    }

    public build(initialColor: string, onChange: (color: string) => void): void {
        this.onChangeCallback = onChange;

        this.textInput = new TextComponent(this.parent)
            .setValue(initialColor)
            .onChange(value => {
                this.updateSwatchColor(value);
                this.onChangeCallback(value);
            });
        
        this.swatch = this.parent.createDiv({ cls: 'sc-color-swatch' });
        this.updateSwatchColor(initialColor);

        this.swatch.onClickEvent((e) => {
            e.stopPropagation();
            if (this.popover) {
                this.hide();
            } else {
                this.show();
            }
        });
    }

    private show(): void {
        this.popover = document.createElement('div');
        this.popover.addClass('sc-color-popover');

        const toolRow = this.popover.createDiv({ cls: 'sc-color-tool-row' });
        const colorGrid = this.popover.createDiv({ cls: 'sc-color-grid' });
        
        // FIX: Store the constructor in a local constant before checking it.
        const EyeDropperAPI = window.EyeDropper;

        if (EyeDropperAPI) {
            const eyedropperButton = toolRow.createEl('button', { cls: 'sc-eyedropper-btn' });
            setIcon(eyedropperButton, 'pipette');
            eyedropperButton.setAttribute('aria-label', 'Pick color from screen');
            eyedropperButton.onClickEvent(async () => {
                try {
                    // Now TypeScript knows EyeDropperAPI is not undefined here.
                    const eyeDropper = new EyeDropperAPI();
                    const result = await eyeDropper.open();
                    this.textInput.setValue(result.sRGBHex);
                    this.updateSwatchColor(result.sRGBHex);
                    this.onChangeCallback(result.sRGBHex);
                    this.hide();
                } catch (e) {
                    new Notice("Color picking cancelled.");
                }
            });
        }
        
        PALETTE_COLORS.forEach(color => {
            const paletteColor = colorGrid.createDiv({ cls: 'sc-palette-color' });
            paletteColor.style.backgroundColor = color;
            
            paletteColor.onClickEvent(() => {
                this.textInput.setValue(color);
                this.updateSwatchColor(color);
                this.onChangeCallback(color);
                this.hide();
            });
        });

        document.body.appendChild(this.popover);
        this.positionPopover();
        
        document.addEventListener('mousedown', this.handleOutsideClick, { capture: true, once: true });
    }

    private hide(): void {
        if (!this.popover) return;
        this.popover.remove();
        this.popover = null;
        document.removeEventListener('mousedown', this.handleOutsideClick, { capture: true });
    }

    private handleOutsideClick = (event: MouseEvent): void => {
        if (this.popover && !this.popover.contains(event.target as Node) && !this.swatch.contains(event.target as Node)) {
            this.hide();
        } else {
            document.addEventListener('mousedown', this.handleOutsideClick, { capture: true, once: true });
        }
    };
    
    private positionPopover(): void {
        if (!this.popover) return;
        const swatchRect = this.swatch.getBoundingClientRect();
        this.popover.style.position = 'absolute';
        this.popover.style.top = `${swatchRect.bottom + 5}px`;
        this.popover.style.left = `${swatchRect.left}px`;
    }

    private updateSwatchColor(color: string): void {
        if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
            this.swatch.style.backgroundColor = color;
        } else {
            this.swatch.style.backgroundColor = 'transparent';
        }
    }
}