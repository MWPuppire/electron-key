var k
var _handlers = {}
var _mods = { 16: false, 18: false, 17: false, 91: false }
var _scope = 'all'
var _MODIFIERS = { shift: 16, alt: 18, option: 18, ctrl: 17, control: 17, command: 91 }
var _MAP = { backspace: 8, tab: 9, clear: 12, enter: 13, return: 13, esc: 27, escape: 27, space: 32, left: 37, up: 38, right: 39, down: 40, del: 46, delete: 46, home: 36, end: 35, pageup: 33, pagedown: 34, ',': 188, '.': 190, '/': 191, '`': 192, '-': 189, '=': 187, ';': 186, '\'': 222, '[': 219, ']': 221, '\\': 220 }
var code = function (x) {
  return _MAP[x] || x.toUpperCase().charCodeAt(0)
}
var _downKeys = []
for (var k = 1; k < 20; k++) _MAP['f' + k] = 111 + k
function index (array, item) {
  var i = array.length
  while (i--) if (array[i] === item) return i
  return -1
}
function compareArray (a1, a2) {
  if (a1.length != a2.length) return false
  for (var i = 0; i < a1.length; i++) if (a1[i] !== a2[i]) return false
  return true
}
var modifierMap = { 16: 'shiftKey', 18: 'altKey', 17: 'ctrlKey', 91: 'metaKey' }
function updateModifierKey (event) {
  for (var k in _mods) _mods[k] = event[modifierMap[k]]
}
function dispatch (event) {
  var key = event.keyCode
  if (index(_downKeys, key) == -1) _downKeys.push(key)
  if (key === 93 || key === 224) key = 91
  if (key in _mods) {
    _mods[key] = true
    for (var k in _MODIFIERS) if (_MODIFIERS[k] === key) assignKey[k] = true
    return
  }
  updateModifierKey(event)
  if (!assignKey.filter.call(this, event)) return
  if (!(key in _handlers)) return
  var scope = getScope()
  var handler
  var modifiersMatch
  for (var i = 0; i < _handlers[key].length; i++) {
    handler = _handlers[key][i]
    if (handler.scope === scope || handler.scope === 'all') {
      modifiersMatch = handler.mods.length > 0
      for (var k in _mods) {
        if ((!_mods[k] && index(handler.mods, +k) > -1) || (_mods[k] && index(handler.mods, +k) === -1)) modifiersMatch = false
      }
      if ((handler.mods.length === 0 && !_mods[16] && !_mods[18] && !_mods[17] && !_mods[91]) || modifiersMatch) {
        if (handler.method(event, handler) === false) {
          if (event.stopPropagation) event.stopPropagation()
          if (event.cancelBubble) event.cancelBubble = true
        }
      }
    }
  }
}
function clearModifier (event) {
  var key = event.keyCode
  var i = index(_downKeys, key)
  if (i >= 0) _downKeys.splice(i, 1)
  if (key === 93 || key === 224) key = 91
  if (key in _mods) {
    _mods[key] = false
    for (var k in _MODIFIERS) if (_MODIFIERS[k] === key) assignKey[k] = false
  }
}
function resetModifiers () {
  for (var k in _mods) _mods[k] = false
  for (var k in _MODIFIERS) assignKey[k] = false
}
function assignKey (key, scope, method) {
  var keys = getKeys(key)
  var mods
  if (method === undefined) {
    method = scope
    scope = 'all'
  }
  for (var i = 0; i < keys.length; i++) {
    mods = []
    key = keys[i].split('+')
    if (key.length > 1) {
      mods = getMods(key)
      key = [key[key.length - 1]]
    }
    key = key[0]
    key = code(key)
    if (!(key in _handlers)) _handlers[key] = []
    _handlers[key].push({ shortcut: keys[i], scope: scope, method: method, key: keys[i], mods: mods })
  }
}
function unbindKey (key, scope) {
  var mods = []
  var multipleKeys = getKeys(key)
  var keys
  var key
  for (var j = 0; j < multipleKeys.length; j++) {
    keys = multipleKeys[j].split('+')
    if (keys.length > 1) mods = getMods
    key = keys[keys.length - 1]
    key = code(key)
    if (scope === undefined) scope = getScope()
    if (!_handlers[key]) return
    for (var i = 0; i < _handlers[key].length; i++) {
      if (_handlers[key][i].scope === scope && compareArray(_handlers[key][i].mods, mods)) _handlers[key][i] = {}
    }
  }
}
function isPressed (keyCode) {
  if (typeof keyCode === 'string') keyCode = code(keyCode)
  return index(_downKeys, keyCode) != -1
}
function getPressedKeyCodes () {
  return _downKeys.slice(0)
}
function filter (event) {
  var tagName = (event.target || event.srcElement).tagName
  return !(tagName === "INPUT" || tagName === "SELECT" || tagName === "TEXTAREA")
}
for (var k in _MODIFIERS) assignKey[k] = false
function setScope (scope) { _scope = scope || 'all' }
function getScope () { return _scope || 'all' }
function deleteScope (scope) {
  var handlers
  for (var key in _handlers) {
    handlers = _handlers[key]
    for (var i = 0; i < handlers.length; i) {
      if (handlers[i].scope === scope) handlers.splice(i, 1)
      else i++
    }
  }
}
function getKeys (key) {
  key = key.replace(/\s/g, '')
  var keys = key.split(',')
  if ((keys[keys.length - 1]) === '') keys[keys.length - 2] += ','
  return keys
}
function getMods (key) {
  var mods = key.slice(0, key.length - 1)
  for (var i = 0; i < mods.length; i++) mods[i] = _MODIFIERS[mods[i]]
  return mods
}
function addEvent (object, event, method) {
  if (object.addEventListener) object.addEventListener(event, method, false)
  else if (object.attachEvent) object.attachEvent('on' + event, function () {method(window.event) })
}
function listen (func) {
  addEvent(window, "keydown", func)
}
addEvent(document, 'keydown', function (event) { dispatch(event) })
addEvent(document, 'keyup', clearModifier)
addEvent(window, 'focus', resetModifiers)
module.exports = assignKey
module.exports.setScope = setScope
module.exports.getScope = getScope
module.exports.deleteScope = deleteScope
module.exports.filter = filter
module.exports.isPressed = isPressed
module.exports.getPressedKeyCodes = getPressedKeyCodes
module.exports.getKeys = getPressedKeyCodes
module.exports.unbind = unbindKey
module.exports.code = code
module.exports.listen = listen
