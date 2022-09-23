import { Routes } from "@blitzjs/next"
import Link from "next/link"
import { useMutation } from "@blitzjs/rpc"
import Layout from "app/core/layouts/Layout"
import createTraining from "app/trainings/mutations/createTraining"
import { TrainingForm, FORM_ERROR } from "app/trainings/components/TrainingForm"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  RadioGroup,
  Stack,
  Radio,
  Button,
} from "@chakra-ui/react"
import { useRef, useState } from "react"

const NewTrainingPage = () => {
  const [createTrainingMutation] = useMutation(createTraining)
  const [code, setCode] = useState({ html: "", css: "" })
  const [type, setType] = useState("css")
  const ref = useRef<any>()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const handleOpen = () => {
    setCode({ html: ref?.current?.html, css: ref?.current?.css })
    onOpen()
  }
  return (
    <Layout
      title={"创建练习题"}
      // bodyStyle={{ justifyContent: "flex-start", alignItems: "flex-start" }}
    >
      <div className="flex flex-col">
        <h1 className="text-2xl">创建新的练习题目</h1>

        <div className="flex">
          <label htmlFor="type">类型：</label>
          <RadioGroup id="type" onChange={setType} value={type}>
            <Stack direction="row">
              <Radio value="css">css</Radio>
              <Radio value="js">js</Radio>
            </Stack>
          </RadioGroup>
        </div>
        <TrainingForm
          submitText="创建题目"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={CreateTraining}
          // initialValues={{}}
          ref={ref}
          onSubmit={async (values) => {
            setCode({ html: ref?.current?.html, css: ref?.current?.css })
            values.code = { html: ref?.current?.html, css: ref?.current?.css }
            values.type = type
            values.jsFramework = {}
            values.cssFramework = {}
            try {
              const training = await createTrainingMutation(values)
              // void router.push(Routes.ShowTrainingPage({ trainingId: training.id }))
            } catch (error: any) {
              console.error(error)
              return {
                [FORM_ERROR]: error.toString(),
              }
            }
          }}
        />

        <Button size={"md"} width={"14"} onClick={handleOpen}>
          预览
        </Button>

        <Modal isOpen={isOpen} onClose={onClose} closeOnEsc size={"full"}>
          <ModalOverlay />
          <ModalContent>
            <ModalBody className="flex box-border">
              <ModalCloseButton />
              <iframe
                className="w-full flex-1"
                srcDoc={`${code.html} <style>${code.css}</style>`}
              ></iframe>
            </ModalBody>
          </ModalContent>
        </Modal>

        <p>
          <Link href={Routes.TrainingsPage()}>
            <a>练习题目列表</a>
          </Link>
        </p>
      </div>
    </Layout>
  )
}

NewTrainingPage.authenticate = true

export default NewTrainingPage
