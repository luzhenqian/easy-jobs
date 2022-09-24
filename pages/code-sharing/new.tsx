import { Routes } from "@blitzjs/next";
import Link from "next/link";
import { useRouter } from "next/router";
import { useMutation } from "@blitzjs/rpc";
import Layout from "app/core/layouts/Layout";
import createCodeSharing from "app/code-sharings/mutations/createCodeSharing";
import {
  CodeSharingForm,
  FORM_ERROR,
} from "app/code-sharings/components/CodeSharingForm";

const NewCodeSharingPage = () => {
  const router = useRouter();
  const [createCodeSharingMutation] = useMutation(createCodeSharing);

  return (
    <Layout title={"Create New CodeSharing"}>
      <h1>Create New CodeSharing</h1>

      <CodeSharingForm
        submitText="Create CodeSharing"
        // TODO use a zod schema for form validation
        //  - Tip: extract mutation's schema into a shared `validations.ts` file and
        //         then import and use it here
        // schema={CreateCodeSharing}
        // initialValues={{}}
        onSubmit={async (values) => {
          try {
            const codeSharing = await createCodeSharingMutation(values);
            router.push(
              Routes.ShowCodeSharingPage({ codeSharingId: codeSharing.id })
            );
          } catch (error: any) {
            console.error(error);
            return {
              [FORM_ERROR]: error.toString(),
            };
          }
        }}
      />

      <p>
        <Link href={Routes.CodeSharingsPage()}>
          <a>CodeSharings</a>
        </Link>
      </p>
    </Layout>
  );
};

NewCodeSharingPage.authenticate = true;

export default NewCodeSharingPage;
