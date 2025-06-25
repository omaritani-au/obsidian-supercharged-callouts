import { Setting } from "obsidian";
import { AdvancedCalloutModal, CalloutData, ComponentType } from "./AdvancedCalloutModal";

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
            parentCreator.addButton(btn => btn.setButtonText("+ Add Parent Callout").onClick(() => { this.modal.parent = this.createNewComponent('callout'); this.display(); }));
            parentCreator.addButton(btn => btn.setButtonText("+ Add Parent Color Block").onClick(() => { this.modal.parent = this.createNewComponent('color-block'); this.display(); }));
        } else {
            // --- UX UPGRADE: Dynamic Label ---
            const parentTitle = `Parent - ${this.modal.parent.componentType === 'callout' ? 'Callout' : 'Color Block'}`;
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

            this.modal.nestedCallouts.forEach((calloutData, index) => {
                // --- UX UPGRADE: Dynamic Label ---
                const nestedTitle = `Nested ${index + 1} - ${calloutData.componentType === 'callout' ? 'Callout' : 'Color Block'}`;
                this.modal.createEditorComponent(nestedEditorsContainer, nestedTitle, calloutData, {
                    onUpdate: () => this.display(),
                    onRemove: () => { this.modal.nestedCallouts.splice(index, 1); this.display(); },
                    onMoveUp: index > 0 ? () => { const [i] = this.modal.nestedCallouts.splice(index, 1); this.modal.nestedCallouts.splice(index - 1, 0, i); this.display(); } : undefined,
                    onMoveDown: index < this.modal.nestedCallouts.length - 1 ? () => { const [i] = this.modal.nestedCallouts.splice(index, 1); this.modal.nestedCallouts.splice(index + 1, 0, i); this.display(); } : undefined
                });
            });

            const nestedCreator = new Setting(this.container);
            nestedCreator.addButton(btn => btn.setButtonText("+ Add Nested Callout").onClick(() => { this.modal.nestedCallouts.push(this.createNewComponent('callout', this.modal.nestedCallouts.length + 1)); this.display(); }));
            nestedCreator.addButton(btn => btn.setButtonText("+ Add Nested Color Block").onClick(() => { this.modal.nestedCallouts.push(this.createNewComponent('color-block', this.modal.nestedCallouts.length + 1)); this.display(); }));

            this.modal.addInsertButtons(this.container);
        }
        
        this.modal.updateLivePreview();
    }

    private createNewComponent(type: ComponentType, index: number = 1): CalloutData {
        if (type === 'callout') {
            return {
                componentType: 'callout', type: 'note', title: `Title ${index}`, content: 'Content.',
                collapse: '', noTitle: false, noIcon: false, color: '', titleAlign: 'left', contentAlign: 'left',
            };
        } else {
            return {
                componentType: 'color-block', color: '#ecf0f1', content: 'Content.',
                type: '', title: '', collapse: '', noTitle: true, noIcon: true, titleAlign: 'left', contentAlign: 'left',
            };
        }
    }
}