// src/rendering/PostProcessor.ts

import { MarkdownPostProcessor } from "obsidian";

export const SuperchargedCalloutPostProcessor: MarkdownPostProcessor = (element, context) => {
    const callouts = element.findAll('.callout');
    if (callouts.length === 0) return;

    for (const calloutEl of callouts) {
        const calloutType = calloutEl.dataset.callout;
        if (calloutType === 'multi-column') {
            calloutEl.addClass('mcm-container');
            const contentEl = calloutEl.querySelector<HTMLElement>(':scope > .callout-content');
            if (contentEl) {
                contentEl.addClass('mcm-content-container');
                
                // NEW: Apply individual flex properties to children for robust wrapping layouts
                const metadata = calloutEl.dataset.calloutMetadata;
                if (metadata) {
                    const widthMatch = metadata.match(/widths=([^_|\]]+(?:_[^_|\]]+)*)/);
                    if (widthMatch && widthMatch[1]) {
                        const widths = widthMatch[1].split('_').map(w => parseFloat(w) || 1);
                        const columns = contentEl.querySelectorAll<HTMLElement>(':scope > .callout');
                        
                        columns.forEach((column, index) => {
                            const growFactor = widths[index % widths.length];
                            column.style.flexGrow = `${growFactor}`;
                            column.style.flexBasis = '0'; // Ensure grow factor is the primary determinant of size
                        });
                    }
                }
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
};