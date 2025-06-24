// src/modal/MultiColumnTab.ts

import { Setting, setIcon } from "obsidian";
import { AdvancedCalloutModal, ColumnData, CalloutData, standardCalloutTypes } from "./AdvancedCalloutModal";

export type MultiColumnStyle = 'colored-underline' | 'simple-box' | 'callout-in-column';
const columnColors: Record<string, string> = { "col-red": "Red", "col-blue": "Blue", "col-green": "Green", "col-yellow": "Yellow", "col-purple": "Purple", "col-orange": "Orange", "col-pink": "Pink", "col-cyan": "Cyan", "col-teal": "Teal", "col-lime": "Lime", "col-gray": "Gray" };

export class MultiColumnTab {
    private modal: AdvancedCalloutModal;
    private container: HTMLElement;
    private selectedStyle: MultiColumnStyle;

    constructor(modal: AdvancedCalloutModal, container: HTMLElement) {
        this.modal = modal;
        this.container = container;
        this.selectedStyle = this.modal.multiColumnStyle;
    }

    public display(): void {
        this.container.empty();
        const scrollPosition = this.modal.contentEl.scrollTop;

        new Setting(this.container).setName("Column Style").setDesc("Choose the overall appearance of the columns.").addDropdown(dd => {
            dd.addOption('colored-underline', 'Colored Underline').addOption('simple-box', 'Simple Box').addOption('callout-in-column', 'Callout-in-Column').setValue(this.selectedStyle)
              .onChange((value: MultiColumnStyle) => {
                  this.selectedStyle = value;
                  this.modal.multiColumnStyle = value;
                  this.modal.columns = [{ type: 'col-blue', title: 'Column 1', content: '- Item' }];
                  this.modal.nestedCalloutsForColumns = [{ type: 'note', title: 'Column 1', content: '- Item', collapse: '', noTitle: false, noIcon: false }];
                  this.display();
              });
        });

        this.container.createEl('hr');
        const header = this.container.createDiv({ cls: 'nested-callouts-header' });
        header.createEl('h4', { text: "Columns" });
        const columnEditorsContainer = this.container.createDiv();

        const renderColumnEditors = () => {
            const editorScrollPosition = columnEditorsContainer.scrollTop;
            columnEditorsContainer.empty();
            if (this.selectedStyle === 'callout-in-column') { this.renderCalloutStyleEditors(columnEditorsContainer, renderColumnEditors); }
            else { this.renderSimpleStyleEditors(columnEditorsContainer, renderColumnEditors); }
            this.modal.updateLivePreview();
            columnEditorsContainer.scrollTop = editorScrollPosition;
        };

        new Setting(this.container).addButton(btn => {
            btn.setButtonText("Add Column").setCta().onClick(() => {
                if (this.selectedStyle === 'callout-in-column') {
                    const newCallout: CalloutData = { type: 'info', title: `Column ${this.modal.nestedCalloutsForColumns.length + 1}`, content: '- Item', collapse: '+', noTitle: false, noIcon: false };
                    this.modal.nestedCalloutsForColumns.push(newCallout);
                } else {
                    const colorCycle = ['pink', 'green', 'teal', 'orange', 'purple', 'blue'];
                    const nextColor = `col-${colorCycle[this.modal.columns.length % colorCycle.length]}`;
                    const newColumn: ColumnData = { type: nextColor, title: `Column ${this.modal.columns.length + 1}`, content: '- Item' };
                    this.modal.columns.push(newColumn);
                }
                renderColumnEditors();
            });
        });

        this.modal.addInsertButtons(this.container);
        renderColumnEditors();
        this.modal.contentEl.scrollTop = scrollPosition;
    }

    private renderCalloutStyleEditors(container: HTMLElement, onUpdate: () => void) {
        this.modal.nestedCalloutsForColumns.forEach((calloutData, index) => {
            const editorWrapper = container.createDiv({cls: 'callout-editor-wrapper'});
            this.createFullColumnEditor(editorWrapper, `Column ${index + 1}`, calloutData, onUpdate, {
                onRemove: this.modal.nestedCalloutsForColumns.length > 1 ? () => { this.modal.nestedCalloutsForColumns.splice(index, 1); onUpdate(); } : undefined,
                onMoveUp: index > 0 ? () => { const [i] = this.modal.nestedCalloutsForColumns.splice(index, 1); this.modal.nestedCalloutsForColumns.splice(index - 1, 0, i); onUpdate(); } : undefined,
                onMoveDown: index < this.modal.nestedCalloutsForColumns.length - 1 ? () => { const [i] = this.modal.nestedCalloutsForColumns.splice(index, 1); this.modal.nestedCalloutsForColumns.splice(index + 1, 0, i); onUpdate(); } : undefined,
            });
        });
    }

    private renderSimpleStyleEditors(container: HTMLElement, onUpdate: () => void) {
        this.modal.columns.forEach((colData, index) => {
            const editorWrapper = container.createDiv({ cls: 'callout-editor-wrapper' });
            const editorHeader = editorWrapper.createDiv({ cls: 'callout-editor-header' });
            editorHeader.createEl('h5', { text: `Column ${index + 1}` });
            const buttonGroup = editorHeader.createDiv({ cls: 'callout-editor-button-group' });

            if (index > 0) { const upBtn = buttonGroup.createEl('button', { cls: 'reorder-btn' }); setIcon(upBtn, 'arrow-up'); upBtn.onClickEvent(() => { const [i] = this.modal.columns.splice(index, 1); this.modal.columns.splice(index - 1, 0, i); onUpdate(); }); }
            if (index < this.modal.columns.length - 1) { const downBtn = buttonGroup.createEl('button', { cls: 'reorder-btn' }); setIcon(downBtn, 'arrow-down'); downBtn.onClickEvent(() => { const [i] = this.modal.columns.splice(index, 1); this.modal.columns.splice(index + 1, 0, i); onUpdate(); }); }
            if (this.modal.columns.length > 1) { const removeBtn = buttonGroup.createEl('button', { cls: 'remove-item-btn' }); setIcon(removeBtn, 'trash-2'); removeBtn.onClickEvent(() => { this.modal.columns.splice(index, 1); onUpdate(); }); }

            const editorContent = editorWrapper.createDiv({ cls: 'callout-editor-content' });
            this.createSimpleColumnEditorUI(editorContent, colData, onUpdate);
        });
    }

    private createSimpleColumnEditorUI(container: HTMLElement, colData: ColumnData, onUpdate: () => void) {
        if (this.selectedStyle === 'colored-underline') {
            new Setting(container).setName("Color").addDropdown(dd => {
                Object.entries(columnColors).forEach(([key, value]) => dd.addOption(key, value));
                const custom = this.modal.plugin.settings.customColumnColors;
                if (custom.length > 0) { const group = dd.selectEl.createEl('optgroup', { attr: { label: '---- Custom ----' } }); custom.forEach(c => group.createEl('option', { text: c.name.replace('col-', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value: c.name })); }
                dd.setValue(colData.type).onChange(val => { colData.type = val; onUpdate(); });
            });
        }
        new Setting(container).setName("Title").addText(text => text.setValue(colData.title).onChange(val => { colData.title = val; onUpdate(); }));
        new Setting(container).setName("Content").addTextArea(text => text.setValue(colData.content).onChange(val => { colData.content = val; onUpdate(); }).inputEl.rows = 4);
    }

    private createFullColumnEditor(container: HTMLElement, title: string, data: CalloutData, onUpdate: () => void, callbacks: { onRemove?: () => void, onMoveUp?: () => void, onMoveDown?: () => void }) {
        const header = container.createDiv({ cls: 'callout-editor-header' });
        header.createEl('h5', { text: title });
        const buttonGroup = header.createDiv({ cls: 'callout-editor-button-group' });
        if (callbacks.onMoveUp) { const upBtn = buttonGroup.createEl('button', { cls: 'reorder-btn' }); setIcon(upBtn, 'arrow-up'); upBtn.onClickEvent(callbacks.onMoveUp); }
        if (callbacks.onMoveDown) { const downBtn = buttonGroup.createEl('button', { cls: 'reorder-btn' }); setIcon(downBtn, 'arrow-down'); downBtn.onClickEvent(callbacks.onMoveDown); }
        if (callbacks.onRemove) { const removeBtn = buttonGroup.createEl('button', { cls: 'remove-item-btn' }); setIcon(removeBtn, 'trash-2'); removeBtn.onClickEvent(callbacks.onRemove); }

        const editorContent = container.createDiv({ cls: 'callout-editor-content' });
        
        const iconPreview = editorContent.createDiv({ cls: 'icon-preview' });
        const updateIcon = (type: string) => {
            const standard = standardCalloutTypes[type];
            const custom = this.modal.plugin.settings.customCallouts.find(c => c.name === type);
            const iconName = standard?.icon || custom?.icon || 'help-circle';
            const finalColor = custom?.color || this.modal.getStandardCalloutColor(type);
            iconPreview.empty(); setIcon(iconPreview, iconName); iconPreview.style.color = finalColor;
        };

        const typeSetting = new Setting(editorContent).setName("Type");
        typeSetting.controlEl.prepend(iconPreview);
        typeSetting.addDropdown(dd => {
            this.modal.addCalloutTypeOptions(dd.selectEl, data.type);
            dd.onChange(val => { data.type = val; onUpdate(); });
        });
        updateIcon(data.type);
        
        new Setting(editorContent).setName("Title").addText(text => text.setValue(data.title).onChange(val => { data.title = val; onUpdate(); }));
        new Setting(editorContent).setName("Collapse").addDropdown(dd => { dd.addOption('', 'None').addOption('+', 'Open').addOption('-', 'Closed').setValue(data.collapse).onChange(val => { data.collapse = val; onUpdate(); }); });
        new Setting(editorContent).setName("Content").addTextArea(text => { text.setValue(data.content).onChange(val => { data.content = val; onUpdate(); }); text.inputEl.rows = 4; });
    }
}