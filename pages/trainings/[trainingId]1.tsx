import { Suspense } from "react";
import { Routes } from "@blitzjs/next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "@blitzjs/rpc";
import { useParam } from "@blitzjs/next";

import Layout from "app/core/layouts/Layout";
import getTraining from "app/trainings/queries/getTraining";
import deleteTraining from "app/trainings/mutations/deleteTraining";

export const Training = () => {
  const router = useRouter();
  const trainingId = useParam("trainingId", "number");
  const [deleteTrainingMutation] = useMutation(deleteTraining);
  const [training] = useQuery(getTraining, { id: trainingId });

  return (
    <>
      <Head>
        <title>Training {training.id}</title>
      </Head>

      <div>
        <h1>Training {training.id}</h1>
        <pre>{JSON.stringify(training, null, 2)}</pre>

        <Link href={Routes.EditTrainingPage({ trainingId: training.id })}>
          <a>Edit</a>
        </Link>

        <button
          type="button"
          onClick={async () => {
            if (window.confirm("This will be deleted")) {
              await deleteTrainingMutation({ id: training.id });
              router.push(Routes.TrainingsPage());
            }
          }}
          style={{ marginLeft: "0.5rem" }}
        >
          Delete
        </button>
      </div>
    </>
  );
};

const ShowTrainingPage = () => {
  return (
    <div>
      <p>
        <Link href={Routes.TrainingsPage()}>
          <a>Trainings</a>
        </Link>
      </p>

      <Suspense fallback={<div>Loading...</div>}>
        <Training />
      </Suspense>
    </div>
  );
};

ShowTrainingPage.authenticate = true;
ShowTrainingPage.getLayout = (page) => <Layout>{page}</Layout>;

export default ShowTrainingPage;
