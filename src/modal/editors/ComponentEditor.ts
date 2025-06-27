import { Setting, setIcon } from "obsidian";
import type { AdvancedCalloutModal } from "../AdvancedCalloutModal";
import { Alignment, CalloutData, CustomCalloutDefinition, standardCalloutTypes } from "../../types";
import { CustomColorPicker } from "../../ui/CustomColorPicker";
import { AlignmentControl } from "../../ui/AlignmentControl";

export function createEditorComponent(
    modal: AdvancedCalloutModal,
    container: HTMLElement,
    title: string,
    data: CalloutData,
    callbacks: { onRemove?: () => void, onMoveUp?: () => void, onMoveDown?: () => void, onUpdate: () => void }
) {
    if (data.componentType === 'callout') {
        createFullCalloutEditor(modal, container, title, data, callbacks);
    } else if (data.componentType === 'color-block') {
        createColorBlockEditor(modal, container, title, data, callbacks);
    }
}

function createEditorHeader(
    modal: AdvancedCalloutModal,
    container: HTMLElement,
    title: string,
    data: CalloutData,
    callbacks: { onRemove?: () => void, onMoveUp?: () => void, onMoveDown?: () => void, onUpdate: () => void }
) {
    const header = container.createDiv({ cls: 'callout-editor-header' });
    header.onClickEvent(() => {
        data.isCollapsed = !data.isCollapsed;
        callbacks.onUpdate();
    });

    header.createEl('span', { text: title, cls: 'callout-editor-header-title' });
    
    const buttonGroup = header.createDiv({ cls: 'callout-editor-button-group' });
    buttonGroup.onClickEvent(e => e.stopPropagation()); // Prevent header click when clicking buttons

    // Action Buttons
    if (callbacks.onMoveUp) { 
        const upBtn = buttonGroup.createEl('button', { cls: 'reorder-btn' }); 
        setIcon(upBtn, 'arrow-up'); 
        upBtn.onClickEvent(() => callbacks.onMoveUp?.()); 
    }
    if (callbacks.onMoveDown) { 
        const downBtn = buttonGroup.createEl('button', { cls: 'reorder-btn' }); 
        setIcon(downBtn, 'arrow-down'); 
        downBtn.onClickEvent(() => callbacks.onMoveDown?.()); 
    }

    const transformBtn = buttonGroup.createEl('button', { cls: 'reorder-btn' });
    setIcon(transformBtn, 'repeat');
    transformBtn.setAttribute('title', "Switch between Callout and Color Block");
    transformBtn.onClickEvent(() => {
        if (data.componentType === 'callout') {
            data.componentType = 'color-block';
            const custom = modal.plugin.settings.customCallouts.find((c: CustomCalloutDefinition) => c.name === data.type);
            data.color = custom?.color || modal.getStandardCalloutColor(data.type);
        } else {
            data.componentType = 'callout';
            data.noIcon = false;
            data.noTitle = false;
        }
        callbacks.onUpdate();
    });

    if (callbacks.onRemove) { 
        const removeBtn = buttonGroup.createEl('button', { cls: 'remove-item-btn' }); 
        setIcon(removeBtn, 'trash-2'); 
        removeBtn.onClickEvent(() => callbacks.onRemove?.()); 
    }
    
    // Collapse Indicator Button
    const collapseBtn = buttonGroup.createEl('button', { cls: 'collapse-btn' });
    setIcon(collapseBtn, 'chevron-down');
    collapseBtn.onClickEvent(() => {
        data.isCollapsed = !data.isCollapsed;
        callbacks.onUpdate();
    });
}

function createColorBlockEditor(
    modal: AdvancedCalloutModal,
    container: HTMLElement,
    title: string,
    data: CalloutData,
    callbacks: { onRemove?: () => void, onMoveUp?: () => void, onMoveDown?: () => void, onUpdate: () => void }
) {
    const editorWrapper = container.createDiv({ cls: 'callout-editor-wrapper' });
    if (data.isCollapsed) {
        editorWrapper.addClass('is-collapsed');
    }
    createEditorHeader(modal, editorWrapper, title, data, callbacks);
    
    const editorContainer = editorWrapper.createDiv({ cls: 'callout-editor-content' });
    
    const colorSetting = new Setting(editorContainer).setName("Color").setDesc("Pick a color for the block.");
    const customPicker = new CustomColorPicker(colorSetting.controlEl);
    customPicker.build(data.color, (newColor) => {
        data.color = newColor;
        modal.updateLivePreview();
    });

    new Setting(editorContainer)
        .setName("No underline")
        .setDesc("Only works with the 'Clean Box' theme.")
        .addToggle(toggle => toggle
            .setValue(!!data.noUnderline)
            .onChange(val => {
                data.noUnderline = val;
                modal.updateLivePreview();
            }));

    const contentAlignSetting = new Setting(editorContainer).setName("Content alignment");
    new AlignmentControl(contentAlignSetting.controlEl, data.contentAlign, (value: Alignment) => {
        data.contentAlign = value;
        modal.updateLivePreview();
    });
    
    new Setting(editorContainer).setName("Content").addTextArea(text => { text.setValue(data.content)
        .onChange(val => { 
            data.content = val; 
            modal.updateLivePreview(); 
        }); 
        text.inputEl.rows = 4; 
    });
}

function createFullCalloutEditor(
    modal: AdvancedCalloutModal,
    container: HTMLElement,
    title: string,
    data: CalloutData,
    callbacks: { onRemove?: () => void, onMoveUp?: () => void, onMoveDown?: () => void, onUpdate: () => void }
) {
    const editorWrapper = container.createDiv({ cls: 'callout-editor-wrapper' });
    if (data.isCollapsed) {
        editorWrapper.addClass('is-collapsed');
    }
    createEditorHeader(modal, editorWrapper, title, data, callbacks);

    const editorContainer = editorWrapper.createDiv({ cls: 'callout-editor-content' });
    
    const typeSetting = new Setting(editorContainer).setName("Type");
    if (!data.noIcon) {
        const iconPreview = editorContainer.createDiv({ cls: 'icon-preview' });
        const updateIcon = (type: string) => {
            const custom = modal.plugin.settings.customCallouts.find((c: CustomCalloutDefinition) => c.name === type);
            const iconName = standardCalloutTypes[type]?.icon || custom?.icon || 'help-circle';
            iconPreview.empty(); setIcon(iconPreview, iconName);
            iconPreview.style.color = custom?.color || modal.getStandardCalloutColor(type);
        };
        typeSetting.controlEl.prepend(iconPreview);
        updateIcon(data.type);
    }
    typeSetting.addDropdown(dd => { modal.addCalloutTypeOptions(dd.selectEl, data.type); 
        dd.onChange(val => { 
            data.type = val; 
            callbacks.onUpdate(); 
        }); 
    });
    
    if (!data.noTitle) {
        new Setting(editorContainer).setName("Title").addText(text => text.setValue(data.title)
            .onChange(val => { 
                data.title = val; 
                modal.updateLivePreview();
            }));

        const titleAlignSetting = new Setting(editorContainer).setName("Title alignment");
        new AlignmentControl(titleAlignSetting.controlEl, data.titleAlign, (value: Alignment) => {
            data.titleAlign = value;
            modal.updateLivePreview();
        });
    }
    
    const handleModifierChange = () => {
        if (data.noIcon && data.noTitle) {
            data.componentType = 'color-block';
            const custom = modal.plugin.settings.customCallouts.find((c: CustomCalloutDefinition) => c.name === data.type);
            data.color = custom?.color || modal.getStandardCalloutColor(data.type);
        }
        callbacks.onUpdate();
    };

    new Setting(editorContainer)
        .setName("Hide icon")
        .addToggle(toggle => toggle
            .setValue(data.noIcon)
            .onChange(val => {
                data.noIcon = val;
                handleModifierChange();
            }));
    
    new Setting(editorContainer)
        .setName("Hide title")
        .addToggle(toggle => toggle
            .setValue(data.noTitle)
            .onChange(val => {
                data.noTitle = val;
                handleModifierChange();
            }));

    new Setting(editorContainer)
        .setName("No underline")
        .setDesc("Only works with the 'Clean Box' theme.")
        .addToggle(toggle => toggle
            .setValue(!!data.noUnderline)
            .onChange(val => {
                data.noUnderline = val;
                modal.updateLivePreview();
            }));

    const contentAlignSetting = new Setting(editorContainer).setName("Content alignment");
    new AlignmentControl(contentAlignSetting.controlEl, data.contentAlign, (value: Alignment) => {
        data.contentAlign = value;
        modal.updateLivePreview();
    });
    
    new Setting(editorContainer).setName("Collapse").addDropdown(dd => { dd.addOption('', 'None').addOption('+', 'Open').addOption('-', 'Closed')
        .setValue(data.collapse)
        .onChange(val => { 
            data.collapse = val; 
            modal.updateLivePreview(); 
        }); 
    });

    new Setting(editorContainer).setName("Content").addTextArea(text => { text.setValue(data.content)
        .onChange(val => { 
            data.content = val; 
            modal.updateLivePreview(); 
        }); 
        text.inputEl.rows = 4; 
    });
}