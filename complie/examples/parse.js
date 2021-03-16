
const FALSE = { type: 'bool', value: false };
// 优先级处理，小括号，<和<=的区别
const PRECEDENCE = {
    "=": 1,
    "||": 2,
    "&&": 3,
    "<": 7,
    ">": 7,
    "<=": 7,
    ">=": 7,
    "==": 7,
    "!=": 7,
    "+": 10,
    "-": 10,
    "*": 20,
    "/": 20,
    "%": 20
}

function parse(input) {

    function is_punc(ch) {
        const tok = input.peek();
        return tok && tok.type === 'punc' && (!ch || tok.value === ch) && tok;
    }

    function is_kw(kw) {
        const tok = input.peek();
        return tok && tok.type === 'kw' && (!kw || tok.value === kw) && tok;
    }

    function is_op(op) {
        let tok = input.peek();
        return tok && tok.type === 'op' && (!op || tok.value === op) && tok;
    }

    function skip_punc(ch) {
        if (is_punc(ch)) input.next();
        else input.croak("Expecting punctuation: \"" + ch + "\"");
    }

    function skip_kw(kw){
        if(is_kw(kw)) input.next();
        else input.croak("Expecting keyword: \"" + kw +"\"");
    }

    function skip_op(op){
        if(is_op(op)) input.next();
        else input.croak("Expectiong operator: \"" + op +"\"");
    }

    function unexpected(){
        input.croak("Unexpected token: " + JSON.stringify(input.peek()));
    }
    
    // 解析操作符
    function maybe_binary(left, my_prec){
        const tok = is_op();
        if(tok){
            const his_prec = PRECEDENCE[tok.value];
            if(his_prec > my_prec){
                input.next();
                return maybe_binary({
                    type: tok.value === "=" ? "assign" : "binary",
                    operator: tok.value,
                    left,
                    right : maybe_binary(parse_atom(), his_prec)
                }, my_prec)
            }
        }
        return left;
    }

    function parse_vardef(){
        const name = parse_varname(), def;
        if(is_op("=")){
            input.next();
            def = parse_expression();
        }
        return {
            name,
            def,
        }
    }

    function parse_let(){
        skip_kw("let");
        if(input.peek().type === "var"){
            const name = input.next().value;
            const defs = delimited("(", ")", ",", parse_vardef);
            return {
                type: "call",
                func:{
                    type: "lambda",
                    name:name,
                    vars: defs.map(function(def){ return def.name }),
                    body: parse_expression(),
                },
                args: defs.map(def => def.def || FALSE)
            }
        }
        return {
            type: "let",
            vars: delimited("(", ")", ",", parse_vardef),
            body: parse_expression(),
        }
    }



    // 公共函数
    function delimited(start, stop, separator, parser){
        const a = [], first = true;
        skip_punc(start);
        while(!input.eof()){
            if(is_punc(stop)) break;
            if(first) first = false;
            else skip_punc(separator);
            if(is_punc(stop)) break;
            a.push(parser());
        }
        skip_punc(stop);
        return a;
    }

    // 解析函数调用
    function parse_call(func){
        return {
            type: "call",
            func,
            args: delimited("(",")",",", parse_expression),
        }
    }


    function parse_varname(){
        const name = input.next();
        if(name.type != "var") {
            input.croak("Expecting variable name");
        }
        return name.value;
    }

    function parse_if(){
        skip_kw("if");
        const cond = parse_expression();
        if(!is_punc("{")){
            skip_kw("then");
        };
        const then = parse_expression();
        const ret = {
            type: "if",
            cond,
            then
        };
        if(is_kw("else")){
            input.next();
            ret.else = parse_expression();
        }
        return ret;
    }

    function parse_lambda(){
        return {
            type: "lambda",
            name: input.peek().type === 'var' ? input.next().value : null,
            vars: delimited("(",")",",",parse_varname),
            body: parse_expression()
        }
    }

    function parse_bool(){
        return {
            type: "bool",
            value: input.next().value === "true",
        }
    }

    function maybe_call(expr){
        expr = expr();
        return is_punc("(") ? parse_call(expr) : expr;
    }

    // 核心代码
    function parse_atom(){
        return maybe_call(function(){
            if(is_punc("(")){
                input.next();
                const exp = parse_expression();
                skip_punc(")");
                return exp;
            }

            if(is_punc("{")){
                return parse_prog();
            }

            if(is_kw("let")){
                return parse_let();
            }

            if(is_kw("if")){
                return parse_if();
            }
            if(is_kw("true") || is_kw("false")){
                return parse_bool();
            }
            if(is_kw("lambda") || is_kw("λ")){
                input.next();
                return parse_lambda();
            }
            const tok = input.next();
            if(tok.type === "var" || tok.type === "num" || tok.type === "str"){
                return tok;
            }
            unexpected();
        })
    }

    function parse_toplevel(){
        const prog = [];
        while(!input.eof()){
            prog.push(parse_expression());
            if(!input.eof()) skip_punc(";");
        }
        return {
            type: "prog",
            prog,
        }
    }

    // 解析程序
    function parse_prog(){
        const prog = delimited("{","}",";", parse_expression);
        if(prog.length === 0){
            return FALSE;
        }
        if(prog.length === 1){
            return prog[0];
        }
        return {
            type: "prog",
            prog
        }
    }

    // 解析表达式
    function parse_expression(){
        return maybe_call(function(){
            return maybe_binary(parse_atom(), 0);
        });
    }

    // 解析顶层表达式
    return parse_toplevel();
}