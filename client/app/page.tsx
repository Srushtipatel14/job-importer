type ImportLog = {
  _id: string;
  fileName: string;
  timestamp: string;
  totalFetched: number;
  newJobs: number;
  updatedJobs: number;
  failedJobs: any[];
};

async function getImportLogs(): Promise<ImportLog[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/import-logs`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch import logs");
  }

  return res.json();
}


export default async function Home() {
  const logs = await getImportLogs();
  return (
    <div className="container py-5">
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-white border-bottom">
          <h4 className="mb-0 text-secondary fw-bold text-center">
            Import History
          </h4>
        </div>

        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table align-middle table-hover mb-0">
              <thead className="bg-light text-secondary">
                <tr>
                  <th>No.</th>
                  <th className="ps-4">Feed</th>
                  <th>Timestamp</th>
                  <th>Total</th>
                  <th>New</th>
                  <th>Updated</th>
                  <th>Failed</th>
                </tr>
              </thead>

              <tbody>
                {logs.map((l, i) => (

                  <tr key={l._id}>
                    <td>
                      <span className="text-muted text-center">
                        {i+1}
                      </span>
                    </td>

                    <td className="ps-4 text-break" style={{ maxWidth: 360 }}>
                      <small className="text-muted">{l.fileName}</small>
                    </td>

                    <td>
                      <span className="badge rounded-pill bg-light text-dark border">
                        {l.timestamp}
                      </span>
                    </td>

                    <td>
                      <span className="badge rounded-pill bg-light text-dark border">
                        {l.totalFetched}
                      </span>
                    </td>

                    <td>
                      <span className="badge rounded-pill bg-success-subtle text-success">
                        {l.newJobs}
                      </span>
                    </td>

                    <td>
                      <span className="badge rounded-pill bg-info-subtle text-info">
                        {l.updatedJobs}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`badge rounded-pill ${l.failedJobs?.length
                          ? "bg-danger-subtle text-danger"
                          : "bg-light text-muted border"
                          }`}
                      >
                        {l.failedJobs?.length || 0}
                      </span>
                    </td>
                  </tr>
                ))}

                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted">
                      No import history available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
