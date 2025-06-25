import { Plugin, Menu, MenuItem, Editor } from 'obsidian';
import { AdvancedCalloutModal } from './modal/AdvancedCalloutModal';
import { CalloutManagerSettingTab } from './settings';

export interface CustomCalloutDefinition { name: string; icon: string; color: string; }
export interface ColumnColorDefinition { name:string; color: string; }
export type CalloutStyle = 'default' | 'clean-inbox' | 'borderless';
export interface MyPluginSettings { customCallouts: CustomCalloutDefinition[]; calloutStyle: CalloutStyle; customColumnColors: ColumnColorDefinition[]; }
export const DEFAULT_SETTINGS: MyPluginSettings = { customCallouts: [], calloutStyle: 'clean-inbox', customColumnColors: [] };
const STYLE_ID = 'supercharged-callout-styles';

function hexToRgb(hex: string): string | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` : null;
}

export default class SuperchargedCalloutsPlugin extends Plugin {
    settings: MyPluginSettings;
    private temporaryStyles: Map<string, string> = new Map();

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new CalloutManagerSettingTab(this.app, this));
        this.applyPluginStyles();

        this.registerEvent(this.app.workspace.on('editor-menu', (menu: Menu, editor: Editor) => {
            menu.addItem((item: MenuItem) => {
                item.setTitle("Insert supercharged callout...")
                    .setIcon("layout-template")
                    .onClick(() => new AdvancedCalloutModal(this.app, editor, this).open());
            });
        }));

        this.registerMarkdownPostProcessor((element, context) => {
            const callouts = element.findAll('.callout');
            if (callouts.length === 0) return;

            for (const calloutEl of callouts) {
                const calloutType = calloutEl.dataset.callout;
                if (calloutType === 'multi-column') {
                    calloutEl.addClass('mcm-container');
                    const contentEl = calloutEl.querySelector<HTMLElement>(':scope > .callout-content');
                    if (contentEl) {
                        contentEl.addClass('mcm-content-container');
                    }
                }

                const metadata = calloutEl.dataset.calloutMetadata;
                if (!metadata) {
                    calloutEl.addClass('sc-title-align-left', 'sc-content-align-left');
                    continue;
                };

                const hasNoTitle = metadata.includes('no-title');
                const hasNoIcon = metadata.includes('no-icon');

                if (hasNoTitle) {
                    const titleInnerEl = calloutEl.querySelector<HTMLElement>('.callout-title-inner');
                    if (titleInnerEl) {
                        titleInnerEl.style.display = 'none';
                    }
                }
                
                if (hasNoIcon) {
                    const iconEl = calloutEl.querySelector<HTMLElement>('.callout-icon');
                    if (iconEl) {
                        iconEl.style.display = 'none';
                    }
                }

                if (hasNoTitle && hasNoIcon) {
                    calloutEl.addClass('sc-headless');
                }

                if (metadata.includes('t-center')) {
                    calloutEl.addClass('sc-title-align-center');
                } else if (metadata.includes('t-right')) {
                    calloutEl.addClass('sc-title-align-right');
                } else {
                    calloutEl.addClass('sc-title-align-left');
                }

                if (metadata.includes('c-center')) {
                    calloutEl.addClass('sc-content-align-center');
                } else if (metadata.includes('c-right')) {
                    calloutEl.addClass('sc-content-align-right');
                } else {
                    calloutEl.addClass('sc-content-align-left');
                }
            }
        });
    }

    onunload() {
        this.removePluginStyles();
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    public applyPluginStyles() {
        document.getElementById(STYLE_ID)?.remove(); // Always remove old styles first
        if (this.settings.calloutStyle !== 'default') {
            document.body.classList.add(`callouts-style-${this.settings.calloutStyle}`);
        }
        this.injectAllCustomStyles();
    }

    // --- BUG FIX: This no longer applies styles, it just stores them ---
    public addTemporaryCalloutStyle(name: string, color: string) {
        this.temporaryStyles.set(name, color);
    }

    // --- NEW: Expose a way to clear the styles before a new render ---
    public clearTemporaryStyles() {
        this.temporaryStyles.clear();
    }

    private removePluginStyles() {
        document.body.classList.remove('callouts-style-clean-inbox', 'callouts-style-borderless');
        this.clearTemporaryStyles(); // Use the new clear function
        document.getElementById(STYLE_ID)?.remove();
    }

    private injectAllCustomStyles() {
        const styleEl = document.createElement('style');
        styleEl.id = STYLE_ID;
        styleEl.innerHTML = this.generateCssFromSettings();
        document.head.appendChild(styleEl);
    }

    async saveAndApplyStyles() {
        await this.saveSettings();
        this.applyPluginStyles();
    }

    private generateCssFromSettings(): string {
        let cssContent = '';
        this.settings.customCallouts.forEach(callout => {
            const rgbColor = hexToRgb(callout.color);
            if (rgbColor) {
                const iconName = callout.icon.startsWith('lucide-') ? callout.icon.substring(7) : callout.icon;
                cssContent += `.callout[data-callout="${callout.name}"] { --callout-color: ${rgbColor}; --callout-icon: lucide-${iconName}; }\n`;
            }
        });
        this.settings.customColumnColors.forEach(columnColor => {
            cssContent += `.mcm-container .callout[data-callout="${columnColor.name}"] h3 { border-bottom-color: ${columnColor.color} !important; }\n`;
        });
        this.temporaryStyles.forEach((color, name) => {
            const rgbColor = hexToRgb(color);
            if (rgbColor) {
                cssContent += `.callout[data-callout="${name}"] { --callout-color: ${rgbColor}; }\n`;
            }
        });
        return cssContent;
    }
}