import { Suspense } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@blitzjs/rpc";
import { useParam } from "@blitzjs/next";

import Layout from "app/core/layouts/Layout";
import getCodeSharing from "app/code-sharings/queries/getCodeSharing";
import updateCodeSharing from "app/code-sharings/mutations/updateCodeSharing";
import {
  CodeSharingForm,
  FORM_ERROR,
} from "app/code-sharings/components/CodeSharingForm";

export const EditCodeSharing = () => {
  const router = useRouter();
  const codeSharingId = useParam("codeSharingId", "number");
  const [codeSharing, { setQueryData }] = useQuery(
    getCodeSharing,
    { id: codeSharingId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  );
  const [updateCodeSharingMutation] = useMutation(updateCodeSharing);

  return (
    <>
      <Head>
        <title>Edit CodeSharing {codeSharing.id}</title>
      </Head>

      <div>
        <h1>Edit CodeSharing {codeSharing.id}</h1>
        <pre>{JSON.stringify(codeSharing, null, 2)}</pre>

        <CodeSharingForm
          submitText="Update CodeSharing"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdateCodeSharing}
          initialValues={codeSharing}
          onSubmit={async (values) => {
            try {
              const updated = await updateCodeSharingMutation({
                id: codeSharing.id,
                ...values,
              });
              await setQueryData(updated);
              router.push(
                Routes.ShowCodeSharingPage({ codeSharingId: updated.id })
              );
            } catch (error: any) {
              console.error(error);
              return {
                [FORM_ERROR]: error.toString(),
              };
            }
          }}
        />
      </div>
    </>
  );
};

const EditCodeSharingPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditCodeSharing />
      </Suspense>

      <p>
        <Link href={Routes.CodeSharingsPage()}>
          <a>CodeSharings</a>
        </Link>
      </p>
    </div>
  );
};

EditCodeSharingPage.authenticate = true;
EditCodeSharingPage.getLayout = (page) => <Layout>{page}</Layout>;

export default EditCodeSharingPage;
