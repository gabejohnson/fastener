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

export const downTo = R.curry((k, {focus, ...up}) => {
  if (isObject(focus)) {
    const keys = R.keys(focus)
    const values = R.values(focus)
    const i = keys.findIndex(R.equals(k))
    return {left: values.slice(0, i),
            focus: values[i],
            right: values.slice(i+1),
            keys,
            up}
  } else if (isArray(focus)) {
    return {left: focus.slice(0, k),
            focus: focus[k],
            right: focus.slice(k+1),
            up}
  } else {
    return undefined
  }
})

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

export const toZipper = focus => ({left: [], right: [], focus})

export const fromZipper = z =>
  pass(up(z), zz => zz ? fromZipper(zz) : get(z))
