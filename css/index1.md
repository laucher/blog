### 怪异的简写语法 ###

在 background 简写属性中指定 background-size
时，需要同时提供一个 background-position 值（哪怕它的值就是其初始值也需要写出来），而且还要使
用一个斜杠（ / ）作为分隔。为什么有些简写的语法如此怪异？

这通常都是为了**消除歧义**。请设想一下 50% 50% 这样的值，它到底是 background-
size 还是 background-position 呢？

### 