import { ISlideData, PageElementType, PageType, ShapeType } from '@univerjs/core';
import { DEFAULT_SECOND_PAGE } from './DefaultPages/Page2';
import { DEFAULT_THIRD_PAGE } from './DefaultPages/Page3';
import { DEFAULT_FORTH_PAGE } from './DefaultPages/Page4';
import { DEFAULT_FIFTH_PAGE } from './DefaultPages/Page5';
import { DEFAULT_SIXTH_PAGE } from './DefaultPages/Page6';

export function generateUnlimitedSlideData(ratio: number = 1, slideData?: ISlideData): ISlideData {
    const result: ISlideData = {
        id: 'slide_unlimited',
        title: 'UniverSlide',
        pageSize: {
            width: 960,
            height: 540,
        },
        body: {
            pages: {
                unlimited_1: {
                    id: 'unlimited_1',
                    pageType: PageType.SLIDE,
                    zIndex: 1,
                    title: 'unlimited',
                    description: 'this is seven page, unlimited',
                    pageBackgroundFill: {
                        rgb: 'rgb(255,255,255)',
                    },
                    pageElements: {
                        background1: {
                            id: 'background1',
                            zIndex: 0,
                            left: 0,
                            top: 0,
                            width: 960,
                            height: 540,
                            title: 'background',
                            description: '',
                            type: PageElementType.IMAGE,
                            image: {
                                imageProperties: {
                                    contentUrl: 'https://minio.cnbabylon.com/univer/slide/Picture1.jpg',
                                },
                            },
                        },
                        mask1: {
                            id: 'mask1',
                            zIndex: 1,
                            left: 0,
                            top: 0,
                            width: 960,
                            height: 540,
                            title: 'mask',
                            description: '',
                            type: PageElementType.SHAPE,
                            shape: {
                                shapeType: ShapeType.RECTANGLE,
                                text: '',
                                shapeProperties: {
                                    shapeBackgroundFill: {
                                        rgb: 'rgba(0,0,0,0.7)',
                                    },
                                },
                            },
                        },
                        text1: {
                            id: 'text1',
                            zIndex: 2,
                            left: 300,
                            top: 200,
                            width: 400,
                            height: 140,
                            title: 'mask',
                            description: '',
                            type: PageElementType.TEXT,
                            richText: {
                                text: 'Univer slide',
                                fs: 64,
                                cl: {
                                    rgb: 'rgb(244,79,86)',
                                },
                                bl: 1,
                            },
                        },
                        centerRect1: {
                            id: 'centerRect1',
                            zIndex: 1,
                            left: 378,
                            top: 0,
                            width: 204,
                            height: 144,
                            title: 'mask',
                            description: '',
                            type: PageElementType.SHAPE,
                            shape: {
                                shapeType: ShapeType.RECTANGLE,
                                text: '',
                                shapeProperties: {
                                    shapeBackgroundFill: {
                                        rgb: 'rgb(244,79,86)',
                                    },
                                },
                            },
                        },
                        year1: {
                            id: 'year1',
                            zIndex: 2,
                            left: 430,
                            top: 42,
                            width: 100,
                            height: 40,
                            title: 'mask',
                            description: '',
                            type: PageElementType.TEXT,
                            richText: {
                                text: '2022',
                                fs: 48,
                                cl: {
                                    rgb: 'rgb(255,255,255)',
                                },
                                bl: 1,
                            },
                        },
                        content1: {
                            id: 'content1',
                            zIndex: 2,
                            left: 80,
                            top: 300,
                            width: 780,
                            height: 140,
                            title: 'mask',
                            description: '',
                            type: PageElementType.TEXT,
                            richText: {
                                text: 'The concepts national income and national product have roughly the same value and can be used interchangeably if our interest is in their sum total which is measured as the market value of the total output of goods and services of an economy in a given period, usually a year.',
                                fs: 14,
                                cl: {
                                    rgb: 'rgb(255,255,255)',
                                },
                                bl: 1,
                            },
                        },
                    },
                },
                catalog_1: DEFAULT_SECOND_PAGE,
                strategic_1: DEFAULT_THIRD_PAGE,
                technology_1: DEFAULT_FIFTH_PAGE,
                richText_1: DEFAULT_SIXTH_PAGE,
                business_1: DEFAULT_FORTH_PAGE,
            },
            pageOrder: ['unlimited_1', 'catalog_1', 'strategic_1', 'technology_1', 'richText_1', 'business_1'],
        },
    };

    if (slideData) {
        result.body!.pages.unlimited_1.pageElements.slide = {
            id: 'slide',
            zIndex: 3,
            left: (960 * (1 - ratio)) / 2,
            top: (540 * (1 - ratio)) / 2,
            width: 960,
            height: 540,
            scaleX: ratio,
            scaleY: ratio,
            title: 'slide',
            description: '',
            type: PageElementType.SLIDE,
            slide: slideData,
        };
    }

    return result;
}
