import { Suspense } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@blitzjs/rpc";
import { useParam } from "@blitzjs/next";

import Layout from "app/core/layouts/Layout";
import getTraining from "app/trainings/queries/getTraining";
import updateTraining from "app/trainings/mutations/updateTraining";
import {
  TrainingForm,
  FORM_ERROR,
} from "app/trainings/components/TrainingForm";

export const EditTraining = () => {
  const router = useRouter();
  const trainingId = useParam("trainingId", "number");
  const [training, { setQueryData }] = useQuery(
    getTraining,
    { id: trainingId },
    {
      // This ensures the query never refreshes and overwrites the form data while the user is editing.
      staleTime: Infinity,
    }
  );
  const [updateTrainingMutation] = useMutation(updateTraining);

  return (
    <>
      <Head>
        <title>Edit Training {training.id}</title>
      </Head>

      <div>
        <h1>Edit Training {training.id}</h1>
        <pre>{JSON.stringify(training, null, 2)}</pre>

        <TrainingForm
          submitText="Update Training"
          // TODO use a zod schema for form validation
          //  - Tip: extract mutation's schema into a shared `validations.ts` file and
          //         then import and use it here
          // schema={UpdateTraining}
          initialValues={training}
          onSubmit={async (values) => {
            try {
              const updated = await updateTrainingMutation({
                id: training.id,
                ...values,
              });
              await setQueryData(updated);
              router.push(Routes.ShowTrainingPage({ trainingId: updated.id }));
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

const EditTrainingPage = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <EditTraining />
      </Suspense>

      <p>
        <Link href={Routes.TrainingsPage()}>
          <a>Trainings</a>
        </Link>
      </p>
    </div>
  );
};

EditTrainingPage.authenticate = true;
EditTrainingPage.getLayout = (page) => <Layout>{page}</Layout>;

export default EditTrainingPage;
