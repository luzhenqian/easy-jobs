import { forwardRef, ComponentPropsWithoutRef, PropsWithoutRef } from "react"
import { useField, UseFieldConfig } from "react-final-form"
import { Input, Textarea } from "@chakra-ui/react"
import Monaco, { EditorProps } from "@monaco-editor/react"

export interface LabeledTextFieldProps extends PropsWithoutRef<JSX.IntrinsicElements["input"]> {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
  /** Field type. Doesn't include radio buttons and checkboxes */
  type?: "text" | "password" | "email" | "number" | "textarea"
  outerProps?: PropsWithoutRef<JSX.IntrinsicElements["div"]>
  labelProps?: ComponentPropsWithoutRef<"label">
  fieldProps?: UseFieldConfig<string>
}

export interface LabeledCodeFieldProps extends EditorProps {
  /** Field name. */
  name: string
  /** Field label. */
  label: string
}

export const LabeledTextField = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  LabeledTextFieldProps
>(({ name, label, outerProps, fieldProps, labelProps, type, ...props }, ref) => {
  const {
    input,
    meta: { touched, error, submitError, submitting },
  } = useField(name, {
    parse:
      type === "number"
        ? (Number as any)
        : // Converting `""` to `null` ensures empty values will be set to null in the DB
          (v) => (v === "" ? null : v),
    ...fieldProps,
  })

  const normalizedError = Array.isArray(error) ? error.join(", ") : error || submitError

  return (
    <div {...outerProps}>
      <label {...labelProps}>
        {label}

        {type === "textarea" ? (
          /* @ts-ignore */
          <Textarea {...input} disabled={submitting} {...props} ref={ref as any} type={type} />
        ) : (
          /* @ts-ignore */
          <Input {...input} disabled={submitting} {...props} ref={ref as any} type={type} />
        )}
      </label>

      {touched && normalizedError && (
        <div role="alert" style={{ color: "red" }}>
          {normalizedError}
        </div>
      )}

      <style jsx>{`
        label {
          display: flex;
          flex-direction: column;
          align-items: start;
          font-size: 1rem;
        }
        input {
          font-size: 1rem;
          padding: 0.25rem 0.5rem;
          border-radius: 3px;
          border: 1px solid purple;
          appearance: none;
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  )
})

export const LabeledCodeField = forwardRef<HTMLInputElement, LabeledCodeFieldProps>(
  ({ name, label, ...props }, ref) => {
    const {
      input,
      meta: { touched, error, submitError, submitting },
    } = useField(name, {
      parse: (v) => (v === "" ? null : v),
    })

    function handleEditorDidMount(editor: any) {
      console.log(editor, ref)
      if (ref !== null && "current" in ref) ref.current = editor
    }

    const normalizedError = Array.isArray(error) ? error.join(", ") : error || submitError
    console.log("props:", props)

    return (
      <div>
        <label>
          {label}
          {/* @ts-ignore */}
          {/* <Input {...input} {...props} ref={ref} /> */}
          <Monaco value={input.value} onMount={handleEditorDidMount} {...props} />
        </label>

        {touched && normalizedError && (
          <div role="alert" style={{ color: "red" }}>
            {normalizedError}
          </div>
        )}

        <style jsx>{`
          label {
            display: flex;
            flex-direction: column;
            align-items: start;
            font-size: 1rem;
          }
          input {
            font-size: 1rem;
            padding: 0.25rem 0.5rem;
            border-radius: 3px;
            border: 1px solid purple;
            appearance: none;
            margin-top: 0.5rem;
          }
        `}</style>
      </div>
    )
  }
)

export default LabeledTextField
