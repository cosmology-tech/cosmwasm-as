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

import {getName, hasDecorator, toString} from "visitor-as/dist/utils.js";
import {BaseTransformVisitor, Collection, SimpleParser} from "visitor-as/dist/index.js";
import * as ts from "typescript";

class ContractDecorator extends ClassDecorator {

	public queryStmts: string[] = [];

	get name(): string {
		return "contract";
	}

	visitClassDeclaration(node: ClassDeclaration): void {
		this.visit(node.members);

		let queryFunction = `
		__query(): string {
		  let result = "";
		  ${this.queryStmts.join("")}
		  return result;
		}
		`;
		node.members.push(SimpleParser.parseClassMember(queryFunction, node));
		console.log(toString(node));
	}

	visitFieldDeclaration(node: FieldDeclaration): void {
	}

	visitMethodDeclaration(node: MethodDeclaration): void {
		if(hasDecorator(node, "query")) {
			this.queryStmts.push(`result += "${getName(node)}";`);
		}
	}
}

let decorators = registerDecorator(new ContractDecorator());

export default decorators;
