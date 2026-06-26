function PageHeader({ title, buttonText }) {
  return (
    <div className="flex justify-between mb-6">

      <h1 className="text-3xl font-bold">
        {title}
      </h1>

      {buttonText && (
        <button className="bg-blue-600 px-4 py-2 rounded-lg">
          {buttonText}
        </button>
      )}

    </div>
  );
}

export default PageHeader;