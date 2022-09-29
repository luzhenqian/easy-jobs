import { Form, FormProps } from "app/core/components/Form"
import { LabeledTextField, LabeledCodeField } from "app/core/components/LabeledTextField"
import { forwardRef, useImperativeHandle, useRef } from "react"
import { z } from "zod"
export { FORM_ERROR } from "app/core/components/Form"

export const TrainingForm = forwardRef(_TrainingForm)

function _TrainingForm<S extends z.ZodType<any, any>>(props: FormProps<S> | any, ref) {
  const htmlEditorRef = useRef(null)
  const cssEditorRef = useRef(null)
  useImperativeHandle(ref, () => ({
    get html() {
      return (htmlEditorRef?.current as any)?.getValue()
    },
    get css() {
      return (cssEditorRef?.current as any)?.getValue()
    },
  }))
  return (
    <Form<S> {...props}>
      <LabeledTextField
        name="order"
        label="题号"
        placeholder="请输入题号"
        type="number"
        min="1"
        required
      />
      <LabeledTextField name="name" label="题目" placeholder="输入题目名称" required />
      <LabeledTextField
        name="description"
        label="描述"
        placeholder="输入题目描述"
        type="textarea"
        required
      />
      <LabeledCodeField
        ref={htmlEditorRef}
        name="htmlCode"
        label="html 代码"
        defaultValue={props.initialValues?.code.html}
        language="html"
        width={800}
        height={100}
      />
      <LabeledCodeField
        ref={cssEditorRef}
        name="cssCode"
        label="css 代码"
        defaultValue={props.initialValues?.code.css}
        language="css"
        width={800}
        height={100}
      />
    </Form>
  )
}
