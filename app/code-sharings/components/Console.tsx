import { Button } from "@chakra-ui/react"
import Editor from "@monaco-editor/react"
import { ArrowDown, ArrowUp } from "app/core/components/Icons"
import { useLocalStorage } from "app/core/hooks/useLocalStorage"
import { useEffect, useRef, useState } from "react"
import { Moving } from "./Moving"

export function Console({ logs, setLogs }) {
  const [consoleOpen, setConsoleOpen] = useLocalStorage("editor.layout.consoleOpen", false)
  const [consoleMoving, setConsoleMoving] = useState(false)
  const [consoleHeight, setConsoleHeight] = useLocalStorage("editor.layout.consoleHeight", 300)
  const consoleRef = useRef<any>(null)
  const onMount = (editor) => {
    consoleRef.current = editor
  }

  useEffect(() => {
    let timer: any = null
    if (consoleOpen === true) {
      timer = setInterval(() => {
        if (consoleRef.current) {
          consoleRef.current.setValue(
            logs
              .map((log) => {
                return log.args
                  .map((arg) => {
                    if (typeof arg === "object") {
                      return JSON.stringify(arg)
                    }
                    return arg
                  })
                  .join(" ")
              })
              .join("\n")
          )
          timer && clearInterval(timer)
        }
      }, 5_0)
    }
    return () => timer && clearInterval(timer)
  }, [logs])

  return (
    <div className="text-gray-100 bg-black rounded-t-lg">
      {consoleMoving && (
        <Moving
          direction="row"
          onMoveStart={(e) => {
            setConsoleHeight(document.body.clientHeight - e.pageY - 40)
          }}
          onMoveEnd={(e) => {
            setConsoleMoving(false)
          }}
        ></Moving>
      )}

      <div
        className="flex justify-between items-center px-4 h-[40px] relative"
        onClick={() => setConsoleOpen(!consoleOpen)}
      >
        {consoleOpen && (
          <span
            className={`z-10 inline-block cursor-ns-resize h-[6px] absolute top-0 left-0 right-0 bg-blue-500 opacity-0 hover:opacity-100
        ${consoleMoving && "opacity-100"}
        translate-y-[-3px]`}
            onMouseDown={() => {
              setConsoleMoving(true)
            }}
          ></span>
        )}

        <div>控制台</div>
        {consoleOpen ? (
          <div className="flex items-center justify-center">
            <Button
              size={"xs"}
              backgroundColor={"blue.500"}
              onClick={(e) => {
                e.stopPropagation()
                setLogs([])
              }}
              _hover={{ backgroundColor: "blue.600" }}
            >
              清除日志
            </Button>
            <ArrowDown size={"lg"} className="fill-white" />
          </div>
        ) : (
          <ArrowUp size={"lg"} className="fill-white" />
        )}
      </div>
      {consoleOpen ? (
        <div
          className="border-t border-gray-400 max-h-[70vh] min-h-[100px]"
          style={{
            height: consoleHeight + "px",
          }}
        >
          <div></div>
          <Editor
            language="json"
            theme="vs-dark"
            onMount={onMount}
            options={{ readOnly: true, fontSize: 18, tabSize: 2 }}
          ></Editor>
        </div>
      ) : null}
    </div>
  )
}
