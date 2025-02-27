import { Nullable } from '@univerjs/core';
import { CalculateValueType, ConcatenateType } from '../Basics/Common';
import { ErrorType } from '../Basics/ErrorType';
import { ObjectClassType } from '../Basics/ObjectClassType';
import { compareToken } from '../Basics/Token';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';

export class BaseValueObject extends ObjectClassType {
    isValueObject() {
        return true;
    }

    constructor(private _rawValue: string | number | boolean) {
        super();
    }

    getValue(): string | number | boolean {
        /** abstract */
        return 0;
    }

    getArrayValue(): CalculateValueType[][] {
        /** abstract */
        return [];
    }

    setValue(value: string | number | boolean) {
        /** abstract */
    }

    setArrayValue(value: CalculateValueType[][]) {
        /** abstract */
    }

    isArray() {
        return false;
    }

    isString() {
        return false;
    }

    isNumber() {
        return false;
    }

    isBoolean() {
        return false;
    }

    isError() {
        return false;
    }

    getNegative(): CalculateValueType {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    getReciprocal(): CalculateValueType {
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    plus(valueObject: BaseValueObject): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    minus(valueObject: BaseValueObject): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    multiply(valueObject: BaseValueObject): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    divided(valueObject: BaseValueObject): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    compare(valueObject: BaseValueObject, operator: compareToken): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    concatenateFront(valueObject: BaseValueObject): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    concatenateBack(valueObject: BaseValueObject): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    plusBy(value: string | number | boolean): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    minusBy(value: string | number | boolean): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    multiplyBy(value: string | number | boolean): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    dividedBy(value: string | number | boolean): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    compareBy(value: string | number | boolean, operator: compareToken): CalculateValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.VALUE);
    }

    concatenate(value: string | number | boolean, concatenateType = ConcatenateType.FRONT): CalculateValueType {
        let currentValue = this.getValue().toString();
        if (typeof value === 'string') {
            if (concatenateType === ConcatenateType.FRONT) {
                currentValue = value + currentValue;
            } else {
                currentValue += value;
            }
        } else if (typeof value === 'number') {
            if (concatenateType === ConcatenateType.FRONT) {
                currentValue = value.toString() + currentValue;
            } else {
                currentValue += value.toString();
            }
        } else if (typeof value === 'boolean') {
            const booleanString = value ? 'TRUE' : 'FALSE';
            if (concatenateType === ConcatenateType.FRONT) {
                currentValue = booleanString + currentValue;
            } else {
                currentValue += booleanString;
            }
        }
        this.setValue(currentValue);
        return this;
    }
}
