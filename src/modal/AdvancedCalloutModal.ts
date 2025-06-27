import { App, Modal, Setting, Editor, setIcon, MarkdownRenderer, Notice, MarkdownView } from "obsidian";
import { default as SuperchargedCalloutsPlugin } from "../main";
import { StandardTab } from "./StandardTab";
import { MultiColumnTab } from "./MultiColumnTab";
import { CalloutData, ColumnData, MultiColumnStyle, standardCalloutTypes, CustomCalloutDefinition, ComponentType } from "../types";
import { generateMarkdown } from "../rendering/MarkdownGenerator";
import { createEditorComponent } from "./editors/ComponentEditor";

export class AdvancedCalloutModal extends Modal {
    public editor: Editor;
    public plugin: SuperchargedCalloutsPlugin;
    public activeTab: 'standard' | 'multi-column' = 'standard';
    public parent: CalloutData | null = null;
    public nestedCallouts: CalloutData[] = [];
    public columns: ColumnData[] = [{ type: 'col-blue', title: 'Column 1', content: '- Item', titleAlign: 'center', contentAlign: 'left', noTitle: false, isCollapsed: false }];
    public multiColumnStyle: MultiColumnStyle = 'component-in-column';
    public nestedCalloutsForColumns: CalloutData[] = [];
    public columnLayout: string = ''; // NEW: Single property for the entire layout
    
    private editorPane: HTMLElement;
    private previewPane: HTMLElement;
    private tabContentContainer: HTMLElement;
    private previewContainer: HTMLElement;
    private standardColorCache: Map<string, string> = new Map();
    private isPreviewVisible = true;

    constructor(app: App, editor: Editor, plugin: SuperchargedCalloutsPlugin) {
        super(app);
        this.editor = editor;
        this.plugin = plugin;
        this.modalEl.addClass('mod-callout-creator', 'sc-modal-resizable');
    }

    onOpen() {
        this.titleEl.setText('Supercharged Callout Creator');
        // Add preview class initially
        this.modalEl.toggleClass('is-preview-visible', this.isPreviewVisible);
        this.renderFrame();
        this.addHelpIcon();
    }

    onClose() {
        this.contentEl.empty();
    }

    private togglePreview = () => {
        this.isPreviewVisible = !this.isPreviewVisible;
        this.modalEl.toggleClass('is-preview-visible', this.isPreviewVisible);
        
        this.updateNav();

        if (this.isPreviewVisible) {
            setTimeout(() => this.updateLivePreview(), 50); // Recalculate preview after animation
        }
    };

    private renderFrame() {
        this.contentEl.empty();
        this.contentEl.addClass('sc-modal-content-container');
        
        // --- Nav Bar ---
        const nav = this.contentEl.createDiv("callout-modal-nav");
        nav.createEl("button", { text: "Standard" }).onclick = () => { 
            this.activeTab = 'standard'; 
            this.renderEditorPane(); 
        };
        nav.createEl("button", { text: "Multi-Column" }).onclick = () => { 
            this.activeTab = 'multi-column'; 
            this.renderEditorPane(); 
        };
        nav.createEl("button", { text: "Live Preview", cls: "sc-preview-tab-btn" }).onclick = () => {
            this.togglePreview();
        };
        
        // --- Panes ---
        const panesContainer = this.contentEl.createDiv('sc-modal-flex-container');
        this.editorPane = panesContainer.createDiv('sc-editor-pane');
        this.previewPane = panesContainer.createDiv('sc-preview-pane');

        this.tabContentContainer = this.editorPane.createDiv("sc-editor-pane-content");
        this.previewContainer = this.previewPane.createDiv("callout-live-preview");
        
        // --- Initial Render ---
        this.renderEditorPane();
    }

    private updateNav() {
        const nav = this.contentEl.querySelector(".callout-modal-nav");
        if (nav) {
            const buttons = Array.from(nav.children);
            const standardBtn = buttons[0];
            const multiColBtn = buttons[1];
            const previewBtn = buttons[2];

            standardBtn.toggleClass('active', this.activeTab === 'standard');
            multiColBtn.toggleClass('active', this.activeTab === 'multi-column');
            previewBtn.toggleClass('active', this.isPreviewVisible);
        }
    }

    private renderEditorPane() {
        this.updateNav();
        this.tabContentContainer.empty();
        if (this.activeTab === 'standard') { new StandardTab(this, this.tabContentContainer).display(); }
        else if (this.activeTab === 'multi-column') { new MultiColumnTab(this, this.tabContentContainer).display(); }
        this.updateLivePreview();
    }

    private addHelpIcon() {
        const closeButtonEl = this.modalEl.querySelector('.modal-close-button');
        if (closeButtonEl) {
            closeButtonEl.insertAdjacentElement('beforebegin', 
                createDiv({ cls: 'callout-modal-help-icon' }, (el) => {
                    setIcon(el, 'help-circle');
                    el.onClickEvent(() => {
                        const helpModal = new Modal(this.app);
                        helpModal.titleEl.setText("Supercharged Callouts Help");
                        const content = helpModal.contentEl;
                        content.createEl("h3", { text: "Standard Callouts" });
                        content.createEl("p", { text: "Use this tab to create a standard callout with optional nested children." });
                        content.createEl("h3", { text: "Multi-Column Callouts" });
                        content.createEl("p", { text: "Use this tab to create side-by-side column layouts." });
                        const list = content.createEl("ul");
                        list.createEl("li", { text: "Colored Underline & Simple Box: For simple, clean columns with an optional title." });
                        list.createEl("li", { text: "Component in Column: Use any standard callout or simple color block as a column for maximum flexibility." });
                        content.createEl("h3", { text: "Settings" });
                        content.createEl("p", { text: "Go to Settings -> Supercharged Callouts to create your own custom callout types, define custom colors, and set a global theme for your entire vault." });
                        helpModal.open();
                    });
                })
            );
        }
    }

    public createNewComponent(type: ComponentType, titlePrefix: 'Title' | 'Column', index: number = 1): CalloutData {
        if (type === 'callout') {
            return {
                componentType: 'callout', type: 'note', title: `${titlePrefix} ${index}`, content: 'Content.',
                collapse: '', noTitle: false, noIcon: false, color: '', titleAlign: 'left', contentAlign: 'left',
                isCollapsed: false,
            };
        } else {
            return {
                componentType: 'color-block', color: '#ecf0f1', content: 'Content.',
                type: '', title: '', collapse: '', noTitle: true, noIcon: true, titleAlign: 'left', contentAlign: 'left',
                isCollapsed: false,
            };
        }
    }

    public createEditorComponent(container: HTMLElement, title: string, data: CalloutData, callbacks: { onRemove?: () => void, onMoveUp?: () => void, onMoveDown?: () => void, onUpdate: () => void }) {
        createEditorComponent(this, container, title, data, callbacks);
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
        const markdown = generateMarkdown(this); 
        this.editor.replaceSelection(markdown + '\n'); 
        this.close(); 
    }

    public addCalloutTypeOptions(dropdown: HTMLSelectElement, selectedValue: string) { 
        Object.keys(standardCalloutTypes).forEach(key => dropdown.createEl('option', { text: key.charAt(0).toUpperCase() + key.slice(1), value: key })); 
        const customCallouts = this.plugin.settings.customCallouts; 
        if (customCallouts.length > 0) { 
            const group = dropdown.createEl('optgroup', { attr: { label: '---- Custom ----' } }); 
            customCallouts.forEach((c: CustomCalloutDefinition) => group.createEl('option', { text: c.name.charAt(0).toUpperCase() + c.name.slice(1), value: c.name })); 
        } 
        dropdown.value = selectedValue; 
    }
    
    public async updateLivePreview() {
        if (!this.previewContainer || !this.isPreviewVisible) return;

        const hasContent = (this.activeTab === 'standard' && this.parent) || 
                           (this.activeTab === 'multi-column' && (this.nestedCalloutsForColumns.length > 0 || this.columns.length > 0));

        if (!hasContent) {
            this.previewContainer.empty();
            this.previewContainer.style.height = 'auto';
            return;
        }

        const textToInsert = generateMarkdown(this);
        this.plugin.applyPluginStyles();
        this.previewContainer.empty();

        if (this.activeTab === 'multi-column') {
            const view = this.app.workspace.getActiveViewOfType(MarkdownView);
            let editorWidth = 650;
            if (view) {
                const contentContainer = view.contentEl.querySelector('.cm-content');
                if (contentContainer) {
                    const ruler = contentContainer.createDiv({ attr: { style: 'width: 100%; height: 0; visibility: hidden;' }});
                    try {
                        editorWidth = ruler.getBoundingClientRect().width;
                    } finally {
                        ruler.remove();
                    }
                }
            }
            
            const previewPadding = 20; // Corresponds to CSS padding
            const previewWidth = this.previewContainer.clientWidth - (previewPadding * 2);
            
            const stage = this.previewContainer.createDiv({ cls: 'sc-preview-stage' });
            stage.style.width = `${editorWidth}px`;
            
            await MarkdownRenderer.renderMarkdown(textToInsert, stage, '', this.plugin);
            await new Promise(resolve => requestAnimationFrame(resolve));

            const stageHeight = stage.offsetHeight;
            const scale = previewWidth > 0 ? previewWidth / editorWidth : 1;
            
            stage.style.transform = `scale(${scale})`;
            this.previewContainer.style.height = `${(stageHeight * scale) + (previewPadding * 2)}px`;

        } else {
            this.previewContainer.style.height = 'auto';
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
}