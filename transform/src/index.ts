import {
	ClassDeclaration,
	FieldDeclaration,
	FunctionDeclaration,
	MethodDeclaration,
	FunctionTypeNode,
	TypeNode,
	Node,
	Source,
	NamedTypeNode,
	TypeName,
	IdentifierExpression
} from "assemblyscript/dist/assemblyscript.js";
import {
	ClassDecorator, FunctionDecorator,
	registerDecorator,
} from "visitor-as/dist/decorator.js";
import {ASTBuilder} from "visitor-as/dist/astBuilder.js";
import {compileString} from "assemblyscript/dist/asc";

import {getName, toString} from "visitor-as/dist/utils.js";
import {BaseTransformVisitor, Collection, SimpleParser} from "visitor-as/dist/index.js";

class ContractDecorator extends ClassDecorator {
	get name(): string {
		return "contract";
	}

	visitClassDeclaration(node: ClassDeclaration): void {
		console.log("visitClassDeclaration", node.name);
		super.visit(node.members);
		console.log(ASTBuilder.build(node))
	}

	visitFieldDeclaration(node: FieldDeclaration): void {
		console.log("visitFieldDeclaration", node.name);
	}

	visitMethodDeclaration(node: MethodDeclaration): void {
		node.signature.returnType = new NamedTypeNode(new TypeName(new IdentifierExpression("Hello", false, node.range), null, node.range), null, false, node.range);
		console.log(ASTBuilder.build(node));
	}
}

let decorators = registerDecorator(new ContractDecorator());

export default decorators;
