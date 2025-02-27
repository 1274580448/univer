import { IMouseEvent, IPointerEvent, Rect, Spreadsheet, SpreadsheetColumnTitle, SpreadsheetRowTitle, ScrollTimer } from '@univerjs/base-render';
import { Nullable, Observer, Worksheet, ISelection, makeCellToSelection, IRangeData, RangeList, Range, IRangeCellData, ICellInfo, Command, Direction } from '@univerjs/core';
import { ACTION_NAMES, ISelectionsConfig } from '../../Basics';
import { ISelectionModelValue, ISetSelectionValueActionData } from '../../Model/Action/SetSelectionValueAction';
import { SelectionModel } from '../../Model/SelectionModel';
import { SheetPlugin } from '../../SheetPlugin';
import { SheetView } from '../../View/Render/Views/SheetView';
import { ColumnTitleController } from './ColumnTitleController';
import { DragLineController } from './DragLineController';
import { RowTitleController } from './RowTitleController';
import { SelectionControl, SELECTION_TYPE } from './SelectionController';

/**
 * TODO 注册selection拦截，可能在有公式ArrayObject时，fx公式栏显示不同
 *
 * SelectionManager 维护model数据list，action也是修改这一层数据，obs监听到数据变动后，自动刷新（control仍然可以持有数据）
 */
export class SelectionManager {
    private _mainComponent: Spreadsheet;

    private _rowComponent: SpreadsheetRowTitle;

    private _columnComponent: SpreadsheetColumnTitle;

    private _leftTopComponent: Rect;

    private _moveObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _upObserver: Nullable<Observer<IPointerEvent | IMouseEvent>>;

    private _selectionControls: SelectionControl[] = []; // sheetID:Controls

    private _selectionModels = new Map<string, SelectionModel[]>(); // sheetID:Models

    private _plugin: SheetPlugin;

    private _startSelectionRange: ISelection;

    private _startOffsetX: number = 0;

    private _startOffsetY: number = 0;

    private _worksheet: Nullable<Worksheet>;

    private _columnTitleControl: ColumnTitleController;

    private _rowTitleControl: RowTitleController;

    private _dragLineControl: DragLineController;

    hasSelection: boolean = false;

    getSheetView() {
        return this._sheetView;
    }

    getScene() {
        return this._sheetView.getScene();
    }

    getContext() {
        return this._sheetView.getContext();
    }

    getMainComponent() {
        return this._mainComponent;
    }

    updateToSheet(worksheet: Worksheet) {
        this._worksheet = worksheet;
        const worksheetId = this.getWorksheetId();
        if (worksheetId) {
            const models = this._selectionModels.get(worksheetId);
            if (!models) {
                this._selectionModels.set(worksheetId, []);
            }
        }
    }

    getCurrentControls() {
        return this._selectionControls;
    }

    getCurrentControl() {
        const controls = this.getCurrentControls();
        if (controls && controls.length > 0) {
            for (const control of controls) {
                const currentCell = control.model.currentCell;
                if (currentCell) {
                    return control;
                }
            }
        }
    }

    getCurrentModels() {
        const worksheetId = this.getWorksheetId();
        if (!worksheetId) {
            return;
        }

        const models = this._selectionModels.get(worksheetId);

        if (!models) {
            this._selectionModels.set(worksheetId, []);
        }
        return this._selectionModels.get(worksheetId);
    }

    getCurrentCellModel(): Nullable<ICellInfo> {
        const models = this.getCurrentModels();
        if (models && models.length > 0) {
            for (const model of models) {
                const currentCell = model.currentCell;
                if (currentCell) {
                    return currentCell;
                }
            }
        }
    }

    getCurrentModel(): Nullable<SelectionModel> {
        const models = this.getCurrentModels();
        if (models && models.length > 0) {
            for (const model of models) {
                const currentCell = model.currentCell;
                if (currentCell) {
                    return model;
                }
            }
        }
    }

    getCurrentModelsValue(): ISelectionModelValue[] {
        const models = this.getCurrentModels();
        if (!models) {
            return [];
        }
        const selectionModelsValue = [];
        for (let model of models) {
            selectionModelsValue.push(model.getValue());
        }
        return selectionModelsValue;
    }

    /**
     * Renders all controls of the currently active sheet
     * @returns
     */
    renderCurrentControls(models?: SelectionModel[]) {
        const worksheetId = this.getWorksheetId();
        if (worksheetId) {
            if (this._selectionControls) {
                // clear old controls
                for (let control of this._selectionControls) {
                    control.dispose();
                }
            }

            // render current control
            const selectionModels = models || this._selectionModels.get(worksheetId);
            this._selectionControls = [];
            selectionModels?.forEach((model) => {
                const curCellRange = model.currentCell;
                const main = this._mainComponent;

                const control = SelectionControl.create(this, this._selectionControls.length);

                let cellInfo = null;
                if (curCellRange) {
                    cellInfo = main.getCellByIndex(curCellRange.row, curCellRange.column);
                }

                const { startRow, startColumn, endRow, endColumn } = model;
                const startCell = main.getNoMergeCellPositionByIndex(startRow, startColumn);
                const endCell = main.getNoMergeCellPositionByIndex(endRow, endColumn);

                // update control model and view
                control.update(
                    {
                        startColumn,
                        startRow,
                        endColumn,
                        endRow,
                        startY: startCell?.startY || 0,
                        endY: endCell?.endY || 0,
                        startX: startCell?.startX || 0,
                        endX: endCell?.endX || 0,
                    },
                    cellInfo
                );
                this._selectionControls.push(control);
            });

            this.setSelectionModel();
        }
    }

    getPlugin() {
        return this._plugin;
    }

    getWorksheetId() {
        return this._worksheet?.getSheetId();
    }

    /**
     * add a selection
     * @param selectionRange
     * @param curCellRange
     * @returns
     */
    addControlToCurrentByRangeData(selectionRange: IRangeData, curCellRange: Nullable<IRangeCellData>) {
        const currentControls = this.getCurrentControls();
        if (!currentControls) {
            return;
        }
        const main = this._mainComponent;

        const control = SelectionControl.create(this, currentControls.length);

        let cellInfo = null;
        if (curCellRange) {
            cellInfo = main.getCellByIndex(curCellRange.row, curCellRange.column);
        }

        const { startRow, startColumn, endRow, endColumn } = selectionRange;
        const startCell = main.getNoMergeCellPositionByIndex(startRow, startColumn);
        const endCell = main.getNoMergeCellPositionByIndex(endRow, endColumn);

        // update control
        control.update(
            {
                startColumn,
                startRow,
                endColumn,
                endRow,
                startY: startCell?.startY || 0,
                endY: endCell?.endY || 0,
                startX: startCell?.startX || 0,
                endX: endCell?.endX || 0,
            },
            cellInfo
        );

        currentControls.push(control);

        this.setSelectionModel();
    }

    clearSelectionControls() {
        let curControls = this.getCurrentControls();

        if (curControls.length > 0) {
            for (let control of curControls) {
                control.dispose();
            }

            curControls.length = 0; // clear currentSelectionControls
        }
    }

    /**
     * update all current controls data in model
     */
    setSelectionModel(models?: ISelectionModelValue[]) {
        if (!this._worksheet) return;

        // get models from current control
        if (!models) {
            models = this._selectionControls.map((control) => control.model.getValue());
        }

        const workbook = this._worksheet.getContext().getWorkBook();
        const commandManager = workbook.getCommandManager();

        const value: ISetSelectionValueActionData = {
            sheetId: this._worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_SELECTION_VALUE_ACTION,
            selections: models,
        };

        const command = new Command(
            {
                WorkBookUnit: workbook,
            },
            value
        );
        commandManager.invoke(command);
    }

    /**
     * update current control in model
     */
    updateSelectionModel(selection: ISelection, cell: Nullable<ICellInfo>, index: number) {
        const worksheetId = this.getWorksheetId();

        if (!this._worksheet || !worksheetId) return;

        // Collect constituency data for the entire current sheet
        const selectionModels = this._selectionModels.get(worksheetId);
        const selectionModelsValue: ISelectionModelValue[] = [];
        selectionModels?.forEach((model, i) => {
            if (i === index) {
                selectionModelsValue.push({ selection, cell });
            } else {
                selectionModelsValue.push(model.getValue());
            }
        });

        const workbook = this._worksheet.getContext().getWorkBook();
        const commandManager = workbook.getCommandManager();

        const value: ISetSelectionValueActionData = {
            sheetId: this._worksheet.getSheetId(),
            actionName: ACTION_NAMES.SET_SELECTION_VALUE_ACTION,
            selections: selectionModelsValue,
        };

        const command = new Command(
            {
                WorkBookUnit: workbook,
            },
            value
        );
        commandManager.invoke(command);
    }

    setModels(selections: ISelectionModelValue[]) {
        const worksheetId = this.getWorksheetId();
        if (!worksheetId) {
            return;
        }

        const models = selections.map(({ selection, cell }) => {
            const model = new SelectionModel(SELECTION_TYPE.NORMAL, this._plugin);
            model.setValue(selection, cell);
            return model;
        });

        this._selectionModels.set(worksheetId, models);
    }

    // recreateControlsByRangeData() { }

    /**
     * Move the selection according to different directions, usually used for the shortcut key operation of ↑ ↓ ← →
     * @param direction
     * @returns
     */
    move(direction: Direction): void {
        const currentCell = this.getCurrentCellModel();

        if (!currentCell) return;

        let { row, column } = currentCell;
        const rowCount = this._worksheet?.getRowCount() || 1000;
        const columnCount = this._worksheet?.getColumnCount() || 50;
        switch (direction) {
            case Direction.TOP:
                row--;
                if (row < 0) {
                    row = 0;
                }
                break;
            case Direction.BOTTOM:
                row++;

                if (row > rowCount) {
                    row = rowCount;
                }
                break;
            case Direction.LEFT:
                column--;
                if (column < 0) {
                    column = 0;
                }
                break;
            case Direction.RIGHT:
                column++;
                if (column > columnCount) {
                    column = columnCount;
                }
                break;

            default:
                break;
        }

        let rangeData: IRangeData = {
            startRow: row,
            endRow: row,
            startColumn: column,
            endColumn: column,
        };
        let currentCellData: IRangeCellData = {
            row,
            column,
        };

        this.clearSelectionControls();
        this.addControlToCurrentByRangeData(rangeData, currentCellData);
    }

    constructor(private _sheetView: SheetView) {
        this._plugin = this._sheetView.getPlugin() as SheetPlugin;
        this._initialize();
        this._initializeObserver();
    }

    private _initialize() {
        this._mainComponent = this._sheetView.getSpreadsheet();
        this._rowComponent = this._sheetView.getSpreadsheetRowTitle();
        this._columnComponent = this._sheetView.getSpreadsheetColumnTitle();
        this._leftTopComponent = this._sheetView.getSpreadsheetLeftTopPlaceholder();

        this._mainEventInitial();

        this._rowEventInitial();

        this._columnEventInitial();

        this._leftTopEventInitial();

        this._worksheet = this.getContext().getWorkBook().getActiveSheet();

        this._initModels();

        this._dragLineControl = new DragLineController(this);

        this._columnTitleControl = new ColumnTitleController(this);

        this._rowTitleControl = new RowTitleController(this);
    }

    private _mainEventInitial() {
        const main = this._mainComponent;
        main.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
            const { offsetX: evtOffsetX, offsetY: evtOffsetY } = evt;
            this._startOffsetX = evtOffsetX;
            this._startOffsetY = evtOffsetY;
            const scrollXY = main.getAncestorScrollXY(this._startOffsetX, this._startOffsetY);
            const cellInfo = main.calculateCellIndexByPosition(evtOffsetX, evtOffsetY, scrollXY);
            const actualSelection = makeCellToSelection(cellInfo);
            if (!actualSelection || !this._worksheet) {
                return false;
            }

            const { startRow, startColumn, endColumn, endRow, startY, endY, startX, endX } = actualSelection;

            const startSelectionRange = {
                startColumn,
                startRow,
                endColumn,
                endRow,
                startY,
                endY,
                startX,
                endX,
            };

            this._startSelectionRange = startSelectionRange;

            let selectionControl: Nullable<SelectionControl> = this.getCurrentControl();

            let curControls = this.getCurrentControls();

            if (!curControls) {
                return false;
            }

            for (let control of curControls) {
                // right click
                if (evt.button === 2 && control.model.isInclude(startSelectionRange)) {
                    selectionControl = control;
                    return;
                }
                // Click to an existing selection
                if (control.model.isEqual(startSelectionRange)) {
                    selectionControl = control;
                    break;
                }

                // There can only be one highlighted cell, so clear the highlighted cell of the existing selection
                if (!evt.shiftKey) {
                    control.clearHighlight();
                }
            }

            // In addition to pressing the ctrl or shift key, we must clear the previous selection
            if (curControls.length > 0 && !evt.ctrlKey && !evt.shiftKey) {
                for (let control of curControls) {
                    control.dispose();
                }

                curControls.length = 0; // clear currentSelectionControls
            }

            const currentCell = selectionControl && selectionControl.model.currentCell;

            if (selectionControl && evt.shiftKey && currentCell) {
                const { row, column } = currentCell;

                // TODO startCell position calculate error
                const startCell = main.getNoMergeCellPositionByIndex(row, column);
                const endCell = main.getNoMergeCellPositionByIndex(endRow, endColumn);

                const newSelectionRange = {
                    startColumn: column,
                    startRow: row,
                    endColumn: startSelectionRange.startColumn,
                    endRow: startSelectionRange.startRow,
                    startY: startCell?.startY || 0,
                    endY: endCell?.endY || 0,
                    startX: startCell?.startX || 0,
                    endX: endCell?.endX || 0,
                };
                selectionControl.update(newSelectionRange, currentCell);
            } else {
                selectionControl = SelectionControl.create(this, curControls.length);
                selectionControl.update(startSelectionRange, cellInfo);
                curControls.push(selectionControl);
            }

            this.hasSelection = true;

            const scene = this.getScene();

            scene.disableEvent();

            const scrollTimer = ScrollTimer.create(this.getScene());
            scrollTimer.startScroll(evtOffsetX, evtOffsetY);

            // update model
            this.setSelectionModel();

            // Notification toolbar updates button state and value
            this._plugin.getObserver('onChangeSelectionObserver')?.notifyObservers(selectionControl);

            this._moveObserver = scene.onPointerMoveObserver.add((moveEvt: IPointerEvent | IMouseEvent) => {
                this.moving(moveEvt, selectionControl);
                const { offsetX: moveOffsetX, offsetY: moveOffsetY } = moveEvt;

                scrollTimer.scrolling(moveOffsetX, moveOffsetY, () => {
                    this.moving(moveEvt, selectionControl);
                });
            });

            this._upObserver = scene.onPointerUpObserver.add((upEvt: IPointerEvent | IMouseEvent) => {
                this.up();
                scene.onPointerMoveObserver.remove(this._moveObserver);
                scene.onPointerUpObserver.remove(this._upObserver);
                scene.enableEvent();

                scrollTimer.stopScroll();
            });

            // document.addEventListener('pointerup', () => {
            //     this.up();
            //     scene.onPointerMoveObserver.remove(this._moveObserver);
            //     scene.onPointerUpObserver.remove(this._upObserver);
            //     scene.enableEvent();

            //     scrollTimer.stopScroll();
            // });
        });
    }

    /**
     * When mousedown and mouseup need to go to the coordination and undo stack, when mousemove does not need to go to the coordination and undo stack
     * @param moveEvt
     * @param selectionControl
     * @returns
     */
    moving(moveEvt: IPointerEvent | IMouseEvent, selectionControl: Nullable<SelectionControl>) {
        // console.log('moving');
        const main = this._mainComponent;
        const { offsetX: moveOffsetX, offsetY: moveOffsetY, clientX, clientY } = moveEvt;
        const { startRow, startColumn, endRow, endColumn } = this._startSelectionRange;

        const scrollXY = main.getAncestorScrollXY(this._startOffsetX, this._startOffsetY);
        const moveCellInfo = main.calculateCellIndexByPosition(moveOffsetX, moveOffsetY, scrollXY);
        const moveActualSelection = makeCellToSelection(moveCellInfo);

        if (!moveActualSelection) {
            return false;
        }
        const { startRow: moveStartRow, startColumn: moveStartColumn, endColumn: moveEndColumn, endRow: moveEndRow } = moveActualSelection;

        const newStartRow = Math.min(moveStartRow, startRow);
        const newStartColumn = Math.min(moveStartColumn, startColumn);
        const newEndRow = Math.max(moveEndRow, endRow);
        const newEndColumn = Math.max(moveEndColumn, endColumn);
        const newBounding = main.getSelectionBounding(newStartRow, newStartColumn, newEndRow, newEndColumn);

        if (!newBounding) {
            return false;
        }
        const { startRow: finalStartRow, startColumn: finalStartColumn, endRow: finalEndRow, endColumn: finalEndColumn } = newBounding;

        const startCell = main.getNoMergeCellPositionByIndex(finalStartRow, finalStartColumn);
        const endCell = main.getNoMergeCellPositionByIndex(finalEndRow, finalEndColumn);

        const newSelectionRange: ISelection = {
            startColumn: finalStartColumn,
            startRow: finalStartRow,
            endColumn: finalEndColumn,
            endRow: finalEndRow,
            startY: startCell?.startY || 0,
            endY: endCell?.endY || 0,
            startX: startCell?.startX || 0,
            endX: endCell?.endX || 0,
        };
        // Only notify when the selection changes
        const {
            startRow: oldStartRow,
            endRow: oldEndRow,
            startColumn: oldStartColumn,
            endColumn: oldEndColumn,
        } = selectionControl?.model || { startRow: -1, endRow: -1, startColumn: -1, endColumn: -1 };

        if (oldStartColumn !== finalStartColumn || oldStartRow !== finalStartRow || oldEndColumn !== finalEndColumn || oldEndRow !== finalEndRow) {
            selectionControl && selectionControl.update(newSelectionRange);
            // update model
            this.setSelectionModel();
            selectionControl && this._plugin.getObserver('onChangeSelectionObserver')?.notifyObservers(selectionControl);
        }
    }

    /**
     * pointer up event
     * @param moveEvt
     * @param selectionControl
     * @returns
     */
    up() {
        // update model
        this.setSelectionModel();
    }

    private _rowEventInitial() {
        const row = this._rowComponent;
        row.onPointerEnterObserver.add((evt: IPointerEvent | IMouseEvent) => {
            this._rowTitleControl.highlightRowTitle(evt);
        });
    }

    private _columnEventInitial() {
        const column = this._columnComponent;
        column.onPointerEnterObserver.add((evt: IPointerEvent | IMouseEvent) => {
            this._columnTitleControl.highlightColumnTitle(evt);
        });
    }

    private _leftTopEventInitial() {
        const leftTop = this._leftTopComponent;
        leftTop.onPointerDownObserver.add((evt: IPointerEvent | IMouseEvent) => {
            console.log('leftTop_moveObserver', evt);
        });
    }

    /**
     * Initialize selection model based on user configuration
     * @param selections
     */
    private _initModels() {
        const selections: ISelectionsConfig = this._plugin.config.selections;

        Object.keys(selections).forEach((worksheetId) => {
            const selectionsList = selections[worksheetId];
            const currentModels: SelectionModel[] = [];

            selectionsList.forEach((selectionConfig) => {
                const { startColumn, startRow, endColumn, endRow } = selectionConfig.selection;
                const cell = selectionConfig.cell;

                const model = new SelectionModel(SELECTION_TYPE.NORMAL, this._plugin);

                const cellInfo = cell
                    ? {
                          row: cell.row,
                          column: cell.column,
                          isMerged: false,
                          isMergedMainCell: false,
                          startY: 0,
                          endY: 0,
                          startX: 0,
                          endX: 0,
                          mergeInfo: {
                              startColumn,
                              startRow,
                              endColumn,
                              endRow,
                              startY: 0,
                              endY: 0,
                              startX: 0,
                              endX: 0,
                          },
                      }
                    : null;

                // Only update data, not render
                model.setValue(
                    {
                        startColumn,
                        startRow,
                        endColumn,
                        endRow,
                        startY: 0,
                        endY: 0,
                        startX: 0,
                        endX: 0,
                    },
                    cellInfo
                );
                currentModels.push(model);
            });

            this._selectionModels.set(worksheetId, currentModels);
        });
    }

    /**
     * Initialize selection based on user configuration
     * @param selections
     */
    private _initControls() {
        const selections: ISelectionsConfig = this._plugin.config.selections;
        Object.keys(selections).forEach((worksheetId) => {
            const selectionsList = selections[worksheetId];
            const currentControls: SelectionControl[] = [];

            selectionsList.forEach((selectionConfig) => {
                const selectionRange = selectionConfig.selection;
                const curCellRange = selectionConfig.cell;
                const main = this._mainComponent;

                const control = SelectionControl.create(this, currentControls.length);

                let cellInfo = null;
                if (curCellRange) {
                    cellInfo = main.getCellByIndex(curCellRange.row, curCellRange.column);
                }

                const { startRow: finalStartRow, startColumn: finalStartColumn, endRow: finalEndRow, endColumn: finalEndColumn } = selectionRange;
                const startCell = main.getNoMergeCellPositionByIndex(finalStartRow, finalStartColumn);
                const endCell = main.getNoMergeCellPositionByIndex(finalEndRow, finalEndColumn);

                // Only update data, not render
                control.model.setValue(
                    {
                        startColumn: finalStartColumn,
                        startRow: finalStartRow,
                        endColumn: finalEndColumn,
                        endRow: finalEndRow,
                        startY: startCell?.startY || 0,
                        endY: endCell?.endY || 0,
                        startX: startCell?.startX || 0,
                        endX: endCell?.endX || 0,
                    },
                    cellInfo
                );
                currentControls.push(control);
            });

            // this._selectionControls.set(worksheetId, currentControls);
        });
    }

    /**
     * Initialize the observer
     */
    private _initializeObserver() {
        const context = this._plugin.getContext();
        context.getContextObserver('onAfterChangeActiveSheetObservable').add(() => {
            this.renderCurrentControls();
        });

        this._worksheet
            ?.getContext()
            .getContextObserver('onSheetRenderDidMountObservable')
            .add(() => {
                this.renderCurrentControls();
            });
    }

    /**
     * Get all range data of the current selection
     * @returns
     */
    getActiveRangeListData(): Nullable<IRangeData[]> {
        const models = this.getCurrentModels();
        if (models && models.length > 0) {
            const selections = models?.map((model: SelectionModel) => ({
                startRow: model.startRow,
                startColumn: model.startColumn,
                endRow: model.endRow,
                endColumn: model.endColumn,
            }));

            return selections;
        }
    }

    /**
     * Returns the list of active ranges in the active sheet or null if there are no active ranges.
     * If there is a single range selected, this behaves as a getActiveRange() call.
     *
     * @returns
     */
    getActiveRangeList(): Nullable<RangeList> {
        const rangeListData = this.getActiveRangeListData();
        return rangeListData && this._worksheet?.getRangeList(rangeListData);
    }

    /**
     * Get the range of the currently active cell
     * @returns
     */
    getActiveRangeData(): Nullable<IRangeData> {
        const models = this.getCurrentModels();
        if (models && models.length > 0) {
            for (const model of models) {
                if (model.currentCell) {
                    return {
                        startRow: model.startRow,
                        startColumn: model.startColumn,
                        endRow: model.endRow,
                        endColumn: model.endColumn,
                    };
                }
            }
        }
    }

    /**
     * Returns the selected range in the active sheet, or null if there is no active range. If multiple ranges are selected this method returns only the last selected range.
     * @returns
     */
    getActiveRange(): Nullable<Range> {
        const rangeData = this.getActiveRangeData();
        return rangeData && this._worksheet?.getRange(rangeData);
    }

    /**
     * get active selection control
     * @returns
     */
    getCurrentCellData(): Nullable<IRangeData> {
        const models = this.getCurrentModels();
        if (models && models.length > 0) {
            for (const model of models) {
                const currentCell = model.currentCell;
                if (currentCell) {
                    return {
                        startRow: currentCell.row,
                        startColumn: currentCell.column,
                        endRow: currentCell.row,
                        endColumn: currentCell.column,
                    };
                }
            }
        }
    }

    /**
     * get active selection control
     * @returns
     */
    getCurrentCell(): Nullable<Range> {
        const rangeData = this.getCurrentCellData();
        return rangeData && this._worksheet?.getRange(rangeData);
    }

    getDragLineControl() {
        return this._dragLineControl;
    }
}
