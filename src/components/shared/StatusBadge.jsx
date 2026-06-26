function StatusBadge({ status }) {
  const styles = {
    Active: "bg-green-600",
    Open: "bg-blue-600",
    Pending: "bg-yellow-600",
    Closed: "bg-red-600",
    Inactive: "bg-red-600",
  };

  return (
    <span
      className={`${styles[status]} px-3 py-1 rounded-full text-sm`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;