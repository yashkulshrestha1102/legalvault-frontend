function SearchBar({ placeholder }) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      className="w-full p-3 rounded-lg bg-slate-700 outline-none"
    />
  );
}

export default SearchBar;