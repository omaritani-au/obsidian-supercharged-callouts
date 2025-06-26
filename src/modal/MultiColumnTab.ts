// src/modal/MultiColumnTab.ts

import { Setting, setIcon, TextComponent } from "obsidian";
import { AdvancedCalloutModal } from "./AdvancedCalloutModal";
import { ColumnData, CalloutData, ComponentType, MultiColumnStyle, CustomCalloutDefinition, Alignment } from "../types";
import { AlignmentControl } from "../ui/AlignmentControl";

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
        const scrollPosition = this.modal.contentEl.scrollTop;
        this.container.empty();

        new Setting(this.container).setName("Column style").setDesc("Choose the overall appearance of the columns.").addDropdown(dd => {
            dd.addOption('colored-underline', 'Colored underline')
              .addOption('simple-box', 'Simple box')
              .addOption('component-in-column', 'Component in column')
              .setValue(this.selectedStyle)
              .onChange((value: MultiColumnStyle) => {
                  this.selectedStyle = value;
                  this.modal.multiColumnStyle = value;
                  this.modal.columns = [{ type: 'col-blue', title: 'Column 1', content: '- Item', titleAlign: 'center', contentAlign: 'left', noTitle: false }];
                  this.modal.nestedCalloutsForColumns = [this.modal.createNewComponent('callout', 'Column', 1)];
                  this.display();
              });
        });

        let layoutInput: TextComponent;
        new Setting(this.container)
            .setName("Column Layout")
            .setDesc("Define column widths (e.g., 1fr 2fr). Leave blank for auto-fit.")
            .addText(text => {
                layoutInput = text;
                text
                    .setPlaceholder("e.g., 2fr 1fr or 300px 1fr")
                    .setValue(this.modal.columnLayout)
                    .onChange(val => {
                        this.modal.columnLayout = val;
                        this.modal.updateLivePreview();
                    });
            });

        // NEW: Add preset buttons for common layouts
        const presetSetting = new Setting(this.container)
            .setName("Layout Presets")
            .setDesc("Click a preset to apply it.");

        const presets = [
            { label: '1:1', value: '1fr 1fr' },
            { label: '1:2', value: '1fr 2fr' },
            { label: '2:1', value: '2fr 1fr' },
            { label: '1:1:1', value: '1fr 1fr 1fr' },
            { label: 'Auto', value: '' },
        ];

        presets.forEach(preset => {
            presetSetting.addButton(button => {
                button
                    .setButtonText(preset.label)
                    .onClick(() => {
                        this.modal.columnLayout = preset.value;
                        layoutInput.setValue(preset.value); // Update the text field directly
                        this.modal.updateLivePreview();
                    });
            });
        });

        this.container.createEl('hr');
        const header = this.container.createDiv({ cls: 'nested-callouts-header' });
        header.createEl('h4', { text: "Columns" });
        const columnEditorsContainer = this.container.createDiv();

        if (this.selectedStyle === 'component-in-column') {
            this.renderComponentStyleEditors(columnEditorsContainer);
        } else {
            this.renderSimpleStyleEditors(columnEditorsContainer);
        }

        this.modal.addInsertButtons(this.container);
        this.modal.updateLivePreview();
        
        this.modal.contentEl.scrollTop = scrollPosition;
    }

    private renderComponentStyleEditors(container: HTMLElement) {
        this.modal.nestedCalloutsForColumns.forEach((calloutData: CalloutData, index: number) => {
            const columnTitle = `Column ${index + 1} - ${calloutData.componentType === 'callout' ? 'Callout' : 'Color Block'}`;
            
            this.modal.createEditorComponent(container, columnTitle, calloutData, {
                onUpdate: () => this.display(),
                onRemove: this.modal.nestedCalloutsForColumns.length > 1 ? () => { 
                    this.modal.nestedCalloutsForColumns.splice(index, 1); 
                    this.display();
                } : undefined,
                onMoveUp: index > 0 ? () => { 
                    const [i] = this.modal.nestedCalloutsForColumns.splice(index, 1); 
                    this.modal.nestedCalloutsForColumns.splice(index - 1, 0, i); 
                    this.display();
                } : undefined,
                onMoveDown: index < this.modal.nestedCalloutsForColumns.length - 1 ? () => { 
                    const [i] = this.modal.nestedCalloutsForColumns.splice(index, 1); 
                    this.modal.nestedCalloutsForColumns.splice(index + 1, 0, i); 
                    this.display();
                } : undefined,
            });
        });
        
        const columnCreator = new Setting(container);
        columnCreator.addButton(btn => btn.setButtonText("+ Add Callout Column").onClick(() => {
            this.modal.nestedCalloutsForColumns.push(this.modal.createNewComponent('callout', 'Column', this.modal.nestedCalloutsForColumns.length + 1));
            this.display();
        }));
        columnCreator.addButton(btn => btn.setButtonText("+ Add Color Block Column").onClick(() => {
            this.modal.nestedCalloutsForColumns.push(this.modal.createNewComponent('color-block', 'Column', this.modal.nestedCalloutsForColumns.length + 1));
            this.display();
        }));
    }

    private renderSimpleStyleEditors(container: HTMLElement) {
        this.modal.columns.forEach((colData: ColumnData, index: number) => {
            const onUpdate = () => this.display();

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

        new Setting(container).addButton(btn => {
            btn.setButtonText("Add column").setCta().onClick(() => {
                const colorCycle = ['pink', 'green', 'teal', 'orange', 'purple', 'blue'];
                const nextColor = `col-${colorCycle[this.modal.columns.length % colorCycle.length]}`;
                const newColumn: ColumnData = { type: nextColor, title: `Column ${this.modal.columns.length + 1}`, content: '- Item', titleAlign: 'center', contentAlign: 'left', noTitle: false };
                this.modal.columns.push(newColumn);
                this.display();
            });
        });
    }

    private createSimpleColumnEditorUI(container: HTMLElement, colData: ColumnData, onUpdate: () => void) {
        if (this.selectedStyle === 'colored-underline') {
            new Setting(container).setName("Color").addDropdown(dd => {
                Object.entries(columnColors).forEach(([key, value]) => dd.addOption(key, value));
                const custom = this.modal.plugin.settings.customColumnColors;
                if (custom.length > 0) { const group = dd.selectEl.createEl('optgroup', { attr: { label: '---- Custom ----' } }); custom.forEach(c => group.createEl('option', { text: c.name.replace('col-', '').replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()), value: c.name })); }
                dd.setValue(colData.type).onChange(val => { 
                    colData.type = val; 
                    this.modal.updateLivePreview(); 
                });
            });
        }
        
        if (!colData.noTitle) {
            new Setting(container).setName("Title").addText(text => text.setValue(colData.title).onChange(val => { 
                colData.title = val; 
                this.modal.updateLivePreview(); 
            }));
    
            const titleAlignSetting = new Setting(container).setName("Title alignment");
            new AlignmentControl(titleAlignSetting.controlEl, colData.titleAlign, (value: Alignment) => {
                colData.titleAlign = value;
                this.modal.updateLivePreview();
            });
        }
        
        new Setting(container)
            .setName("Hide title")
            .addToggle(toggle => toggle
                .setValue(colData.noTitle)
                .onChange(val => { 
                    colData.noTitle = val; 
                    onUpdate(); 
                }));
        
        new Setting(container)
            .setName("No underline")
            .setDesc("Only works with the 'Clean Box' theme.")
            .addToggle(toggle => toggle
                .setValue(!!colData.noUnderline)
                .onChange(val => {
                    colData.noUnderline = val;
                    this.modal.updateLivePreview();
                }));

        const contentAlignSetting = new Setting(container).setName("Content alignment");
        new AlignmentControl(contentAlignSetting.controlEl, colData.contentAlign, (value: Alignment) => {
            colData.contentAlign = value;
            this.modal.updateLivePreview();
        });

        new Setting(container).setName("Content").addTextArea(text => text.setValue(colData.content).onChange(val => { 
            colData.content = val; 
            this.modal.updateLivePreview(); 
        }).inputEl.rows = 4);
    }
}