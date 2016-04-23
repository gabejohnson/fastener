import * as R from "ramda"

const pass = (x, f) => f(x)

const isObject = x => x && x.constructor === Object
const isArray = x => x && x.constructor === Array

export const get = z => z.focus
export const set = R.curry((focus, z) => ({...z, focus}))
export const modify = R.curry((f, z) => set(f(get(z)), z))

export const up = ({left, focus, right, keys, up}) => {
  if (keys) {
    return {focus: R.zipObj(keys, [...left, focus, ...right]), ...up}
  } else if (up) {
    return {focus: [...left, focus, ...right], ...up}
  } else {
    return undefined
  }
}

const downIndex = (values, i, rest) =>
  ({left: values.slice(0, i),
    focus: values[i],
    right: values.slice(i+1),
    ...rest})

export const downTo = R.curry((k, {focus, ...up}) => {
  if (isObject(focus)) {
    const keys = R.keys(focus)
    return downIndex(R.values(focus), keys.findIndex(R.equals(k)), {keys, up})
  } else if (isArray(focus)) {
    return downIndex(focus, k, {up})
  } else {
    return undefined
  }
})

export const keyOf = ({left, keys, up}) =>
  keys ? keys[left.length] :
  up   ? left.length :
  undefined

const downMost = head => z => {
  const {focus} = z
  if (isArray(focus)) {
    return focus.length ? downTo(head ? 0 : focus.length-1, z) : undefined
  } else if (isObject(focus)) {
    const keys = R.keys(focus)
    return keys.length ? downTo(right ? keys[0] : R.last(keys), z) : undefined
  } else {
    return undefined
  }
}

export const downHead = downMost(true)
export const downLast = downMost(false)

// FYI: The left and right ops are not accidentally O(n).  I'm just lazy. :)
export const left = ({left, focus, right, ...rest}) =>
  left.length === 0 ? undefined : {
    left: R.dropLast(1, left),
    focus: R.last(left),
    right: R.prepend(focus, right),
    ...rest}

export const right = ({left, focus, right, ...rest}) =>
  right.length === 0 ? undefined : {
    left: R.append(focus, left),
    focus: R.head(right),
    right: R.drop(1, right),
    ...rest}

export const head = z => pass(up(z), z => z && downHead(z))
export const last = z => pass(up(z), z => z && downLast(z))

export const toZipper = focus => ({left: [], right: [], focus})

export const fromZipper = z =>
  pass(up(z), zz => zz ? fromZipper(zz) : get(z))
