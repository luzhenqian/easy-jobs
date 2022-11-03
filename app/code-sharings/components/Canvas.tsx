export function Canvas({ type, doc }) {
  return <iframe className="flex-1 w-full" srcDoc={`${templates[type]}${doc}`}></iframe>
}

const vanillaTemplateString = `<script>
function funcToString(args) {
  Object.keys(args).forEach((key) => {
    const arg = args[key]
    if (typeof arg === "function") {
      args[key] = arg.toString()
    } else if (typeof arg === "object") {
      funcToString(arg)
    }
  })
}

function objectStringify(args) {
  Object.keys(args).forEach((key) => {
    const arg = args[key]
    if (arg instanceof HTMLElement) {
      args[key] = arg.innerHTML
    } else if (typeof arg === 'object') {
      objectStringify(arg)
    }
  })
}

function objectToString(args) {
  Object.keys(args).forEach((key) => {
    const arg = args[key]
    if (typeof arg === "object") {
      if(arg === null) {
        return
      }
      args[key] = arg.toString()
    }
  })
}

var fns = new Map()
for(let key in console) {
  fns.set(key, console[key])
  console[key] = (...args) => {
    try {
      funcToString(args)
      objectStringify(args)
    } catch (e) {
      objectToString(args)
    }
    window.parent.postMessage({ type: 'console.' + key, args }, "*")
    return fns.get(key)(...args)
  }
}

window.addEventListener('error', function(event, source, lineno, colno, error) {
  window.parent.postMessage({ type: 'error', args: [event.message] }, "*")
})
</script>`

const vueTemplateString = `
${vanillaTemplateString}
<div id="app"></div>
<script type="importmap">
  {"imports":{"vue":"https://pdn.zijieapi.com/esm/bv/vue@latest"},"scopes":{}}
</script>
`

const templates = {
  javascript: vanillaTemplateString,
  vue: vueTemplateString,
}
