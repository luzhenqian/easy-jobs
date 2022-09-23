import { Suspense, useRef, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"

import Layout from "app/core/layouts/Layout"
import getTraining from "app/trainings/queries/getTraining"
import updateTraining from "app/trainings/mutations/updateTraining"
import { TrainingForm, FORM_ERROR } from "app/trainings/components/TrainingForm"
import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react"

export const EditTraining = () => {
  const router = useRouter()
  const trainingId = useParam("trainingId", "number")
  const [training, { setQueryData }] = useQuery(
    getTraining,
    { id: trainingId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )
  const [updateTrainingMutation] = useMutation(updateTraining)
  const [code, setCode] = useState({ html: "", css: "" })

  const ref = useRef<any>()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const handleOpen = () => {
    setCode({ html: ref?.current?.html, css: ref?.current?.css })
    onOpen()
  }
  return (
    <>
      <Head>
        <title>Edit Training {training.id}</title>
      </Head>

      <div>
        <h1>Edit Training {training.id}</h1>
        <pre>{JSON.stringify(training, null, 2)}</pre>

        <TrainingForm
          submitText="更新练习题"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdateTraining}
          initialValues={training}
          ref={ref}
          onSubmit={async (values) => {
            setCode({ html: ref?.current?.html, css: ref?.current?.css })
            values.code = { html: ref?.current?.html, css: ref?.current?.css }
            values.jsFramework = {}
            values.cssFramework = {}
            try {
              const updated = await updateTrainingMutation({
                id: training.id,
                ...values,
              })
              await setQueryData(updated)
              void router.push(
                Routes.ShowTrainingPage({ trainingId: updated.id, type: updated.type })
              )
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
      </div>
    </>
  )
}

const EditTrainingPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditTraining />
      </Suspense>

      <p>
        <Link href={Routes.TrainingsPage()}>
          <a>练习题目列表</a>
        </Link>
      </p>
    </div>
  )
}

EditTrainingPage.authenticate = true
EditTrainingPage.getLayout = (page) => <Layout>{page}</Layout>

export default EditTrainingPage
