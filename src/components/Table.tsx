export function Table({ columns, data }: { 
  columns: string[];
  data: string[][];
}) {
  return (
    <table className="w-full border-collapse border">
      <thead>
        <tr>
          {columns.map((col, i) => (
            <th key={i} className="border p-2 bg-gray-100">
              {col}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, i) => (
          <tr key={i}>
            {row.map((cell, j) => (
              <td key={j} className="border p-2">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
