// src/ui/AlignmentControl.ts

import { setIcon } from "obsidian";
import { Alignment } from "../types";

export class AlignmentControl {
    private parent: HTMLElement;
    private container: HTMLElement;
    private value: Alignment;
    private onChange: (value: Alignment) => void;

    constructor(parent: HTMLElement, initialValue: Alignment, onChange: (value: Alignment) => void) {
        this.parent = parent;
        this.value = initialValue;
        this.onChange = onChange;
        this.build();
    }

    private build(): void {
        this.container = this.parent.createDiv({ cls: 'sc-align-control' });
        this.createButton('left', 'align-left');
        this.createButton('center', 'align-center');
        this.createButton('right', 'align-right');
    }

    private createButton(alignValue: Alignment, icon: string): void {
        const button = this.container.createEl('button');
        setIcon(button, icon);
        button.setAttribute('aria-label', `Align ${alignValue}`);
        
        if (this.value === alignValue) {
            button.addClass('active');
        }

        button.onClickEvent(() => {
            if (this.value !== alignValue) {
                this.value = alignValue;
                this.updateActiveButton();
                this.onChange(this.value);
            }
        });
    }

    private updateActiveButton(): void {
        Array.from(this.container.children).forEach((child, index) => {
            const buttonValue = ['left', 'center', 'right'][index] as Alignment;
            if (buttonValue === this.value) {
                child.addClass('active');
            } else {
                child.removeClass('active');
            }
        });
    }
}