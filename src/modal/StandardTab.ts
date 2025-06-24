// src/modal/StandardTab.ts

import { Setting, setIcon } from "obsidian";
import { AdvancedCalloutModal, CalloutData } from "./AdvancedCalloutModal";

export class StandardTab {
    private modal: AdvancedCalloutModal;
    private container: HTMLElement;

    constructor(modal: AdvancedCalloutModal, container: HTMLElement) {
        this.modal = modal;
        this.container = container;
    }

    public display(): void {
        this.container.empty();
        const scrollPosition = this.modal.contentEl.scrollTop;

        // --- Parent Callout Section ---
        this.modal.createCalloutEditor(this.container, 'Parent Callout', this.modal.parent, true, {
            // Re-rendering the entire tab is the most robust way to ensure UI consistency
            // for the parent callout, as it affects the whole preview.
            onUpdate: () => {
                this.display();
                this.modal.updateLivePreview();
            }
        });
        this.container.createEl('hr');

        // --- Nested Callouts Section ---
        const nestedHeader = this.container.createDiv({ cls: 'nested-callouts-header' });
        nestedHeader.createEl('h4', { text: "Nested Callouts" });

        const nestedEditorsContainer = this.container.createDiv();

        // --- RENDER FUNCTION for nested editors ---
        const renderNestedEditors = () => {
            const nestedScrollPosition = nestedEditorsContainer.scrollTop;
            nestedEditorsContainer.empty();

            this.modal.nestedCallouts.forEach((calloutData, index) => {
                this.modal.createCalloutEditor(nestedEditorsContainer, `Nested Callout ${index + 1}`, calloutData, false, {
                    onUpdate: renderNestedEditors, // This creates the update loop
                    onRemove: () => {
                        this.modal.nestedCallouts.splice(index, 1);
                        renderNestedEditors();
                    },
                    onMoveUp: index > 0 ? () => {
                        const [item] = this.modal.nestedCallouts.splice(index, 1);
                        this.modal.nestedCallouts.splice(index - 1, 0, item);
                        renderNestedEditors();
                    } : undefined,
                    onMoveDown: index < this.modal.nestedCallouts.length - 1 ? () => {
                        const [item] = this.modal.nestedCallouts.splice(index, 1);
                        this.modal.nestedCallouts.splice(index + 1, 0, item);
                        renderNestedEditors();
                    } : undefined
                });
            });

            this.modal.updateLivePreview();
            nestedEditorsContainer.scrollTop = nestedScrollPosition;
        };

        // --- "ADD" BUTTON & FINAL INSERT ---
        new Setting(this.container).addButton(btn => {
            btn.setButtonText("Add Nested Callout").setCta().onClick(() => {
                const newNested: CalloutData = {
                    type: 'success',
                    title: `Nested Title ${this.modal.nestedCallouts.length + 1}`,
                    content: 'Nested content.',
                    collapse: '+',
                    noTitle: false,
                    noIcon: false
                };
                this.modal.nestedCallouts.push(newNested);
                renderNestedEditors();
            });
        });

        this.modal.addInsertButtons(this.container);

        // --- INITIAL RENDER ---
        renderNestedEditors();
        this.modal.contentEl.scrollTop = scrollPosition;
    }
}