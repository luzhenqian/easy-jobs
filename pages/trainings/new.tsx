import { Routes } from "@blitzjs/next"
import Link from "next/link"
import { useRouter } from "next/router"
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
} from "@chakra-ui/react"
import { useRef, useState } from "react"

const NewTrainingPage = () => {
  const [createTrainingMutation] = useMutation(createTraining)
  const [code, setCode] = useState({ html: "", css: "" })
  const ref = useRef<any>()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const handleOpen = () => {
    setCode({ html: ref?.current?.html, css: ref?.current?.css })
    onOpen()
  }
  return (
    <Layout title={"Create New Training"}>
      <h1>创建新的练习题目</h1>

      <TrainingForm
        submitText="创建题目"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateTraining}
        // initialValues={{}}
        ref={ref}
        onSubmit={async (values) => {
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

      <a onClick={handleOpen}>预览</a>

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
          <a>练习</a>
        </Link>
      </p>
    </Layout>
  )
}

NewTrainingPage.authenticate = true

export default NewTrainingPage
