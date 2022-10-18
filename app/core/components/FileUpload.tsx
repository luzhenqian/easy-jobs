import React, { useEffect, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Field } from "react-final-form"

function FileUpload({
  accept,
  placeholder = "点击上传文件",
  multiple = false,
  noDrag = true,
  ...props
}) {
  const { getRootProps, getInputProps } = useDropzone({
    accept,
    multiple,
    noDrag,
    onDrop: (acceptedFiles) => {
      props?.onChange?.(acceptedFiles)
    },
  })

  const { onChange, ...inputProps } = getInputProps()

  return (
    <Field name={props.name}>
      {(props) => (
        <div {...getRootProps()}>
          <div>
            <input
              {...inputProps}
              onChange={(e) => {
                onChange?.(e)
                props.input.onChange(e?.target?.files?.[0])
              }}
            />
            <span>{placeholder}</span>
          </div>
        </div>
      )}
    </Field>
  )
}

export default FileUpload
