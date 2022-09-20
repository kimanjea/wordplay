import type BinaryOperation from "../nodes/BinaryOperation";
import type { ConflictExplanations } from "./Conflict";
import Conflict from "./Conflict";

export default class OrderOfOperations extends Conflict {

    readonly operation: BinaryOperation;   
    readonly after: BinaryOperation;
    
    constructor(operation: BinaryOperation, after: BinaryOperation) { 
        super(true);

        this.operation = operation;
        this.after = after;
    }

    getConflictingNodes() {
        return { primary: [ this.operation.operator, this.after.operator ] };
    }

    getExplanations(): ConflictExplanations { 
        return {
            eng: `All operators evalute left to right, unlike math. Use parentheses to specify which order to evaluate these.`
        }
    }

}