// src/modal/StandardTab.ts

import { Setting } from "obsidian";
import { AdvancedCalloutModal } from "./AdvancedCalloutModal";
import { CalloutData, ComponentType } from "../types";

export class StandardTab {
    private modal: AdvancedCalloutModal;
    private container: HTMLElement;

    constructor(modal: AdvancedCalloutModal, container: HTMLElement) {
        this.modal = modal;
        this.container = container;
    }

    public display(): void {
        this.container.empty();
        
        if (!this.modal.parent) {
            const parentCreator = new Setting(this.container).setName("Create a parent component").setDesc("Start by adding a standard callout or a simple color block.");
            parentCreator.addButton(btn => btn.setButtonText("+ Add Parent Callout").onClick(() => { this.modal.parent = this.modal.createNewComponent('callout', 'Title'); this.display(); }));
            parentCreator.addButton(btn => btn.setButtonText("+ Add Parent Color Block").onClick(() => { this.modal.parent = this.modal.createNewComponent('color-block', 'Title'); this.display(); }));
        } else {
            const parentTitle = `Parent - ${this.modal.parent.componentType === 'callout' ? 'Callout' : 'Color Block'}`;
            // FIX: Removed the incorrect 5th argument.
            this.modal.createEditorComponent(this.container, parentTitle, this.modal.parent, {
                onUpdate: () => this.display(),
                onRemove: () => { this.modal.parent = null; this.modal.nestedCallouts = []; this.display(); }
            });
            this.container.createEl('hr');
        }

        if (this.modal.parent) {
            const nestedHeader = this.container.createDiv({ cls: 'nested-callouts-header' });
            nestedHeader.createEl('h4', { text: "Nested Components" });
            const nestedEditorsContainer = this.container.createDiv();

            this.modal.nestedCallouts.forEach((calloutData: CalloutData, index: number) => {
                const nestedTitle = `Nested ${index + 1} - ${calloutData.componentType === 'callout' ? 'Callout' : 'Color Block'}`;
                // FIX: Removed the incorrect 5th argument.
                this.modal.createEditorComponent(nestedEditorsContainer, nestedTitle, calloutData, {
                    onUpdate: () => this.display(),
                    onRemove: () => { this.modal.nestedCallouts.splice(index, 1); this.display(); },
                    onMoveUp: index > 0 ? () => { const [i] = this.modal.nestedCallouts.splice(index, 1); this.modal.nestedCallouts.splice(index - 1, 0, i); this.display(); } : undefined,
                    onMoveDown: index < this.modal.nestedCallouts.length - 1 ? () => { const [i] = this.modal.nestedCallouts.splice(index, 1); this.modal.nestedCallouts.splice(index + 1, 0, i); this.display(); } : undefined
                });
            });

            const nestedCreator = new Setting(this.container);
            nestedCreator.addButton(btn => btn.setButtonText("+ Add Nested Callout").onClick(() => { this.modal.nestedCallouts.push(this.modal.createNewComponent('callout', 'Title', this.modal.nestedCallouts.length + 1)); this.display(); }));
            nestedCreator.addButton(btn => btn.setButtonText("+ Add Nested Color Block").onClick(() => { this.modal.nestedCallouts.push(this.modal.createNewComponent('color-block', 'Title', this.modal.nestedCallouts.length + 1)); this.display(); }));

            this.modal.addInsertButtons(this.container);
        }
        
        this.modal.updateLivePreview();
    }
}