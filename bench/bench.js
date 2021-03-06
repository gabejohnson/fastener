'use strict';

const F = require("../lib/fastener")

const inc = x => typeof x === "number" ? x + 1 : x

const nested = [{x:1,y:[2,{d:3},4],z:{a:5}}]
const vs10 = Array(10).fill(1)
const vs100 = Array(100).fill(1)
const vs1000 = Array(1000).fill(1)

const bs = [
  'F.fromZipper(F.everywhere(inc, F.toZipper(nested)))',
  'F.fromZipper(F.everywhere(inc, F.toZipper(vs10)))',
  'F.fromZipper(F.everywhere(inc, F.toZipper(vs100)))',
  'F.fromZipper(F.everywhere(inc, F.toZipper(vs1000)))'
]

const s = new require("benchmark").Suite()
bs.forEach(b => s.add(b, eval("() => " + b)))
s.on('cycle', e => console.log(String(e.target))).run()
