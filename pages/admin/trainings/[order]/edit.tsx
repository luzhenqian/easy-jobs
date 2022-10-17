import { Suspense, useRef, useState } from "react"
import { Routes } from "@blitzjs/next"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import { useQuery, useMutation } from "@blitzjs/rpc"
import { useParam } from "@blitzjs/next"

import Layout from "app/core/layouts/Layout"
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
  useToast,
} from "@chakra-ui/react"
import dynamic from "next/dynamic"
import getTrainings from "app/trainings/queries/getTrainings"

const ReactJson = dynamic(() => import("react-json-view"), {
  ssr: false,
})

export const EditTraining = () => {
  const router = useRouter()
  const order = useParam("order", "number")
  const [{ trainings }, { setQueryData }] = useQuery(
    getTrainings,
    { order },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  )

  const training = trainings[0]
  const [updateTrainingMutation] = useMutation(updateTraining)
  const [code, setCode] = useState({ html: "", css: "" })

  const ref = useRef<any>()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const handleOpen = () => {
    setCode({ html: ref?.current?.html, css: ref?.current?.css })
    onOpen()
  }
  const toast = useToast()
  if (!training) {
    return <div>题目不存在</div>
  }
  return (
    <>
      <Head>
        <title>Edit Training {training.id}</title>
      </Head>

      <div>
        <h1>Edit Training {training.id}</h1>
        {/* <pre>{JSON.stringify(training, null, 2)}</pre> */}

        <ReactJson
          src={training}
          name={"training"}
          theme="harmonic"
          onEdit={(edit) => {
            const dontEditFields = ["id", "createdAt", "updatedAt", "recordId", "type"]
            if (dontEditFields.includes(edit.name as string)) {
              toast({
                title: "该字段不允许修改",
                duration: 2000,
                position: "top",
                status: "error",
              })
              return false
            }
          }}
        />

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
            console.log(values, "values")

            try {
              const updated = await updateTrainingMutation({
                id: training.id,
                ...values,
              })
              // @ts-ignore
              await setQueryData({
                trainings: [updated],
              })
              void router.push(
                Routes.AdminTrainingsPage({ trainingId: updated.id, type: updated.type })
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
            <ModalBody className="box-border flex">
              <ModalCloseButton />
              <iframe
                className="flex-1 w-full"
                srcDoc={`${code.html} <style>${code.css}</style>`}
              ></iframe>
            </ModalBody>
          </ModalContent>
        </Modal>
      </div>
    </>
  )
}

const AdminEditTrainingPage = () => {
  return (
    <div className="w-[800px] m-auto">
      <Suspense fallback={<div>Loading...</div>}>
        <EditTraining />
      </Suspense>

      <p>
        <Link href={Routes.AdminTrainingsPage()}>
          <a>练习题目列表</a>
        </Link>
      </p>
    </div>
  )
}

AdminEditTrainingPage.authenticate = true
AdminEditTrainingPage.getLayout = (page) => <Layout>{page}</Layout>

export default AdminEditTrainingPage
