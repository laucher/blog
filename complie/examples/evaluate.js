

function evaluate(exp, env) {
    switch (exp.type) {
        case "num":
        case "str":
        case "bool":
            return exp.value;

        case "var":
            return env.get(exp.value);

        case "assign":
            if (exp.left.type != "var") {
                throw new Error("Cannot assign to " + JSON.stringify(exp.left));
            }
            return env.set(exp.left.value, evaluate(exp.right, env));

        case "binary":
            return apply_op(exp.operator, evaluate(exp.left, env), evaluate(exp.right, env));

        case "lambda":
            return make_lambda(env, exp);

        case "if":
            const cond = evaluate(exp.cond, env);
            if (cond !== false) return evaluate(exp.then, env);
            return exp.else ? evaluate(exp.else, env) : false;
        case "let":
            exp.vars.forEach(v=>{
                const scope = env.extend();
                scope.def(v.name, v.def ? evaluate(v.def, env): false);
                env = scope;
            });
            return evaluate(exp.body, env);
        
        case "prog":
            const val = false;
            exp.prog.forEach(function(exp){
                val = evaluate(exp, env);
            });
            return val;

        case "call":
            // 通过func的name从env拿到变量
            const func = evaluate(exp.func, env);
            return func.apply(null, exp.args.map(function(arg){
                return evaluate(arg,env);
            }));
        default:
            throw new Error("I don't know how to evaluate " + exp.type);
    }
}


function apply_op(op, left, right){

    function num(x){
        if(typeof x !== "number"){
            throw new Error("Expected number but got " + x);
        }
        return x;
    }

    function div(x){
        if(num(x) == 0){
            throw new Error("Divide by zero");
        }
        return x;
    }

    switch(op){
        case "+": return num(left) + num(right);
        case "-": return num(left) - num(right);
        case "*": return num(left) * num(right);
        case "/": return num(left) / div(right);
        case "%": return num(left) % div(right);
        case "&&": return left !== false && right;
        case "||": return left !== false ? left : right;
        case "<": return num(left) < num(right);
        case ">": return num(left) > num(right);
        case "<=": return num(left) <= num(right);
        case ">=": return num(left) >= num(right);
        case "==": return left === right;
        case "!=": return left !== right;
    }

    throw new Error("Can't appyly operator " + op);
}


function make_lambda(env, exp){
    if(exp.name){
        env = env.extend();
        env.def(exp.name, lambda);
    }
    function lambda(){
        const names = exp.vars;
        const scope = env.extend();
        for(let i = 0; i < names.length; i++){
            scope.def(names[i], i < arguments.length ? arguments[i] : false)
        }
        return evaluate(exp.body, scope);
    }
    return lambda;
}

