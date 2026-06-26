function DataTable({
  columns,
  data
}) {
  return (
    <div className="overflow-x-auto">

      <table className="w-full">

        <thead>

          <tr className="border-b border-slate-700">

            {columns.map((col) => (
              <th
                key={col}
                className="text-left p-3"
              >
                {col}
              </th>
            ))}

          </tr>

        </thead>

        <tbody>

          {data.map((row,index)=>(
            <tr
              key={index}
              className="border-b border-slate-800 hover:bg-slate-700"
            >
              {Object.values(row).map((value,i)=>(
                <td
                  key={i}
                  className="p-3"
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}

        </tbody>

      </table>

    </div>
  );
}

export default DataTable;