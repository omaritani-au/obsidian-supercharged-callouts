// src/rendering/MarkdownGenerator.ts

import SuperchargedCalloutsPlugin from "../main";
import { AdvancedCalloutModal } from "../modal/AdvancedCalloutModal";
import { CalloutData, ColumnData, MultiColumnStyle } from "../types";

export function generateMarkdown(modal: AdvancedCalloutModal): string {
    modal.plugin.clearTemporaryStyles();

    if (!modal.parent && modal.activeTab === 'standard') return '';

    const formatComponent = (data: CalloutData, indent: string): string => {
        const content = data.content.trim().replace(/\n/g, `\n${indent} `);
        let alignment = `|c-${data.contentAlign}`;
        const noUnderline = data.noUnderline ? '|no-ul' : '';

        if (data.componentType === 'callout') {
            const modifiers = `${data.noTitle ? '|no-title' : ''}${data.noIcon ? '|no-icon' : ''}`;
            if (data.titleAlign !== 'left') alignment += `|t-${data.titleAlign}`;
            let title = data.title ? ' ' + data.title : '';
            if (data.noTitle && !title.trim() && !data.noUnderline) {
                title = '  ';
            }
            return `${indent} [!${data.type}${modifiers}${alignment}${noUnderline}]${data.collapse}${title}\n${indent} ${content}`;
        } else {
            const tempCalloutName = `sc-temp-${data.color.substring(1)}`;
            modal.plugin.addTemporaryCalloutStyle(tempCalloutName, data.color);
            
            if (data.noUnderline) {
                return `${indent} [!${tempCalloutName}|no-title|no-icon${alignment}${noUnderline}]\n${indent} ${content}`;
            } else {
                return `${indent} [!${tempCalloutName}|no-icon${alignment}]  \n${indent} ${content}`;
            }
        }
    };

    if (modal.activeTab === 'multi-column') {
        let formattedCols: string[] = [];

        switch (modal.multiColumnStyle) {
            case 'colored-underline':
            case 'simple-box': {
                if (modal.columns.length === 0) return '> [!multi-column]\n>\n';
                formattedCols = modal.columns.map((col: ColumnData) => {
                    const type = modal.multiColumnStyle === 'simple-box' ? 'blank-container' : col.type;
                    const noUnderline = col.noUnderline ? '|no-ul' : '';
                    let alignment = `|c-${col.contentAlign}`;
                    if (col.titleAlign !== 'left') alignment += `|t-${col.titleAlign}`;
                    const titleContent = col.noTitle && !col.noUnderline ? ' ' : col.title;
                    const titleLine = col.noTitle ? (col.noUnderline ? '' : `>> ### ${titleContent}\n`) : `>> ### ${titleContent}\n`;
                    const contentLine = `>> ${col.content.trim().replace(/\n/g, '\n>> ')}`;
                    return `>> [!${type}${alignment}${noUnderline}]\n${titleLine}${contentLine}`;
                });
                break;
            }
            case 'component-in-column': {
                if (modal.nestedCalloutsForColumns.length === 0) return '> [!multi-column]\n>\n';
                formattedCols = modal.nestedCalloutsForColumns.map(col => formatComponent(col, '>>'));
                break;
            }
        }

        const layout = modal.columnLayout.trim();
        const widthString = layout ? `|widths=${layout.replace(/\s+/g, '_')}` : '';
        const mainContainer = `> [!multi-column${widthString}]\n`;
        
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