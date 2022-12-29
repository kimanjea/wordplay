import BinaryOperation from "../nodes/BinaryOperation";
import type Context from "../nodes/Context";
import Evaluate from "../nodes/Evaluate";
import ExpressionPlaceholder from "../nodes/ExpressionPlaceholder";
import type FunctionDefinition from "../nodes/FunctionDefinition";
import type Node from "../nodes/Node";
import PropertyReference from "../nodes/PropertyReference";
import Reference from "../nodes/Reference";
import Token from "../nodes/Token";
import TokenType from "../nodes/TokenType";
import UnaryOperation from "../nodes/UnaryOperation";
import BindConcept from "./BindConcept";
import Concept from "./Concept";
import type StructureConcept from "./StructureConcept";

export default class FunctionConcept extends Concept {

    /** The function this concept represents. */
    readonly definition: FunctionDefinition;

    /** The structure concept on which this function is defined, if any */
    readonly structure: StructureConcept | undefined;

    /** A derived example */
    readonly example: Node;
    
    /** A derived list of BindConcepts */
    readonly inputs: BindConcept[];

    constructor(definition: FunctionDefinition, context: Context | undefined, structure?: StructureConcept) {

        super(context);

        this.definition = definition;
        this.structure = structure;

        const reference = Reference.make(this.definition);

        this.example = 
            this.definition.isUnaryOperator() && this.structure ?
                new UnaryOperation(new Token(this.definition.getUnaryOperatorName() ?? "_", TokenType.UNARY_OP), ExpressionPlaceholder.make(this.structure.type)) :
            this.definition.isBinaryOperator() && this.structure?
                new BinaryOperation(ExpressionPlaceholder.make(this.structure.type), new Token(this.definition.getBinaryOperatorName() ?? "_", TokenType.BINARY_OP), ExpressionPlaceholder.make(this.definition.inputs[0]?.type)) :
            Evaluate.make(
                this.structure ? 
                    PropertyReference.make(ExpressionPlaceholder.make(this.structure.type), reference) : reference,
                this.definition.inputs.filter(input => !input.hasDefault()).map(input => ExpressionPlaceholder.make(input.type))
            )

        this.inputs = this.definition.inputs.map(bind => new BindConcept(bind));

    }

    getRepresentation() { return this.example; }

    getNodes(): Set<Node> {
        return new Set([ this.example ]);
    }

    getText(): Set<string> {
        return new Set();
    }

    getConcepts(): Set<Concept> {
        return new Set(this.inputs);
    }

}