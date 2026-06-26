import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";

function RegistrationDetails() {

  const { id, registrationId } = useParams();

  const [registration, setRegistration] =
    useState(null);

  const [pdfPreviewUrl, setPdfPreviewUrl] =
    useState("");

  useEffect(() => {

    const registrations =
      JSON.parse(
        localStorage.getItem(
          `registrations_${id}`
        )
      ) || [];

    const selected =
      registrations.find(
        (item) =>
          String(item.id) ===
          registrationId
      );

    setRegistration(selected);

  }, [id, registrationId]);

  useEffect(() => {

    if (
      registration?.pdfUrl &&
      registration.pdfUrl.startsWith(
        "data:application/pdf"
      )
    ) {

      fetch(registration.pdfUrl)
        .then((res) => res.blob())
        .then((blob) => {

          const blobUrl =
            URL.createObjectURL(blob);

          setPdfPreviewUrl(blobUrl);

        })
        .catch((err) => {
          console.log(
            "PDF Preview Error",
            err
          );
        });

    }

  }, [registration]);

  if (!registration) {

    return (
      <MainLayout>
        <div className="glass-card p-6">
          Registration Not Found
        </div>
      </MainLayout>
    );

  }

  return (

    <MainLayout>

      <div className="glass p-6">

        <h1 className="text-3xl font-bold mb-6">
          Registration Details
        </h1>

        <div className="grid md:grid-cols-2 gap-4">

          <div className="glass-card p-4">
            <p className="text-gray-400">
              Type
            </p>

            <h3>
              {registration.category}
            </h3>
          </div>

          <div className="glass-card p-4">
            <p className="text-gray-400">
              Registration Name
            </p>

            <h3>
              {registration.registrationName}
            </h3>
          </div>

          <div className="glass-card p-4">
            <p className="text-gray-400">
              Start Date
            </p>

            <h3>
              {registration.startDate}
            </h3>
          </div>

          <div className="glass-card p-4">
            <p className="text-gray-400">
              End Date
            </p>

            <h3>
              {registration.endDate}
            </h3>
          </div>

          <div className="glass-card p-4">
            <p className="text-gray-400">
              Status
            </p>

            <h3>
              {registration.status}
            </h3>
          </div>

          <div className="glass-card p-4">

            <p className="text-gray-400">
              PDF Document
            </p>

            <h3 className="mb-4 break-all">
              {registration.pdf}
            </h3>

            {pdfPreviewUrl && (

              <div className="flex gap-3">

                <button
                  onClick={() =>
                    window.open(
                      pdfPreviewUrl,
                      "_blank"
                    )
                  }
                  className="glass-card px-4 py-2"
                >
                  View PDF
                </button>

                <a
                  href={pdfPreviewUrl}
                  download={registration.pdf}
                  className="glass-card px-4 py-2"
                >
                  Download PDF
                </a>

              </div>

            )}

          </div>

        </div>

        {pdfPreviewUrl && (

          <div className="mt-8">

            <h2 className="text-xl font-semibold mb-4">
              PDF Preview
            </h2>

            <iframe
              src={pdfPreviewUrl}
              width="100%"
              height="700"
              title="PDF Preview"
              className="rounded-xl border border-white/10"
            />

          </div>

        )}

      </div>

    </MainLayout>

  );

}

export default RegistrationDetails;