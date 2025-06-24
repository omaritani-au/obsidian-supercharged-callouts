// src/modal/AdvancedCalloutModal.ts

import { App, Modal, Setting, Editor, setIcon, MarkdownRenderer } from "obsidian";
import { default as SuperchargedCalloutsPlugin } from "../main";
import { StandardTab } from "./StandardTab";
import { MultiColumnTab, MultiColumnStyle } from "./MultiColumnTab";

export interface CalloutData { type: string; title: string; content: string; collapse: string; noTitle: boolean; noIcon: boolean; }
export interface ColumnData { type: string; title: string; content: string; }

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

    public parent: CalloutData = { type: 'note', title: 'Master', content: 'Parent content.', collapse: '', noTitle: false, noIcon: false };
    public nestedCallouts: CalloutData[] = [];
    public columns: ColumnData[] = [{ type: 'col-blue', title: 'Column 1', content: '- Item' }];
    public multiColumnStyle: MultiColumnStyle = 'colored-underline';
    public nestedCalloutsForColumns: CalloutData[] = [{ type: 'note', title: 'Column 1', content: '- Item', collapse: '', noTitle: false, noIcon: false }];

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
        if (nav) { const buttons = Array.from(nav.children); buttons.forEach(button => button.removeClass('active')); if (this.activeTab === 'standard') buttons[0]?.addClass('active'); else if (this.activeTab === 'multi-column') buttons[1]?.addClass('active'); }
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
        helpIcon.onClickEvent(() => { const helpModal = new Modal(this.app); helpModal.contentEl.createEl("h2", { text: "Help" }); helpModal.contentEl.createEl("p", { text: "This is where the help documentation will go." }); helpModal.open(); });
    }

    public createCalloutEditor(container: HTMLElement, title: string, data: CalloutData, isParent: boolean, callbacks: { onRemove?: () => void, onMoveUp?: () => void, onMoveDown?: () => void, onUpdate: () => void }) {
        const editorWrapper = container.createDiv({ cls: 'callout-editor-wrapper' });
        const header = editorWrapper.createDiv({ cls: 'callout-editor-header' });
        header.createEl(isParent ? 'h4' : 'h5', { text: title });
        const buttonGroup = header.createDiv({ cls: 'callout-editor-button-group' });
        if (callbacks.onMoveUp) { const upBtn = buttonGroup.createEl('button', { cls: 'reorder-btn' }); setIcon(upBtn, 'arrow-up'); upBtn.setAttr('aria-label', 'Move Up'); upBtn.onClickEvent(callbacks.onMoveUp); }
        if (callbacks.onMoveDown) { const downBtn = buttonGroup.createEl('button', { cls: 'reorder-btn' }); setIcon(downBtn, 'arrow-down'); downBtn.setAttr('aria-label', 'Move Down'); downBtn.onClickEvent(callbacks.onMoveDown); }
        if (callbacks.onRemove) { const removeBtn = buttonGroup.createEl('button', { cls: 'remove-item-btn' }); setIcon(removeBtn, 'trash-2'); removeBtn.setAttr('aria-label', 'Remove'); removeBtn.onClickEvent(callbacks.onRemove); }
        const editorContainer = editorWrapper.createDiv({ cls: 'callout-editor-content' });
        const iconPreview = editorContainer.createDiv({ cls: 'icon-preview' });
        const updateIcon = (type: string) => {
            const standard = standardCalloutTypes[type];
            const custom = this.plugin.settings.customCallouts.find(c => c.name === type);
            const iconName = standard?.icon || custom?.icon || 'help-circle';
            const finalColor = custom?.color || this.getStandardCalloutColor(type);
            iconPreview.empty(); setIcon(iconPreview, iconName); iconPreview.style.color = finalColor;
        };
        const typeSetting = new Setting(editorContainer).setName("Type");
        typeSetting.controlEl.prepend(iconPreview);
        typeSetting.addDropdown(dd => { this.addCalloutTypeOptions(dd.selectEl, data.type); dd.onChange(val => { data.type = val; callbacks.onUpdate(); }); });
        updateIcon(data.type);
        new Setting(editorContainer).setName("Title").addText(text => text.setValue(data.title).onChange(val => { data.title = val; callbacks.onUpdate(); }));
        if (isParent) {
            const modifierSetting = new Setting(editorContainer).setName("Modifiers");
            modifierSetting.controlEl.createEl('span', { text: 'no-title', cls: 'modifier-label' });
            modifierSetting.addToggle(toggle => toggle.setTooltip("No Title").setValue(data.noTitle).onChange(val => { data.noTitle = val; callbacks.onUpdate(); }));
            modifierSetting.controlEl.createEl('span', { text: 'no-icon', cls: 'modifier-label' });
            modifierSetting.addToggle(toggle => toggle.setTooltip("No Icon").setValue(data.noIcon).onChange(val => { data.noIcon = val; callbacks.onUpdate(); }));
        }
        new Setting(editorContainer).setName("Collapse").addDropdown(dd => { dd.addOption('', 'None').addOption('+', 'Open').addOption('-', 'Closed').setValue(data.collapse).onChange(val => { data.collapse = val; callbacks.onUpdate(); }); });
        new Setting(editorContainer).setName("Content").addTextArea(text => { text.setValue(data.content).onChange(val => { data.content = val; callbacks.onUpdate(); }); text.inputEl.rows = isParent ? 4 : 3; });
    }

    public addInsertButtons(contentEl: HTMLElement) { new Setting(contentEl).addButton(btn => btn.setButtonText("Insert").setCta().onClick(() => this.insertContent())); }
    public insertContent() { const markdown = this.generateMarkdown(); this.editor.replaceSelection(markdown + '\n'); this.close(); }
    public addCalloutTypeOptions(dropdown: HTMLSelectElement, selectedValue: string) { Object.keys(standardCalloutTypes).forEach(key => dropdown.createEl('option', { text: key.charAt(0).toUpperCase() + key.slice(1), value: key })); const customCallouts = this.plugin.settings.customCallouts; if (customCallouts.length > 0) { const group = dropdown.createEl('optgroup', { attr: { label: '---- Custom ----' } }); customCallouts.forEach(c => group.createEl('option', { text: c.name.charAt(0).toUpperCase() + c.name.slice(1), value: c.name })); } dropdown.value = selectedValue; }
    public async updateLivePreview() { if (!this.previewContainer) return; this.previewContainer.empty(); let textToInsert = this.generateMarkdown(); if (textToInsert) { await MarkdownRenderer.renderMarkdown(textToInsert, this.previewContainer, '', this.plugin); } }
    
    public getStandardCalloutColor(type: string): string {
        if (this.standardColorCache.has(type)) { return this.standardColorCache.get(type) || 'var(--text-normal)'; }
        const tempCallout = document.body.createDiv({ cls: 'callout' });
        tempCallout.dataset.callout = type;
        tempCallout.style.position = 'absolute'; tempCallout.style.top = '-9999px'; tempCallout.style.left = '-9999px';
        const colorTriplet = getComputedStyle(tempCallout).getPropertyValue('--callout-color').replace(/\s/g, '');
        tempCallout.remove();
        if (colorTriplet) { const finalColor = `rgb(${colorTriplet})`; this.standardColorCache.set(type, finalColor); return finalColor; }
        return 'var(--text-normal)';
    }

    private generateMarkdown(): string {
        if (this.activeTab === 'multi-column') {
            switch (this.multiColumnStyle) {
                case 'colored-underline': {
                    const formattedCols = this.columns.map(col => `>> [!${col.type}]\n>> ### ${col.title}\n>> ${col.content.trim().replace(/\n/g, '\n>> ')}`);
                    return `> [!multi-column]\n${formattedCols.join('\n>\n')}\n`;
                }
                case 'simple-box': {
                    const formattedCols = this.columns.map(col => `>> [!blank-container]\n>> ### ${col.title}\n>> ${col.content.trim().replace(/\n/g, '\n>> ')}`);
                    return `> [!multi-column]\n${formattedCols.join('\n>\n')}\n`;
                }
                case 'callout-in-column': {
                    const formatCallout = (data: CalloutData, indent: string) => { const modifiers = `${data.noTitle ? '|no-title' : ''}${data.noIcon ? '|no-icon' : ''}`; const content = data.content.trim().replace(/\n/g, `\n${indent} `); return `${indent} [!${data.type}${modifiers}]${data.collapse}${data.title ? ' ' + data.title : ''}\n${indent} ${content}`; };
                    const formattedCols = this.nestedCalloutsForColumns.map(col => formatCallout(col, '>>'));
                    return `> [!multi-column]\n${formattedCols.join('\n>\n')}\n`;
                }
                default:
                    return '<!-- Error: Unknown multi-column style -->';
            }
        } else {
            const formatCallout = (data: CalloutData, indent: string) => { const modifiers = `${data.noTitle ? '|no-title' : ''}${data.noIcon ? '|no-icon' : ''}`; const content = data.content.trim().replace(/\n/g, `\n${indent} `); return `${indent} [!${data.type}${modifiers}]${data.collapse}${data.title ? ' ' + data.title : ''}\n${indent} ${content}`; };
            let textToInsert = formatCallout(this.parent, '>');
            const formattedChildren = this.nestedCallouts.map(child => formatCallout(child, '>>'));
            if (formattedChildren.length > 0) { textToInsert += `\n>\n${formattedChildren.join('\n>\n')}`; }
            return textToInsert;
        }
    }
}