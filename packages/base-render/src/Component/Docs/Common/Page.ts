import { IBlockElement, IFooterData, IHeaderData, Nullable, PageOrientType } from '@univerjs/core';
import { createSkeletonSection } from './Section';
import { BreakType, IDocumentSkeletonFooter, IDocumentSkeletonHeader, IDocumentSkeletonPage, ISkeletonResourceReference } from '../../../Basics/IDocumentSkeletonCached';
import { ISectionBreakConfig } from '../../../Basics/Interfaces';
import { dealWithBlocks } from '../Block';
import { updateBlockIndex } from './Tools';

// 新增数据结构框架
// 判断奇数和偶数页码
export function createSkeletonPage(
    sectionBreakConfig: ISectionBreakConfig,
    skeletonResourceReference: ISkeletonResourceReference,
    pageNumber = 1,
    breakType = BreakType.SECTION
): IDocumentSkeletonPage {
    const page: IDocumentSkeletonPage = _getNullPage();

    const {
        pageNumberStart = 1,
        pageSize = { width: Infinity, height: Infinity },
        pageOrient = PageOrientType.PORTRAIT,
        headerIds = {},
        footerIds = {},
        useFirstPageHeaderFooter,
        useEvenPageHeaderFooter,
        footers,
        headers,
        columnProperties = [],
        columnSeparatorType,
        marginTop = 0,
        marginBottom = 0,
        marginHeader = 0,
        marginFooter = 0,
        marginLeft = 0,
        marginRight = 0,
        renderConfig = {},
    } = sectionBreakConfig;

    const { skeHeaders, skeFooters } = skeletonResourceReference;

    const { width: pageWidth = Infinity, height: pageHeight = Infinity } = pageSize;

    page.pageNumber = pageNumber;
    page.pageNumberStart = pageNumberStart;
    page.renderConfig = renderConfig;

    page.marginLeft = marginLeft;
    page.marginRight = marginRight;
    page.breakType = breakType;
    page.width = page.pageWidth = pageWidth;
    page.height = page.pageHeight = pageHeight;
    page.pageOrient = pageOrient;

    const { defaultHeaderId, evenPageHeaderId, firstPageHeaderId } = headerIds;
    const { defaultFooterId, evenPageFooterId, firstPageFooterId } = footerIds;

    let headerId = defaultHeaderId ?? '';
    let footerId = defaultFooterId ?? '';
    if (pageNumber === pageNumberStart && useFirstPageHeaderFooter) {
        headerId = firstPageHeaderId ?? '';
        footerId = firstPageFooterId ?? '';
    } else if (pageNumber % 2 === 0 && useEvenPageHeaderFooter) {
        headerId = evenPageHeaderId ?? '';
        footerId = evenPageFooterId ?? '';
    }

    let header: Nullable<IDocumentSkeletonHeader>;
    let footer: Nullable<IDocumentSkeletonFooter>;
    if (headerId) {
        if (skeHeaders.get(headerId)?.has(pageWidth)) {
            header = skeHeaders.get(headerId)?.get(pageWidth);
        } else if (headers) {
            header = _createSkeletonHeader(headers[headerId], sectionBreakConfig, skeletonResourceReference) as IDocumentSkeletonHeader;
            skeHeaders.set(headerId, new Map([[pageWidth, header]]));
        }
        page.headerId = headerId;
    }

    if (footerId) {
        if (skeFooters.get(footerId)?.has(pageWidth)) {
            footer = skeFooters.get(footerId)?.get(pageWidth);
        } else if (footers) {
            footer = _createSkeletonHeader(footers[footerId], sectionBreakConfig, skeletonResourceReference) as IDocumentSkeletonFooter;
            skeFooters.set(headerId, new Map([[pageWidth, footer]]));
        }
        page.footerId = footerId;
    }

    page.marginTop = _getVerticalMargin(marginTop, marginHeader, header);
    page.marginBottom = _getVerticalMargin(marginBottom, marginFooter, footer);

    const sections = page.sections;
    const lastSection = sections[sections.length - 1];
    const { marginTop: curPageMT, marginBottom: curPageMB, marginLeft: curPageML, marginRight: curPageMR } = page;
    const pageContentWidth = pageWidth - curPageML - curPageMR;
    const pageContentHeight = pageHeight - curPageMT - curPageMB;
    let lastSectionBottom = 0;
    if (lastSection) {
        lastSectionBottom = lastSection.top + lastSection.height;
    }

    const newSection = createSkeletonSection(columnProperties, columnSeparatorType, lastSectionBottom, 0, pageContentWidth, pageContentHeight - lastSectionBottom);
    newSection.parent = page;
    sections.push(newSection);

    return page;
}

// 检测是否溢出了一页
function checkPageOverflow(page: IDocumentSkeletonPage) {}

function _getNullPage() {
    return {
        sections: [],
        headerId: '',
        footerId: '',
        // page
        pageWidth: 0,
        pageHeight: 0,
        pageOrient: PageOrientType.PORTRAIT,
        pageNumber: 1,
        pageNumberStart: 1,
        verticalAlign: false,
        angle: 0,
        width: 0,
        height: 0,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        marginBottom: 0,
        breakType: BreakType.SECTION,
        st: 0,
        ed: 0,
        skeDrawings: new Map(),
    };
}

function _createSkeletonHeader(
    headerOrFooter: IHeaderData | IFooterData,
    sectionBreakConfig: ISectionBreakConfig,
    skeletonResourceReference: ISkeletonResourceReference,
    isHeader = true
): IDocumentSkeletonHeader | IDocumentSkeletonFooter {
    const { body: headerOrFooterBody } = headerOrFooter;
    const {
        lists,
        headers,
        footers,
        fontLocale,
        pageSize,
        marginLeft = 0,
        marginRight = 0,
        drawings,
        marginTop = 0,
        marginBottom = 0,
        marginHeader = 0,
        marginFooter = 0,
    } = sectionBreakConfig;
    const pageWidth = pageSize?.width || Infinity;
    const headerConfig: ISectionBreakConfig = {
        lists,
        headers,
        footers,
        pageSize: {
            width: pageWidth - marginLeft - marginRight,
            height: Infinity,
        },
        fontLocale,
        drawings,
    };

    const { blockElements, blockElementOrder } = headerOrFooterBody;
    const blockElementArray: IBlockElement[] = [];
    blockElementOrder.forEach((bId: string) => {
        const dcd = blockElements[bId];
        blockElementArray.push(dcd);
    });

    const areaPage = createSkeletonPage(headerConfig, skeletonResourceReference);
    const page = dealWithBlocks(blockElementArray, areaPage, headerConfig, skeletonResourceReference).pages[0];
    updateBlockIndex([page]);
    const column = page.sections[0].columns[0];
    const height = column.height || 0;
    const { skeDrawings, st, ed } = page;

    const headerOrFooterSke = {
        lines: column.lines,
        skeDrawings,
        height,
        st,
        ed,
        marginLeft,
        marginRight,
    };

    if (isHeader) {
        return {
            ...headerOrFooterSke,
            marginTop: __getHeaderMarginTop(marginTop, marginHeader, height),
        };
    }
    return {
        ...headerOrFooterSke,
        marginBottom: __getHeaderMarginBottom(marginBottom, marginFooter, height),
    };
}

function _getVerticalMargin(marginTB: number, marginHF: number, headerOrFooter: Nullable<IDocumentSkeletonHeader> | Nullable<IDocumentSkeletonFooter>) {
    if (!headerOrFooter || headerOrFooter.lines.length === 0) {
        return marginTB;
    }
    return Math.max(marginTB, marginHF, headerOrFooter?.height || 0);
}

function __getHeaderMarginTop(marginTop: number, marginHeader: number, height: number) {
    const maxMargin = Math.max(marginTop, marginHeader);
    if (height > maxMargin) {
        return 0;
    }

    return maxMargin - height;
}

function __getHeaderMarginBottom(marginBottom: number, marginFooter: number, height: number) {
    const maxMargin = Math.max(marginBottom, marginFooter);
    if (height > maxMargin) {
        return 0;
    }

    return maxMargin - height;
}
