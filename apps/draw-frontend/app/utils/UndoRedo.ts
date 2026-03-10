import { Shape } from "../draw/Game";

export default  class UndoStack {
    undoStack: Shape[] = [];  // just shape IDs
    redoStack: Shape[] = [];

    push(shape: Shape) {
        this.undoStack.push(shape);
        this.redoStack = [];
    }

    undo(): Shape| undefined {
        const shape = this.undoStack.pop();
        if (shape) {
            this.redoStack.push(shape);
        }
        return shape;  // caller handles delete
    }

    redo(): Shape | undefined {
        const shape = this.redoStack.pop();
        if (shape) {
            this.undoStack.push(shape);
        }
        return shape;  // caller handles re-add
    }

    updateId(oldId: string, newId: string) {
    const shape = this.undoStack.find(s => s.id == oldId)
    if(shape) shape.id = newId
       
    
}
}