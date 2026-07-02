# Code Style

## Indentation
Use 4 spaces for indentation.

## Braces
Always wrap `if`, `for`, and `while` statements in curly braces — even single-line bodies.

Opening curly brace on the same line as the statement, body on the next line, closing curly brace on its own line.

```js
if (condition) {
    doSomething()
}

for (let i = 0; i < n; i++) {
    doSomething(i)
}

while (condition) {
    doSomething()
}
```

`else` / `else if` go on the same line as the closing brace of the preceding block:

```js
if (condition) {
    doSomething()
}
else if (other) {
    doOther()
} 
else {
    doDefault()
}
```
