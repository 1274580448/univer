import { DocActionBase, IDocActionData } from '../../Command/DocActionBase';
import { ActionObservers, CommandUnit } from '../../Command';

export interface IUpdateParagraphBulletAction extends IDocActionData {
    text: string;
}

export class UpdateParagraphBulletAction extends DocActionBase<
    IUpdateParagraphBulletAction,
    IUpdateParagraphBulletAction
> {
    constructor(
        actionData: IUpdateParagraphBulletAction,
        commandUnit: CommandUnit,
        observers: ActionObservers
    ) {
        super(actionData, commandUnit, observers);
        this._doActionData = { ...actionData };
        this.do();
        this._oldActionData = { ...actionData };
    }

    redo(): void {
        this.do();
    }

    do(): void {
        const actionData = this.getDoActionData();
        const document = this.getDocument();
        // InsertTextApply(document, actionData.text);
    }

    undo(): void {
        // TODO ...
        // ...
    }

    validate(): boolean {
        return false;
    }
}
