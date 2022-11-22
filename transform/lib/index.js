import { ClassDecorator, registerDecorator, } from "visitor-as/dist/decorator.js";
import { getName, hasDecorator, toString } from "visitor-as/dist/utils.js";
import { SimpleParser } from "visitor-as/dist/index.js";
class ContractDecorator extends ClassDecorator {
    constructor() {
        super(...arguments);
        this.queryStmts = [];
    }
    get name() {
        return "contract";
    }
    visitClassDeclaration(node) {
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
    visitFieldDeclaration(node) {
    }
    visitMethodDeclaration(node) {
        if (hasDecorator(node, "query")) {
            this.queryStmts.push(`result += "${getName(node)}";`);
        }
    }
}
let decorators = registerDecorator(new ContractDecorator());
export default decorators;
