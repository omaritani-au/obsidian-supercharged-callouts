import { App, Modal, Setting, Editor, setIcon, MarkdownRenderer, Notice } from "obsidian";
import { default as SuperchargedCalloutsPlugin } from "../main";
import { StandardTab } from "./StandardTab";
import { MultiColumnTab, MultiColumnStyle } from "./MultiColumnTab";
import { CustomColorPicker } from "../ui/CustomColorPicker";

export type ComponentType = 'callout' | 'color-block';
export interface CalloutData {
    componentType: ComponentType;
    type: string;
    title: string;
    collapse: string;
    noTitle: boolean;
    noIcon: boolean;
    color: string;
    content: string;
    titleAlign: 'left' | 'center' | 'right';
    contentAlign: 'left' | 'center' | 'right';
}
export interface ColumnData { type: string; title: string; content: string; titleAlign: 'left' | 'center' | 'right'; contentAlign: 'left' | 'center' | 'right'; noTitle: boolean; }

export const standardCalloutTypes: Record<string, { icon: string, colorVar: string }> = {
    "note": { icon: "pencil", colorVar: "var(--callout-note)" }, "abstract": { icon: "clipboard-list", colorVar: "var(--callout-abstract)" },
    "info": { icon: "info", colorVar: "var(--callout-info)" }, "todo": { icon: "check-circle-2", colorVar: "var(--callout-todo)" },
    "tip": { icon: "flame", colorVar: "var(--callout-tip)" }, "success": { icon: "check", colorVar: "var(--callout-success)" },
    "question": { icon: "help-circle", colorVar: "var(--callout-question)" }, "warning": { icon: "alert-triangle", colorVar: "var(--callout-warning)" },
    "failure": { icon: "x", colorVar: "var(--callout-failure)" }, "danger": { icon: "zap", colorVar: "var(--callout-danger)" },
    "bug": { icon: "bug", colorVar: "var(--callout-bug)" }, "example": { icon: "list", colorVar: "var(--callout-example)" }, "quote": { icon: "quote", colorVar: "var(--callout-quote)" }
};

export class AdvancedCalloutModal extends Modal {
    public editor: Editor;
    public plugin: SuperchargedCalloutsPlugin;
    public activeTab: 'standard' | 'multi-column' = 'standard';
    public parent: CalloutData | null = null;
    public nestedCallouts: CalloutData[] = [];
    public columns: ColumnData[] = [{ type: 'col-blue', title: 'Column 1', content: '- Item', titleAlign: 'center', contentAlign: 'left', noTitle: false }];
    public multiColumnStyle: MultiColumnStyle = 'component-in-column';
    public nestedCalloutsForColumns: CalloutData[] = [];
    private tabContentContainer: HTMLElement;
    private previewContainer: HTMLElement;
    private standardColorCache: Map<string, string> = new Map();

    constructor(app: App, editor: Editor, plugin: SuperchargedCalloutsPlugin) {
        super(app);
        this.editor = editor;
        this.plugin = plugin;
        this.modalEl.addClass('mod-callout-creator');
    }

    onOpen() { this.renderFrame(); this.addHelpIcon(); }
    onClose() { this.contentEl.empty(); }

    private renderFrame() {
        this.contentEl.empty();
        const nav = this.contentEl.createDiv("callout-modal-nav");
        nav.createEl("button", { text: "Standard" }).onclick = () => { this.activeTab = 'standard'; this.renderTabContent(); };
        nav.createEl("button", { text: "Multi-Column" }).onclick = () => { this.activeTab = 'multi-column'; this.renderTabContent(); };
        this.tabContentContainer = this.contentEl.createDiv("callout-modal-content");
        this.previewContainer = this.contentEl.createDiv("callout-live-preview");
        this.renderTabContent();
    }

    private updateNav() {
        const nav = this.contentEl.querySelector(".callout-modal-nav");
        if (nav) {
            const buttons = Array.from(nav.children);
            buttons.forEach(button => button.removeClass('active'));
            if (this.activeTab === 'standard') buttons[0]?.addClass('active');
            else if (this.activeTab === 'multi-column') buttons[1]?.addClass('active');
        }
    }

    private renderTabContent() {
        this.updateNav();
        this.tabContentContainer.empty();
        if (this.previewContainer) this.previewContainer.style.display = 'block';
        if (this.activeTab === 'standard') { new StandardTab(this, this.tabContentContainer).display(); }
        else if (this.activeTab === 'multi-column') { new MultiColumnTab(this, this.tabContentContainer).display(); }
        this.updateLivePreview();
    }

    private addHelpIcon() {
        const helpIcon = this.modalEl.createDiv({ cls: 'callout-modal-help-icon' });
        setIcon(helpIcon, 'help-circle');
        helpIcon.onClickEvent(() => {
            const helpModal = new Modal(this.app);
            helpModal.titleEl.setText("Supercharged Callouts Help");
            const content = helpModal.contentEl;
            content.createEl("h3", { text: "Standard Callouts" });
            content.createEl("p", { text: "Use this tab to create a standard callout with optional nested children. The parent callout has extra options like 'no-title' and 'no-icon'." });
            content.createEl("h3", { text: "Multi-Column Callouts" });
            content.createEl("p", { text: "Use this tab to create side-by-side column layouts. You have three styles to choose from:" });
            const list = content.createEl("ul");
            list.createEl("li", { text: "Colored Underline: For simple, clean columns with a colored title." });
            list.createEl("li", { text: "Simple Box: A more traditional bordered container." });
            list.createEl("li", { text: "Component in Column: Use any standard callout or simple color block as a column for maximum flexibility." });
            content.createEl("h3", { text: "Settings" });
            content.createEl("p", { text: "Go to Settings -> Supercharged Callouts to create your own custom callout types, define custom colors, and set a global theme for your entire vault." });
            helpModal.open();
        });
    }
    
    public createEditorComponent(container: HTMLElement, title: string, data: CalloutData, callbacks: { onRemove?: () => void, onMoveUp?: () => void, onMoveDown?: () => void, onUpdate: () => void }) {
        if (data.componentType === 'callout') {
            this.createFullCalloutEditor(container, title, data, callbacks);
        } else if (data.componentType === 'color-block') {
            this.createColorBlockEditor(container, title, data, callbacks);
        }
    }

    private createEditorHeader(container: HTMLElement, title: string, data: CalloutData, callbacks: { onRemove?: () => void, onMoveUp?: () => void, onMoveDown?: () => void, onUpdate: () => void }) {
        const header = container.createDiv({ cls: 'callout-editor-header' });
        header.createEl('h5', { text: title });
        
        const buttonGroup = header.createDiv({ cls: 'callout-editor-button-group' });
        if (callbacks.onMoveUp) { const upBtn = buttonGroup.createEl('button', { cls: 'reorder-btn' }); setIcon(upBtn, 'arrow-up'); upBtn.onClickEvent(callbacks.onMoveUp); }
        if (callbacks.onMoveDown) { const downBtn = buttonGroup.createEl('button', { cls: 'reorder-btn' }); setIcon(downBtn, 'arrow-down'); downBtn.onClickEvent(callbacks.onMoveDown); }

        const transformBtn = buttonGroup.createEl('button', { cls: 'reorder-btn' });
        setIcon(transformBtn, 'repeat');
        transformBtn.setAttribute('title', "Switch between Callout and Color Block");
        transformBtn.onClickEvent(() => {
            if (data.componentType === 'callout') {
                data.componentType = 'color-block';
                const custom = this.plugin.settings.customCallouts.find(c => c.name === data.type);
                data.color = custom?.color || this.getStandardCalloutColor(data.type);
            } else {
                data.componentType = 'callout';
                data.noIcon = false;
                data.noTitle = false;
            }
            callbacks.onUpdate();
        });

        if (callbacks.onRemove) { const removeBtn = buttonGroup.createEl('button', { cls: 'remove-item-btn' }); setIcon(removeBtn, 'trash-2'); removeBtn.onClickEvent(callbacks.onRemove); }
    }

    private createColorBlockEditor(container: HTMLElement, title: string, data: CalloutData, callbacks: { onRemove?: () => void, onMoveUp?: () => void, onMoveDown?: () => void, onUpdate: () => void }) {
        const editorWrapper = container.createDiv({ cls: 'callout-editor-wrapper' });
        this.createEditorHeader(editorWrapper, title, data, callbacks);
        
        const editorContainer = editorWrapper.createDiv({ cls: 'callout-editor-content' });
        const colorSetting = new Setting(editorContainer).setName("Color").setDesc("Pick a color for the block.");
        const customPicker = new CustomColorPicker(colorSetting.controlEl);
        customPicker.build(data.color, (newColor) => {
            data.color = newColor;
            this.updateLivePreview();
        });

        new Setting(editorContainer).setName("Content alignment").addDropdown(dd => {
            dd.addOption('left', 'Left').addOption('center', 'Center').addOption('right', 'Right')
              .setValue(data.contentAlign)
              .onChange((value: 'left' | 'center' | 'right') => { 
                  data.contentAlign = value; 
                  this.updateLivePreview(); 
              });
        });
        
        new Setting(editorContainer).setName("Content").addTextArea(text => { text.setValue(data.content)
            .onChange(val => { 
                data.content = val; 
                this.updateLivePreview(); 
            }); 
            text.inputEl.rows = 4; 
        });
    }

    private createFullCalloutEditor(container: HTMLElement, title: string, data: CalloutData, callbacks: { onRemove?: () => void, onMoveUp?: () => void, onMoveDown?: () => void, onUpdate: () => void }) {
        const editorWrapper = container.createDiv({ cls: 'callout-editor-wrapper' });
        this.createEditorHeader(editorWrapper, title, data, callbacks);

        const editorContainer = editorWrapper.createDiv({ cls: 'callout-editor-content' });
        
        const typeSetting = new Setting(editorContainer).setName("Type");
        if (!data.noIcon) {
            const iconPreview = editorContainer.createDiv({ cls: 'icon-preview' });
            const updateIcon = (type: string) => {
                const custom = this.plugin.settings.customCallouts.find(c => c.name === type);
                const iconName = standardCalloutTypes[type]?.icon || custom?.icon || 'help-circle';
                iconPreview.empty(); setIcon(iconPreview, iconName);
                iconPreview.style.color = custom?.color || this.getStandardCalloutColor(type);
            };
            typeSetting.controlEl.prepend(iconPreview);
            updateIcon(data.type);
        }
        typeSetting.addDropdown(dd => { this.addCalloutTypeOptions(dd.selectEl, data.type); 
            dd.onChange(val => { 
                data.type = val; 
                callbacks.onUpdate(); 
            }); 
        });
        
        if (!data.noTitle) {
            new Setting(editorContainer).setName("Title").addText(text => text.setValue(data.title)
                .onChange(val => { 
                    data.title = val; 
                    this.updateLivePreview();
                }));

            new Setting(editorContainer).setName("Title alignment").addDropdown(dd => {
                dd.addOption('left', 'Left').addOption('center', 'Center').addOption('right', 'Right')
                  .setValue(data.titleAlign)
                  .onChange((value: 'left' | 'center' | 'right') => { 
                      data.titleAlign = value;
                      this.updateLivePreview();
                  });
            });
        }
        
        const handleModifierChange = () => {
            if (data.noIcon && data.noTitle) {
                data.componentType = 'color-block';
                const custom = this.plugin.settings.customCallouts.find(c => c.name === data.type);
                data.color = custom?.color || this.getStandardCalloutColor(data.type);
            }
            callbacks.onUpdate();
        };

        new Setting(editorContainer)
            .setName("Modifiers").setDesc("Hide visual elements of the callout.")
            .addToggle(toggle => {
                toggle.setTooltip("Hide Icon").setValue(data.noIcon).onChange(val => { data.noIcon = val; handleModifierChange(); });
            })
            .addToggle(toggle => {
                toggle.setTooltip("Hide Title").setValue(data.noTitle).onChange(val => { data.noTitle = val; handleModifierChange(); });
            });

        new Setting(editorContainer).setName("Content alignment").addDropdown(dd => {
            dd.addOption('left', 'Left').addOption('center', 'Center').addOption('right', 'Right')
              .setValue(data.contentAlign)
              .onChange((value: 'left' | 'center' | 'right') => { 
                  data.contentAlign = value;
                  this.updateLivePreview(); 
              });
        });
        
        new Setting(editorContainer).setName("Collapse").addDropdown(dd => { dd.addOption('', 'None').addOption('+', 'Open').addOption('-', 'Closed')
            .setValue(data.collapse)
            .onChange(val => { 
                data.collapse = val; 
                this.updateLivePreview(); 
            }); 
        });

        new Setting(editorContainer).setName("Content").addTextArea(text => { text.setValue(data.content)
            .onChange(val => { 
                data.content = val; 
                this.updateLivePreview(); 
            }); 
            text.inputEl.rows = 4; 
        });
    }

    public addInsertButtons(contentEl: HTMLElement) { 
        new Setting(contentEl).addButton(btn => btn.setButtonText("Insert").setCta().onClick(() => this.insertContent())); 
    }

    public insertContent() { 
        if (!this.parent && this.activeTab === 'standard') {
            new Notice("Cannot insert empty content.");
            return;
        }
        if (this.activeTab === 'multi-column' && this.nestedCalloutsForColumns.length === 0 && this.columns.length === 0) {
            new Notice("Cannot insert empty multi-column layout.");
            return;
        }
        const markdown = this.generateMarkdown(); 
        this.editor.replaceSelection(markdown + '\n'); 
        this.close(); 
    }

    public addCalloutTypeOptions(dropdown: HTMLSelectElement, selectedValue: string) { 
        Object.keys(standardCalloutTypes).forEach(key => dropdown.createEl('option', { text: key.charAt(0).toUpperCase() + key.slice(1), value: key })); 
        const customCallouts = this.plugin.settings.customCallouts; 
        if (customCallouts.length > 0) { 
            const group = dropdown.createEl('optgroup', { attr: { label: '---- Custom ----' } }); 
            customCallouts.forEach(c => group.createEl('option', { text: c.name.charAt(0).toUpperCase() + c.name.slice(1), value: c.name })); 
        } 
        dropdown.value = selectedValue; 
    }
    
    public async updateLivePreview() {
        if ((!this.parent && this.activeTab === 'standard') || (this.activeTab === 'multi-column' && this.nestedCalloutsForColumns.length === 0 && this.columns.length === 0)) {
            if (this.previewContainer) this.previewContainer.empty();
            return;
        }
        
        this.previewContainer.empty();
        const textToInsert = this.generateMarkdown();
        
        this.plugin.applyPluginStyles();
        
        if (textToInsert) {
            await MarkdownRenderer.renderMarkdown(textToInsert, this.previewContainer, '', this.plugin);
        }
    }

    public getStandardCalloutColor(type: string): string { 
        if (this.standardColorCache.has(type)) { 
            return this.standardColorCache.get(type) || 'var(--text-normal)'; 
        } 
        const tempCallout = document.body.createDiv({ cls: 'callout' }); 
        tempCallout.dataset.callout = type; 
        tempCallout.style.position = 'absolute'; tempCallout.style.top = '-9999px'; tempCallout.style.left = '-9999px'; 
        const colorTriplet = getComputedStyle(tempCallout).getPropertyValue('--callout-color').replace(/\s/g, ''); 
        tempCallout.remove(); 
        if (colorTriplet) { 
            const finalColor = `rgb(${colorTriplet})`; 
            this.standardColorCache.set(type, finalColor); 
            return finalColor; 
        } 
        return 'var(--text-normal)'; 
    }

    private generateMarkdown(): string {
        this.plugin.clearTemporaryStyles();

        if (!this.parent && this.activeTab === 'standard') return '';

        const formatComponent = (data: CalloutData, indent: string): string => {
            const content = data.content.trim().replace(/\n/g, `\n${indent} `);
            let alignment = `|c-${data.contentAlign}`; 

            if (data.componentType === 'callout') {
                const modifiers = `${data.noTitle ? '|no-title' : ''}${data.noIcon ? '|no-icon' : ''}`;
                if (data.titleAlign !== 'left') alignment += `|t-${data.titleAlign}`;
                const title = data.title ? ' ' + data.title : '';
                return `${indent} [!${data.type}${modifiers}${alignment}]${data.collapse}${title}\n${indent} ${content}`;
            } else {
                const tempCalloutName = `sc-temp-${data.color.substring(1)}`;
                this.plugin.addTemporaryCalloutStyle(tempCalloutName, data.color);
                return `${indent} [!${tempCalloutName}|no-title|no-icon${alignment}]\n${indent} ${content}`;
            }
        };

        if (this.activeTab === 'multi-column') {
            const mainContainer = `> [!multi-column]\n`;
            let formattedCols: string[] = [];
            switch (this.multiColumnStyle) {
                case 'colored-underline':
                case 'simple-box': {
                    if (this.columns.length === 0) return '> [!multi-column]\n>\n';
                    formattedCols = this.columns.map(col => {
                        const type = this.multiColumnStyle === 'simple-box' ? 'blank-container' : col.type;
                        let alignment = `|c-${col.contentAlign}`;
                        if (col.titleAlign !== 'left') alignment += `|t-${col.titleAlign}`;
                        const titleContent = col.noTitle ? ' ' : col.title;
                        const titleLine = `>> ### ${titleContent}\n`;
                        const contentLine = `>> ${col.content.trim().replace(/\n/g, '\n>> ')}`;
                        return `>> [!${type}${alignment}]\n${titleLine}${contentLine}`;
                    });
                    break;
                }
                case 'component-in-column': {
                    if (this.nestedCalloutsForColumns.length === 0) return '> [!multi-column]\n>\n';
                    formattedCols = this.nestedCalloutsForColumns.map(col => formatComponent(col, '>>'));
                    break;
                }
            }
            return mainContainer + formattedCols.join('\n>\n') + '\n';
        } else {
            if (!this.parent) return '';
            let textToInsert = formatComponent(this.parent, '>');
            const formattedChildren = this.nestedCallouts.map(child => formatComponent(child, '>>'));
            if (formattedChildren.length > 0) {
                textToInsert += `\n>\n${formattedChildren.join('\n>\n')}`;
            }
            return textToInsert;
        }
    }
}