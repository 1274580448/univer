import { SheetActionBase, ActionObservers, ISheetActionData, ObjectMatrixPrimitiveType, Workbook } from '@univer/core';
import { SetNumfmtRangeData } from '../Apply/SetNumfmtRangeData';

export interface ISetNumfmtRangeActionData extends ISheetActionData {
    numfmtMatrix: ObjectMatrixPrimitiveType<string>;
}

export class SetNumfmtRangeDataAction extends SheetActionBase<ISetNumfmtRangeActionData, ISetNumfmtRangeActionData> {
    constructor(actionData: ISetNumfmtRangeActionData, workbook: Workbook, observers: ActionObservers) {
        super(actionData, workbook, observers);
        this._doActionData = {
            ...actionData,
            convertor: [],
        };
        this._oldActionData = {
            ...actionData,
            numfmtMatrix: this.do(),
            convertor: [],
        };
    }

    do(): ObjectMatrixPrimitiveType<string> {
        return this.redo();
    }

    redo(): ObjectMatrixPrimitiveType<string> {
        return SetNumfmtRangeData(this.getWorkBook(), this._doActionData.sheetId, this._doActionData.numfmtMatrix);
    }

    undo(): void {
        SetNumfmtRangeData(this.getWorkBook(), this._oldActionData.sheetId, this._oldActionData.numfmtMatrix);
    }

    validate(): boolean {
        return false;
    }
}