import { IRangeData, referenceToGrid } from '@univerjs/core';
import { ErrorType } from '../Basics/ErrorType';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { BaseReferenceObject } from './BaseReferenceObject';

export class ColumnReferenceObject extends BaseReferenceObject {
    constructor(token: string) {
        super(token);
        const grid = referenceToGrid(token);
        this.setForcedSheetName(grid.sheetName);
        const rangeData: IRangeData = {
            startColumn: grid.rangeData.startColumn,
            startRow: -1,
            endColumn: -1,
            endRow: -1,
        };
        this.setRangeData(rangeData);
    }

    isColumn() {
        return true;
    }

    unionBy(referenceObject: BaseReferenceObject) {
        if (!referenceObject.isColumn()) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const columnReferenceObject = referenceObject as ColumnReferenceObject;
        if (columnReferenceObject.getForcedSheetName() !== undefined) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const currentRangeData = this.getRangeData();

        if (currentRangeData.endColumn !== -1) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        const newColumn = columnReferenceObject.getRangeData().startColumn;

        const column = currentRangeData.startColumn;

        if (newColumn > column) {
            currentRangeData.endColumn = newColumn;
        } else {
            currentRangeData.startColumn = newColumn;
            currentRangeData.endColumn = column;
        }

        return this;
    }
}
