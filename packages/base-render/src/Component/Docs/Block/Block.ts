import { BlockType, ContextBase, IBlockElement } from '@univerjs/core';
import { dealWidthParagraph } from './Paragraph';
import { dealWithBlockError } from './BlockError';
import { IDocumentSkeletonPage, ISkeletonResourceReference } from '../../../Basics/IDocumentSkeletonCached';
import { ISectionBreakConfig } from '../../../Basics/Interfaces';
import { dealWidthCustomBlock } from '../../../Custom/UseCustom';

export function dealWithBlocks(
    Blocks: IBlockElement[],
    curPage: IDocumentSkeletonPage,
    sectionBreakConfig: ISectionBreakConfig,
    skeletonResourceReference: ISkeletonResourceReference,
    preRenderedBlockIdMap?: Map<string, boolean>,
    context?: ContextBase
) {
    const allCurrentSkeletonPages: IDocumentSkeletonPage[] = [];
    const renderedBlockIdMap = new Map<string, boolean>();
    for (let block of Blocks) {
        const { paragraph, table, tableOfContents, blockType, customBlock, blockId } = block;
        if (preRenderedBlockIdMap?.get(blockId)) {
            continue;
        }
        let blockSkeletonPages: IDocumentSkeletonPage[] = [];
        let currentPageCache = curPage;
        if (allCurrentSkeletonPages.length > 0) {
            currentPageCache = allCurrentSkeletonPages[allCurrentSkeletonPages.length - 1];
        }
        if (blockType === BlockType.PARAGRAPH && paragraph) {
            // Paragraph 段落
            blockSkeletonPages = dealWidthParagraph(block.blockId, paragraph, currentPageCache, sectionBreakConfig, skeletonResourceReference, context);
        } else if (blockType === BlockType.TABLE && table) {
            // Table 表格
        } else if (blockType === BlockType.SECTION_BREAK && tableOfContents) {
            // TableOfContents 目录
        } else if (blockType === BlockType.CUSTOM) {
            blockSkeletonPages = dealWidthCustomBlock(block.blockId, customBlock, currentPageCache, sectionBreakConfig, skeletonResourceReference, context);
        }

        if (blockSkeletonPages.length === 0) {
            blockSkeletonPages = dealWithBlockError();
        }

        _pushPage(allCurrentSkeletonPages, blockSkeletonPages);

        renderedBlockIdMap.set(blockId, true);
    }

    return {
        pages: allCurrentSkeletonPages,
        renderedBlockIdMap,
    };
}

function _pushPage(allCurrentSkeletonPages: IDocumentSkeletonPage[], blockSkeletonPages: IDocumentSkeletonPage[]) {
    const lastIndex = allCurrentSkeletonPages.length - 1;
    const lastOldPage = allCurrentSkeletonPages[lastIndex];
    const firstNewPage = blockSkeletonPages[0];

    if (lastOldPage === firstNewPage) {
        blockSkeletonPages.splice(0, 1);
    }

    allCurrentSkeletonPages.push(...blockSkeletonPages);
}

// 当本节有多个列，且下一节为连续节类型的时候，需要按照列数分割，重新计算lines
export function dealWidthBlocksByMultiColumnAndContinuous() {}
