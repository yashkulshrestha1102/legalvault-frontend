import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";

function ContractDetails() {

  const { id, contractId } = useParams();

  const [contract, setContract] = useState(null);

  const [pdfPreviewUrl, setPdfPreviewUrl] =
    useState("");

  useEffect(() => {

    const contracts =
      JSON.parse(
        localStorage.getItem(
          `contracts_${id}`
        )
      ) || [];

    const selected =
      contracts.find(
        (item) =>
          String(item.id) === contractId
      );

    setContract(selected);

  }, [id, contractId]);

  useEffect(() => {

    if (
      contract?.pdfUrl &&
      contract.pdfUrl.startsWith(
        "data:application/pdf"
      )
    ) {

      fetch(contract.pdfUrl)
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

  }, [contract]);

  if (!contract) {

    return (

      <MainLayout>

        <div className="glass-card p-6">
          Contract Not Found
        </div>

      </MainLayout>

    );

  }

  return (

    <MainLayout>

      <div className="glass p-6">

        <h1 className="text-3xl font-bold mb-6">
          Contract Details
        </h1>

        <div className="grid md:grid-cols-2 gap-4">

          <div className="glass-card p-4">
            <p className="text-gray-400">
              Contract Type
            </p>

            <h3>
              {contract.contractType}
            </h3>
          </div>

          <div className="glass-card p-4">
            <p className="text-gray-400">
              Contract Name
            </p>

            <h3>
              {contract.contractName}
            </h3>
          </div>

          <div className="glass-card p-4">
            <p className="text-gray-400">
              First Party
            </p>

            <h3>
              {contract.firstParty}
            </h3>
          </div>

          <div className="glass-card p-4">
            <p className="text-gray-400">
              Second Party
            </p>

            <h3>
              {contract.secondParty}
            </h3>
          </div>

          <div className="glass-card p-4">
            <p className="text-gray-400">
              Start Date
            </p>

            <h3>
              {contract.startDate}
            </h3>
          </div>

          <div className="glass-card p-4">
            <p className="text-gray-400">
              End Date
            </p>

            <h3>
              {contract.endDate}
            </h3>
          </div>

          <div className="glass-card p-4">
            <p className="text-gray-400">
              Status
            </p>

            <h3>
              {contract.status}
            </h3>
          </div>

          <div className="glass-card p-4">

            <p className="text-gray-400">
              PDF Document
            </p>

            <h3 className="mb-4">
              {contract.pdf}
            </h3>

            {pdfPreviewUrl && (

              <div className="flex gap-3 flex-wrap">

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
                  download={contract.pdf}
                  className="glass-card px-4 py-2"
                >
                  Download PDF
                </a>

              </div>

            )}

          </div>

        </div>

        {pdfPreviewUrl && (

          <iframe
            src={pdfPreviewUrl}
            width="100%"
            height="700"
            className="mt-5 rounded-lg"
            title="PDF Preview"
          />

        )}

      </div>

    </MainLayout>

  );

}

export default ContractDetails;