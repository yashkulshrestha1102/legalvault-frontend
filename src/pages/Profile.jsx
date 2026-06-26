import { useState, useEffect } from "react";
import MainLayout from "../layouts/MainLayout";

function Profile() {
const [profile, setProfile] = useState({
name: "",
email: "",
phone: "",
role: "",
});

useEffect(() => {
const savedProfile =
JSON.parse(
localStorage.getItem("profile")
) || {
name: "Admin User",
email: "[admin@legalvault.com](mailto:admin@legalvault.com)",
phone: "+91 9876543210",
role: "Legal Manager",
};


setProfile(savedProfile);


}, []);

const handleChange = (e) => {
setProfile({
...profile,
[e.target.name]: e.target.value,
});
};

const saveProfile = () => {
localStorage.setItem(
"profile",
JSON.stringify(profile)
);


alert("Profile Updated Successfully");


};

return ( <MainLayout>


  <div className="bg-slate-800 p-6 rounded-2xl">

    <h1 className="text-3xl font-bold mb-6">
      My Profile
    </h1>

    <div className="flex flex-col items-center mb-8">

      <img
        src="https://i.pravatar.cc/150"
        alt="Profile"
        className="w-32 h-32 rounded-full border-4 border-blue-500"
      />

      <h2 className="text-xl font-semibold mt-4">
        {profile.name}
      </h2>

      <p className="text-gray-400">
        {profile.role}
      </p>

    </div>

    <div className="grid md:grid-cols-2 gap-5">

      <input
        type="text"
        name="name"
        value={profile.name}
        onChange={handleChange}
        placeholder="Full Name"
        className="bg-slate-700 p-3 rounded-xl outline-none"
      />

      <input
        type="email"
        name="email"
        value={profile.email}
        onChange={handleChange}
        placeholder="Email"
        className="bg-slate-700 p-3 rounded-xl outline-none"
      />

      <input
        type="text"
        name="phone"
        value={profile.phone}
        onChange={handleChange}
        placeholder="Phone"
        className="bg-slate-700 p-3 rounded-xl outline-none"
      />

      <input
        type="text"
        name="role"
        value={profile.role}
        onChange={handleChange}
        placeholder="Role"
        className="bg-slate-700 p-3 rounded-xl outline-none"
      />

    </div>

    <button
      onClick={saveProfile}
      className="mt-6 bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl"
    >
      Save Profile
    </button>

  </div>

</MainLayout>


);
}

export default Profile;
