import FileUpload from "app/core/components/FileUpload"
import { Form, FormProps } from "app/core/components/Form"
import { LabeledTextField } from "app/core/components/LabeledTextField"
import { Field } from "react-final-form"
import { z } from "zod"
export { FORM_ERROR } from "app/core/components/Form"

export function BookForm<S extends z.ZodType<any, any>>(props: FormProps<S>) {
  return (
    <Form<S> {...props}>
      <LabeledTextField name="name" label="名称" />
      <LabeledTextField name="cover" label="封面" />
      <LabeledTextField name="url" label="Url" />
      <LabeledTextField name="order" label="排序" type="number" />
    </Form>
  )
}
