import { useCallback, useEffect, useRef, useState } from "react"
import { Button, Checkbox } from "@chakra-ui/react"
import Editor, { loader } from "@monaco-editor/react"
import Loading from "app/core/components/Loading"
import { useLocalStorage } from "app/core/hooks/useLocalStorage"
import { Moving } from "./Moving"

loader.config({
  paths: {
    vs: "/libs/vs",
  },
})

type Lang = "html" | "css" | "javascript"
type Codes = {
  html: string
  css: string
  javascript: string
}

const JavaScriptEditor = ({ initialCodes, onRunJS, onChange }) => {
  const [lang, setLang] = useLocalStorage<Lang>("editor.layout.openLanguage", "html")
  const [autoRunJS, setAutoRunJS] = useState(false)
  const [codes, setCodes] = useLocalStorage<Codes>("editor.javascript.codes", {
    html: "",
    css: "",
    javascript: "",
  })
  const editorRef = useRef<any>()

  const onMount = (editor) => {
    editorRef.current = editor
    // initialCode 是别人分享时的代码
    // codes 是自己编辑的代码
    if (initialCodes) {
      editorRef.current.setValue(initialCodes[lang])
      return
    }
    editorRef.current.setValue(codes[lang])
  }

  const editorOnChange = (value) => {
    setCodes((prev) => {
      const newCodes = { ...prev, [lang]: value }
      return newCodes
    })
  }

  const runJS = () => {
    onRunJS(`${codes.html}<style>${codes.css}</style><script>${codes.javascript}</script>`)
  }

  // 缓存上一次的 JavaScript 代码
  const lastScript = useRef<string>("")

  const makeDoc = useCallback(() => {
    // 如果自动运行 JavaScript 代码，更新缓存
    if (autoRunJS) {
      lastScript.current = codes.javascript
    }
    return `${codes.html}<style>${codes.css}</style><script>${lastScript.current}</script>`
  }, [codes])

  useEffect(() => {
    onChange(makeDoc())
  }, [codes, makeDoc])

  useEffect(() => {
    if (editorRef.current) editorRef.current.setValue(codes[lang])
  }, [lang])

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

      <div className="flex flex-wrap justify-between gap-2 px-8 py-2 text-gray-100 bg-gray-900">
        <div className="flex gap-3">
          <span
            className={`${lang === "html" ? "text-blue-500" : ""} cursor-pointer`}
            onClick={setLang.bind(null, "html")}
          >
            HTML
          </span>
          <span
            className={`${lang === "css" ? "text-blue-500" : ""} cursor-pointer`}
            onClick={setLang.bind(null, "css")}
          >
            CSS
          </span>
          <span
            className={`${lang === "javascript" ? "text-blue-500" : ""} cursor-pointer`}
            onClick={() => setLang("javascript")}
          >
            JavaScript
          </span>
        </div>
        <div className="flex gap-3">
          <Button
            size={"xs"}
            backgroundColor={"blue.500"}
            _hover={{ backgroundColor: "blue.600" }}
            onClick={runJS}
          >
            运行 JS
          </Button>
          <Button
            size={"xs"}
            backgroundColor={"blue.500"}
            _hover={{ backgroundColor: "blue.600" }}
            onClick={format}
          >
            格式化代码
          </Button>

          <Checkbox
            checked={autoRunJS}
            value="cc"
            onChange={(e) => {
              setAutoRunJS(e.target.checked)
            }}
          >
            自动运行 JS
          </Checkbox>
        </div>
      </div>
      <div className="flex-1">
        <Editor
          loading={<Loading />}
          theme="vs-dark"
          language={lang}
          defaultLanguage={lang}
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

export default JavaScriptEditor
