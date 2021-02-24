

function Environment(parent) {
    this.vars = Object.create(parent ? parent.vars : null);
    this.parent = parent;
}

Environment.prototype = {
    extend: () => new Environment(this),
    lookup: function(name){
        const scope = this;
        while(scope){
            if(Object.prototype.hasOwnProperty(scope.vars, name)){
                return scope;
            }
            scope = scope.parent;
        }
    },
    get: function(name){
        if(name in this.vars){
            return this.vars[name];
        }
        throw new Error("Undefined variable" + name)
    },
    set: function(name, value){
        const scope = this.lookup(name);
        if(!scope && this.parent){
            throw new Error("Undefined variable " + name);
        }
        return (scope || this).vars[name] = value;
    },
    def: function(name, value){
        return this.vars[name] = value;
    }
}