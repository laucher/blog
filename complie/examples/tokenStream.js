
function TokenStream(input){
    let current = null;
    let keywords = {
        'if': true,
        'then': true,
        'else': true,
        'lambda': true,
        'λ': true,
        'true': true,
        'false': true
    };

    function is_keyword(x){
        return !!keywords[x];
    }

    function is_digit(ch){
        return /[0-9]/i.test(ch);
    }

    function is_id_start(ch){
        return /[a-zλ_]/i.test(ch);
    }

    function is_id(ch){
        return is_id_start(ch) || "?!-_<>=123456789".includes(ch);
    }

    function is_op_char(ch){
        return "+-*/%=&|<>!".includes(ch);
    }

    function is_punc(ch){
        return ",;(){}[]".includes(ch);
    }

    function is_whitespace(ch){
        return " \t\n".includes(ch);
    }

    function read_while(predicate){
        let result = "";
        while (!input.eof() && predicate(input.peek())){
            result += input.next();
        }
        return result;
    }

    function read_number(){
        let has_dot = false;
        let number = read_while(function(ch){
            if(ch === '.'){
                if(has_dot) return false;
                has_dot = true;
                return true;
            }
            return is_digit(ch);
        });
        return {
            type: "num",
            value: parseFloat(number)
        }
    }

    function read_ident(){
        let id = read_while(is_id);
        return {
            type : is_keyword(id) ? "kw" : "var",
            value : id
        }
    }

    function read_escaped(end){
        let escaped = false, str = "";
        input.next();
        while(!input.eof()) {
            let ch = input.next();
            if(escaped){
                str += ch;
                escaped = false;
            }else if(ch === '\\'){
                escaped = true;
            }else if(ch === end){
                break;
            }else{
                str += ch;
            }
        }
        return str;
    }

    function read_string(){
        return { type: "str", value: read_escaped('"') };
    }

    function skip_comment(){
        read_while(ch=>ch != "\n");
        input.next();
    }

    function read_next(){
        read_while(is_whitespace);
        if(input.eof()) return null;
        let ch = input.peek();
        if(ch == '#'){
            skip_comment();
            return read_next();
        }
        if( ch == '"' ) return read_string();
        if(is_digit(ch)) return read_number();
        // 这里处理了关键字和变量声明
        if(is_id_start(ch)) return read_ident();
        if(is_punc(ch)) return {
            type: 'punc',
            value: input.next()
        };
        if (is_op_char(ch)) return {
            type: 'op',
            value: read_while(is_op_char)
        }
        input.croak("Can't handle character:"+ch);
    }

    function peek(){
        return current || (current = read_next());
    }

    function next(){
        let tok = current;
        current = null;
        return tok || read_next();
    }

    function eof(){
        return peek == null;
    }

    return {
        next  : next,
        peek  : peek,
        eof   : eof,
        croak : input.croak
    };

}