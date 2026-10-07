// Node strips the annotation and never checks it, so this type error runs.
const port: number = '8080';
console.log(typeof port, port + 1);
