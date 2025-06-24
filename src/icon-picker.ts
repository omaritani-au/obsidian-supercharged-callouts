// icon-picker.ts

import { App, Modal, Setting, setIcon, getIconIds } from "obsidian";

export class IconPickerModal extends Modal {
    private iconList: string[];
    private onChoose: (icon: string) => void;
    private color?: string;

    constructor(app: App, onChoose: (icon: string) => void, color?: string) {
        super(app);
        this.onChoose = onChoose;
        this.color = color;
        this.iconList = getIconIds();
        this.modalEl.addClass('mod-icon-picker');
    }

    onOpen() {
        this.contentEl.empty();
        this.contentEl.createEl("h2", { text: "Browse Icons" });

        const searchSetting = new Setting(this.contentEl)
            .setName("Search")
            .addText(text => {
                text.setPlaceholder("e.g., box, arrow, ...")
                text.onChange(value => {
                    this.renderIcons(value.toLowerCase());
                });
                // Auto-focus the search bar
                text.inputEl.focus();
            });

        const iconGrid = this.contentEl.createDiv({ cls: 'icon-picker-grid' });
        this.renderIcons(); // Initial render of all icons
    }

    renderIcons(filter: string = "") {
        const iconGrid = this.contentEl.querySelector('.icon-picker-grid');
        if (!iconGrid) return;

        iconGrid.empty();

        this.iconList
            .filter(icon => icon.includes(filter))
            .forEach(iconId => {
                const iconButton = iconGrid.createDiv({ cls: 'icon-picker-button' });
                setIcon(iconButton, iconId);
                iconButton.dataset.iconId = iconId;


                 if (this.color) {
                    iconButton.style.color = this.color;
                }
                
                iconButton.onClickEvent(() => {
                    this.onChoose(iconId);
                    this.close();
                });
            });
    }

    onClose() {
        this.contentEl.empty();
    }
}