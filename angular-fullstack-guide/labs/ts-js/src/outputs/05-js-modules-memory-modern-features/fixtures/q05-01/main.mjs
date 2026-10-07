var notGlobal = 'module scope';
function whoIsThis() {
  return this;
}
console.log(typeof globalThis.notGlobal, this, whoIsThis());
