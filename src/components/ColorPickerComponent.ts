// src/components/ColorPickerComponent.ts

import { TextComponent } from "obsidian";

// A new, expanded palette of 50 colors, organized by hue.
const PALETTE_COLORS = [
    // Reds
    '#e74c3c', '#c0392b', '#ff7675', '#d63031', '#ff4757',
    // Oranges
    '#e67e22', '#d35400', '#f39c12', '#f1c40f', '#ffc107',
    // Yellows
    '#ffd32a', '#ffda79', '#ffb142', '#ff9f1a', '#e1b12c',
    // Greens
    '#2ecc71', '#27ae60', '#1abc9c', '#16a085', '#badc58',
    // Teals
    '#7ed6df', '#55efc4', '#00b894', '#00cec9', '#1dd1a1',
    // Blues
    '#3498db', '#2980b9', '#0984e3', '#74b9ff', '#0097e6',
    // Purples
    '#9b59b6', '#8e44ad', '#a29bfe', '#6c5ce7', '#8e44ad',
    // Pinks / Magentas
    '#fd79a8', '#e84393', '#fdcb6e', '#d63031', '#ff7675',
    // Grays / Neutrals
    '#ecf0f1', '#bdc3c7', '#95a5a6', '#7f8c8d', '#34495e',
    // Browns
    '#D2691E', '#8B4513', '#A0522D', '#CD853F', '#F4A460',
];

export class CustomColorPicker {
    private parent: HTMLElement;
    private onColorChoose: (color: string) => void;

    constructor(parent: HTMLElement, onColorChoose: (color: string) => void) {
        this.parent = parent;
        this.onColorChoose = onColorChoose;
    }

    public display(): void {
        const swatchGrid = this.parent.createDiv({ cls: 'custom-color-picker-grid' });

        PALETTE_COLORS.forEach(color => {
            const swatch = swatchGrid.createDiv({ cls: 'custom-color-swatch' });
            swatch.style.backgroundColor = color;
            swatch.dataset.color = color;

            swatch.onClickEvent(() => {
                this.onColorChoose(color);
                
                this.parent.querySelectorAll('.custom-color-swatch').forEach(el => el.removeClass('selected'));
                swatch.addClass('selected');
            });
        });
    }
}