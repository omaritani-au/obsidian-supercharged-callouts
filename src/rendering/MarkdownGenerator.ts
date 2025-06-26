// src/rendering/MarkdownGenerator.ts

import SuperchargedCalloutsPlugin from "../main";
import { AdvancedCalloutModal } from "../modal/AdvancedCalloutModal";
import { CalloutData, MultiColumnStyle } from "../types";

export function generateMarkdown(modal: AdvancedCalloutModal): string {
    modal.plugin.clearTemporaryStyles();

    if (!modal.parent && modal.activeTab === 'standard') return '';

    const formatComponent = (data: CalloutData, indent: string): string => {
        const content = data.content.trim().replace(/\n/g, `\n${indent} `);
        let alignment = `|c-${data.contentAlign}`;

        if (data.componentType === 'callout') {
            const modifiers = `${data.noTitle ? '|no-title' : ''}${data.noIcon ? '|no-icon' : ''}`;
            if (data.titleAlign !== 'left') alignment += `|t-${data.titleAlign}`;
            let title = data.title ? ' ' + data.title : '';
            // If the title is hidden AND it's empty, add a non-breaking space to preserve the title bar for the underline.
            if (data.noTitle && !title.trim()) {
                title = '  ';
            }
            return `${indent} [!${data.type}${modifiers}${alignment}]${data.collapse}${title}\n${indent} ${content}`;
        } else {
            // This is a color-block.
            const tempCalloutName = `sc-temp-${data.color.substring(1)}`;
            modal.plugin.addTemporaryCalloutStyle(tempCalloutName, data.color);
            // BUG FIX: Generate with a non-breaking space title and only the |no-icon modifier.
            // This ensures the title bar renders and gets an underline from the theme, just like a headless callout.
            return `${indent} [!${tempCalloutName}|no-icon${alignment}]  \n${indent} ${content}`;
        }
    };

    if (modal.activeTab === 'multi-column') {
        const mainContainer = `> [!multi-column]\n`;
        let formattedCols: string[] = [];
        switch (modal.multiColumnStyle) {
            case 'colored-underline':
            case 'simple-box': {
                if (modal.columns.length === 0) return '> [!multi-column]\n>\n';
                formattedCols = modal.columns.map(col => {
                    const type = modal.multiColumnStyle === 'simple-box' ? 'blank-container' : col.type;
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
                if (modal.nestedCalloutsForColumns.length === 0) return '> [!multi-column]\n>\n';
                formattedCols = modal.nestedCalloutsForColumns.map(col => formatComponent(col, '>>'));
                break;
            }
        }
        return mainContainer + formattedCols.join('\n>\n') + '\n';
    } else {
        if (!modal.parent) return '';
        let textToInsert = formatComponent(modal.parent, '>');
        const formattedChildren = modal.nestedCallouts.map(child => formatComponent(child, '>>'));
        if (formattedChildren.length > 0) {
            textToInsert += `\n>\n${formattedChildren.join('\n>\n')}`;
        }
        return textToInsert;
    }
}