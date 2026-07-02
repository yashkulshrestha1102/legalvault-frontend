import MainLayout from "../layouts/MainLayout";
import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";

function SearchResults() {
  const location = useLocation();

  const query =
    new URLSearchParams(location.search).get("q") || "";

  const clients =
    JSON.parse(localStorage.getItem("clients")) || [];

  const cases =
    JSON.parse(localStorage.getItem("cases")) || [];

  const documents =
    JSON.parse(localStorage.getItem("documents")) || [];

  const policies =
    JSON.parse(localStorage.getItem("policies")) || [];

  const results = [
    ...clients.map((item) => ({
      type: "Client",
      title: item.name,
    })),

    ...cases.map((item) => ({
      type: "Case",
      title: item.caseNo,
    })),

    ...documents.map((item) => ({
      type: "Document",
      title: item.title,
    })),

    ...policies.map((item) => ({
      type: "Policy",
      title: item.title,
    })),
  ].filter((item) =>
    item.title
      ?.toLowerCase()
      .includes(query.toLowerCase())
  );

  const [searchTerm, setSearchTerm] =
  useState("");

  const navigate = useNavigate();

  return (
    <MainLayout>

      <h1 className="text-3xl font-bold mb-6">
        Search Results
      </h1>

      <div className="bg-slate-800 p-6 rounded-xl">

        <p className="mb-4 text-gray-400">
          Found {results.length} results for "{query}"
        </p>

        <div className="space-y-3">

          {results.map((item, index) => (
            <div
              key={index}
              className="bg-slate-700 p-4 rounded-lg"
            >
              <p className="text-blue-400 text-sm">
                {item.type}
              </p>

              <h3 className="font-semibold">
                {item.title}
              </h3>
            </div>
          ))}

        </div>

      </div>

    </MainLayout>
  );
}

export default SearchResults;