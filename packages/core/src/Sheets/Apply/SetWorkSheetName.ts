import { WorkSheet } from '../Domain/WorkSheet';

/**
 *
 * @param worksheet
 * @param sheetName
 * @returns
 *
 * @internal
 */
export function SetWorkSheetName(worksheet: WorkSheet, sheetName: string): string {
    // get config
    const config = worksheet.getConfig();

    // store old sheet name
    const oldSheetName = config.name;

    // set new sheet name
    config.name = sheetName;

    // return old sheet name to undo
    return oldSheetName;
}