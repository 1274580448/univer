import {
    BooleanNumber,
    GridType,
    IDocStyleBase,
    IDocumentLayout,
    IOffset,
    IParagraphStyle,
    IReferenceSource,
    IScale,
    ISectionBreakBase,
    ISize,
    ITextStyle,
    ITransformState,
} from '@univerjs/core';
import { TextSelection } from '../Component/Docs/Common/TextSelection';
import { Documents } from '../Component/Docs/Document';
import {
    IDocumentSkeletonBlockAnchor,
    IDocumentSkeletonBullet,
    IDocumentSkeletonDrawing,
    IDocumentSkeletonFontStyle,
    IDocumentSkeletonFooter,
    IDocumentSkeletonHeader,
} from './IDocumentSkeletonCached';
import { Vector2 } from './Vector2';

export interface IObjectFullState extends ITransformState {
    strokeWidth?: number;
    zIndex?: number;
    isTransformer?: boolean;
    forceRender?: boolean;
}

export interface IRect extends ISize, IOffset {
    points: Vector2[];
}

export interface ISceneTransformState extends ISize, IScale {}

export enum TRANSFORM_CHANGE_OBSERVABLE_TYPE {
    translate,
    resize,
    scale,
    skew,
    flip,
    all,
}

export interface ITransformChangeState {
    type: TRANSFORM_CHANGE_OBSERVABLE_TYPE;
    value: number | string | boolean | { x: number | string | boolean; y: number | string | boolean } | IObjectFullState | ISceneTransformState;
    preValue: number | string | boolean | { x: number | string | boolean; y: number | string | boolean } | IObjectFullState | ISceneTransformState;
}

export interface IFontLocale {
    fontList: string[];
    defaultFontSize: number;
}

export interface IMeasureTextCache {
    fontBoundingBoxAscent: number;
    fontBoundingBoxDescent: number;
    actualBoundingBoxAscent: number;
    actualBoundingBoxDescent: number;
    width: number;
}

export interface IDocsConfig extends IReferenceSource, IDocumentLayout {
    fontLocale: IFontLocale;
    documentTextStyle?: ITextStyle;
}

export interface IHeaderIds {
    defaultHeaderId?: string;
    evenPageHeaderId?: string;
    firstPageHeaderId?: string;
}

export interface IFooterIds {
    defaultFooterId?: string;
    evenPageFooterId?: string;
    firstPageFooterId?: string;
}

export interface ISectionBreakConfig extends IDocStyleBase, ISectionBreakBase, IDocsConfig {
    headerIds?: IHeaderIds;
    footerIds?: IFooterIds;
    useFirstPageHeaderFooter?: BooleanNumber;
    useEvenPageHeaderFooter?: BooleanNumber;
}

export interface IParagraphConfig {
    blockId: string;
    paragraphAffectSkeDrawings?: Map<string, IDocumentSkeletonDrawing>;
    // headerAndFooterAffectSkeDrawings?: Map<string, IDocumentSkeletonDrawing>;
    bulletSkeleton?: IDocumentSkeletonBullet;
    // pageContentWidth: number;
    // pageContentHeight: number;
    paragraphStyle?: IParagraphStyle;
    skeHeaders: Map<string, Map<number, IDocumentSkeletonHeader>>;
    skeFooters: Map<string, Map<number, IDocumentSkeletonFooter>>;
    blockAnchor?: Map<string, IDocumentSkeletonBlockAnchor>;
    // sectionBreakConfig: ISectionBreakConfig;
}

export interface IFontCreateConfig {
    fontStyle: IDocumentSkeletonFontStyle;
    textStyle: ITextStyle;
    charSpace: number;
    gridType?: GridType;
    snapToGrid: BooleanNumber;
    pageWidth?: number;
}

export interface IEditorInputConfig {
    event: Event | CompositionEvent | KeyboardEvent;
    content?: string;
    document: Documents;
    activeSelection?: TextSelection;
    selectionList?: TextSelection[];
}

// export interface IPageConfig {
//     pageNumberStart: number;
//     pageSize: ISizeData;
//     headerIds: IHeaderIds;
//     footerIds: IFooterIds;
//     footers?: IFooters;
//     headers?: IHeaders;
//     useFirstPageHeaderFooter?: boolean;
//     useEvenPageHeaderFooter?: boolean;
// }
