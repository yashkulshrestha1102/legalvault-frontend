import { useLocation } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

function Search() {

const location = useLocation();

const query =
new URLSearchParams(
location.search
).get("q");

const clients =
JSON.parse(
localStorage.getItem("clients")
) || [];

const cases =
JSON.parse(
localStorage.getItem("cases")
) || [];

const documents =
JSON.parse(
localStorage.getItem("documents")
) || [];

const policies =
JSON.parse(
localStorage.getItem("policies")
) || [];

const results = [
...clients,
...cases,
...documents,
...policies,
].filter((item) =>
JSON.stringify(item)
.toLowerCase()
.includes(
query?.toLowerCase()
)
);

return ( <MainLayout>


  <div className="bg-slate-800 p-6 rounded-2xl">

    <h2 className="text-3xl font-bold mb-2">
      Search Results
    </h2>

    <p className="text-gray-400 mb-6">
      Showing results for:
      <span className="text-blue-400 ml-2">
        {query}
      </span>
    </p>

    {results.length === 0 ? (

      <div className="bg-slate-700 p-5 rounded-xl">
        No Results Found
      </div>

    ) : (

      <div className="space-y-4">

        {results.map(
          (item, index) => (
            <div
              key={index}
              className="bg-slate-700 p-4 rounded-xl"
            >
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(
                  item,
                  null,
                  2
                )}
              </pre>
            </div>
          )
        )}

      </div>

    )}

  </div>

</MainLayout>


);
}

export default Search;
