import { useCallback, useEffect, useRef, useState } from "react"
import { Button, Checkbox } from "@chakra-ui/react"
import Editor, { loader } from "@monaco-editor/react"
import Loading from "app/core/components/Loading"
import { useLocalStorage } from "app/core/hooks/useLocalStorage"
import { Moving } from "./Moving"
import { compileTemplate, compileScript, compileStyle, parse } from "@vue/compiler-sfc"

loader.config({
  paths: {
    vs: "/libs/vs",
  },
  "vs/nls": {
    availableLanguages: {},
  },
})

const VueEditor = ({ initialCodes, onRunJS, onChange }) => {
  const [code, setCode] = useLocalStorage<string>("editor.vue.codes", "")
  const editorRef = useRef<any>()

  const onMount = (editor) => {
    editorRef.current = editor
    // initialCode 是别人分享时的代码
    // codes 是自己编辑的代码
    if (initialCodes) {
      editorRef.current.setValue(initialCodes.vue)
      return
    }
    console.log(editor, "e")
    editorRef.current.setValue(code)
  }

  const editorOnChange = (value) => {
    setCode(value)
  }

  const compile = (source: string) => {
    const makeBase64Url = (code) => `data:text/javascript;base64,${window.btoa(code)}`
    const parseResult = parse(source, {
      filename: "App.vue",
    })
    let scriptContent = "export default {}"
    console.log(parseResult.descriptor)
    if (parseResult.descriptor.script || parseResult.descriptor.scriptSetup) {
      scriptContent = compileScript(parseResult.descriptor, { id: "App.vue" }).content
    }

    const { code: templateCode } = compileTemplate({
      id: "App.vue",
      source: parseResult.descriptor?.template?.content || "",
      filename: "App.vue",
    })
    const code = `
    import { createApp } from 'vue'
    import { render } from "${makeBase64Url(templateCode)}"
import App from '${makeBase64Url(scriptContent)}';
App.render = render;
App.__file = 'App.vue';
createApp(App).mount('#app');`
    return `<style>${parseResult.descriptor?.styles?.[0]?.content}</style><script type="module">${code}</script>`
  }

  const runCode = () => {
    const target = compile(code)
    onRunJS(target)
  }

  // const makeDoc = useCallback(() => {
  //   return compile(code)
  // }, [code])

  // useEffect(() => {
  //   onChange(makeDoc())
  // }, [code, makeDoc])

  const format = () => {
    if (editorRef.current) {
      editorRef.current.trigger("anyString", "editor.action.formatDocument")
    }
  }

  const [editorMoving, setEditorMoving] = useState(false)
  const [editorWidth, setEditorWidth] = useLocalStorage("editor.layout.editorWidth", 0)

  return (
    <div
      className="flex flex-col min-w-[400px] relative"
      style={{
        width: editorWidth ? editorWidth + "px" : "50%",
      }}
    >
      {editorMoving && (
        <Moving
          direction="col"
          onMoveStart={(e) => {
            setEditorWidth(e.pageX)
          }}
          onMoveEnd={(e) => {
            setEditorMoving(false)
          }}
        ></Moving>
      )}
      <span
        className={`inline-block cursor-ew-resize w-[6px] z-10 bg-blue-500 opacity-0 hover:opacity-100 absolute right-0 top-0 bottom-0
            ${editorMoving && "opacity-100"}
            translate-x-[3px]`}
        onMouseDown={() => {
          setEditorMoving(true)
        }}
      ></span>

      <div className="flex flex-wrap justify-end gap-2 px-8 py-2 text-gray-100 bg-gray-900">
        <div className="flex gap-3">
          <Button
            size={"xs"}
            backgroundColor={"blue.500"}
            _hover={{ backgroundColor: "blue.600" }}
            onClick={runCode}
          >
            运行代码
          </Button>
          <Button
            size={"xs"}
            backgroundColor={"blue.500"}
            _hover={{ backgroundColor: "blue.600" }}
            onClick={format}
          >
            格式化代码
          </Button>
        </div>
      </div>
      <div className="flex-1">
        <Editor
          loading={<Loading />}
          theme="vs-dark"
          language={"html"}
          defaultLanguage={"html"}
          onMount={onMount}
          onChange={editorOnChange}
          options={{
            fontSize: 18,
            tabSize: 2,
          }}
        ></Editor>
      </div>
    </div>
  )
}

export default VueEditor
