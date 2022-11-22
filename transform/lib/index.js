import { NamedTypeNode, TypeName, IdentifierExpression } from "assemblyscript/dist/assemblyscript.js";
import { ClassDecorator, registerDecorator, } from "visitor-as/dist/decorator.js";
import { ASTBuilder } from "visitor-as/dist/astBuilder.js";
class ContractDecorator extends ClassDecorator {
    get name() {
        return "contract";
    }
    visitClassDeclaration(node) {
        console.log("visitClassDeclaration", node.name);
        super.visit(node.members);
        console.log(ASTBuilder.build(node));
    }
    visitFieldDeclaration(node) {
        console.log("visitFieldDeclaration", node.name);
    }
    visitMethodDeclaration(node) {
        node.signature.returnType = new NamedTypeNode(new TypeName(new IdentifierExpression("Hello", false, node.range), null, node.range), null, false, node.range);
        console.log(ASTBuilder.build(node));
    }
}
let decorators = registerDecorator(new ContractDecorator());
export default decorators;
