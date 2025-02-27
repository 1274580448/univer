import { Picture } from '@univerjs/base-render';
import { IPageElement, PageElementType } from '@univerjs/core';
import { ObjectAdaptor, CanvasObjectProviderRegistry } from '../Adaptor';

export class ImageAdaptor extends ObjectAdaptor {
    zIndex = 1;
    viewKey = PageElementType.IMAGE;

    check(type: PageElementType) {
        if (type !== this.viewKey) {
            return;
        }
        return this;
    }

    convert(pageElement: IPageElement) {
        const { id, zIndex, left = 0, top = 0, width, height, angle, scaleX, scaleY, skewX, skewY, flipX, flipY, title, description, image = {} } = pageElement;
        const { imageProperties, placeholder, link } = image;

        const contentUrl = imageProperties?.contentUrl || '';

        return new Picture(id, {
            url: contentUrl,
            top,
            left,
            width,
            height,
            zIndex,
            angle,
            scaleX,
            scaleY,
            skewX,
            skewY,
            flipX,
            flipY,
            isTransformer: true,
            forceRender: true,
        });
    }
}

CanvasObjectProviderRegistry.add(new ImageAdaptor());
