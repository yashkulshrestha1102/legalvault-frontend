import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import MainLayout from "../layouts/MainLayout";
import AddRegistrationModal from "../components/modals/AddRegistrationModal";
import { useNavigate } from "react-router-dom";
import AddContractModal from "../components/modals/AddContractModal";


function ClientDetails() {

const { id } = useParams();
const [selectedFolder,setSelectedFolder] =
useState(null);
const [client,setClient] = useState(null);
// only for checking
console.log("Route ID =", id);

const [openModal,setOpenModal] = useState(false);
const navigate = useNavigate();
const [registrations,setRegistrations] = useState([]);

const [editRegistration, setEditRegistration] =
useState(null);


// contract

const [contracts, setContracts] = useState([]);

const [openContractModal, setOpenContractModal] =
  useState(false);

const [editContract, setEditContract] =
  useState(null);

// **********

 useEffect(() => {

const savedRegistrations =JSON.parse(
localStorage.getItem(
`registrations_${id}`
)
) || [];

setRegistrations(
savedRegistrations
);

}, [id]);


const saveRegistration = (
registrationData
) => {

if(editRegistration){

const updated =
registrations.map((item)=>

item.id ===
editRegistration.id

? {
...registrationData,
id:item.id
}

: item
);

setRegistrations(updated);

localStorage.setItem(
`registrations_${id}`,
JSON.stringify(updated)
);

setEditRegistration(null);

return;
}

const newRegistration = {

...registrationData,

id: Date.now(),

};

const updated = [

...registrations,
newRegistration,

];

setRegistrations(updated);

localStorage.setItem(
`registrations_${id}`,
JSON.stringify(updated)
);

};

const deleteRegistration = (
registrationId
) => {

const confirmDelete =
window.confirm(
"Delete Registration?"
);

if(!confirmDelete)
return;

const updated =
registrations.filter(

(item)=>

item.id !==
registrationId

);

setRegistrations(updated);

localStorage.setItem(
`registrations_${id}`,
JSON.stringify(updated)
);

};

const handleEdit = (
registration
) => {

setEditRegistration(
registration
);

setOpenModal(true);

};


const getDaysLeft = (endDate) => {
  const today = new Date();
  const expiry = new Date(endDate);

  const diff =
    expiry.getTime() - today.getTime();

  return Math.ceil(
    diff / (1000 * 60 * 60 * 24)
  );
};

// contract
useEffect(() => {

  const savedContracts =
    JSON.parse(
      localStorage.getItem(
        `contracts_${id}`
      )
    ) || [];

  setContracts(savedContracts);

}, [id]);


const deleteContract = (
  contractId
) => {

  const confirmDelete =
    window.confirm(
      "Delete Contract?"
    );

  if (!confirmDelete) return;

  const updated =
    contracts.filter(
      (item) =>
        item.id !== contractId
    );

  setContracts(updated);

  localStorage.setItem(
    `contracts_${id}`,
    JSON.stringify(updated)
  );
};

const handleEditContract = (
  contract
) => {

  setEditContract(contract);

  setOpenContractModal(true);
};

const saveContract = (contractData) => {

  if (editContract) {

    const updated = contracts.map((item) =>
      item.id === editContract.id
        ? {
            ...contractData,
            id: item.id,
          }
        : item
    );

    setContracts(updated);

    localStorage.setItem(
      `contracts_${id}`,
      JSON.stringify(updated)
    );

    setEditContract(null);

    return;
  }

  const newContract = {
    ...contractData,
    id: Date.now(),
  };

  const updated = [
    ...contracts,
    newContract,
  ];

  setContracts(updated);

  localStorage.setItem(
    `contracts_${id}`,
    JSON.stringify(updated)
  );
};

// ******

useEffect(() => {



const clients =
JSON.parse(
localStorage.getItem("clients")
) || [];

const selectedClient =
clients.find(
(client) =>
String(client.id) === id
);

setClient(selectedClient);

}, [id]);

if(!client){



 
return ( <MainLayout>

<div className="glass-card p-6">
Client Not Found
</div>
</MainLayout>
);
}

const folders = [

{
label:"Registrations / Certifications",
value:"registrations",
},

{
label:"Contracts",
value:"contracts",
},

{
label:"Policies",
value:"policies",
},

{
label:"Corporate Secretariat",
value:"corporateSecretariat",
},

{
label:"HR",
value:"hr",
},

{
label:"GST",
value:"gst",
},

{
label:"Income Tax",
value:"incomeTax",
},

{
label:"Financials",
value:"financials",
},

];

return (

<MainLayout>

<div className="space-y-6">

{/* Client Header */}

<div className="glass p-6">

<h1 className="text-3xl font-bold mb-4">
{client.name}
</h1>

<div className="grid md:grid-cols-5 gap-4">

<div className="glass-card p-4">
<p className="text-gray-400 text-sm">
Contact Person
</p>

<h3 className="font-semibold mt-1">
{client.contactPerson || "-"}
</h3>
</div>

<div className="glass-card p-4">
<p className="text-gray-400 text-sm">
Email
</p>

<h3 className="font-semibold mt-1">
{client.email}
</h3>
</div>

<div className="glass-card p-4">
<p className="text-gray-400 text-sm">
Mobile
</p>

<h3 className="font-semibold mt-1">
{client.phone}
</h3>
</div>

<div className="glass-card p-4">
<p className="text-gray-400 text-sm">
Onboarding Date
</p>

<h3 className="font-semibold mt-1">
{client.onboardingDate || "-"}
</h3>
</div>

<div className="glass-card p-4">
<p className="text-gray-400 text-sm">
Status
</p>

<h3 className="font-semibold mt-1">
{client.status}
</h3>
</div>

</div>

</div>


<div className="grid md:grid-cols-4 gap-5">

{folders.map((folder)=>(

<div
key={folder.value}
onClick={() =>
setSelectedFolder(folder.value)
}
className="
glass-card
p-6
cursor-pointer
hover:scale-105
transition-all
duration-300
"
>

<div className="text-5xl mb-4">
📁
</div>

<h3 className="font-semibold">
{folder.label}
</h3>

</div>

))}

</div>





{/* Registrations */}

{selectedFolder === "registrations" && (

<div className="glass p-6">

<div className="flex justify-between items-center mb-6">



<button
onClick={()=>{
setEditRegistration(null);
setOpenModal(true);
}}
className="
glass-card
px-5
py-3
blue-glow
"
>
+ Add Registration
</button>

</div>

<div className="overflow-x-auto">

<table className="w-full">

  <thead>
  <tr className="border-b border-white/10">

    <th className="p-4 text-left">
      Type
    </th>

    <th className="p-4 text-left">
      Registration Name
    </th>

    <th className="p-4 text-left">
      Start Date
    </th>

    <th className="p-4 text-left">
      End Date
    </th>

    <th className="p-4 text-left">
      Status
    </th>

    <th className="p-4 text-left">
      PDF
    </th>

    <th className="p-4 text-left">
      Actions
    </th>

  </tr>
</thead>

  <tbody>

{registrations.map((item) => (

<tr key={item.id}>

<td className="p-4">
  {item.category}
</td>

<td className="p-4">
  {item.registrationName}
</td>

<td className="p-4">
  {item.startDate}
</td>

<td className="p-4">
  {item.endDate}
</td>

<td className="p-4">

  {getDaysLeft(item.endDate) <= 0 ? (

    <span className="text-red-400">
      Expired
    </span>

  ) : getDaysLeft(item.endDate) <= 30 ? (

    <span className="text-yellow-400">
      Expiring Soon
    </span>

  ) : (

    <span className="text-green-400">
      Valid
    </span>

  )}

</td>

<td className="p-4">
  {item.pdf || "-"} 
</td>

<td className="p-4 flex gap-3">

  <button
    onClick={() =>
      navigate(
        `/clients/${id}/registration/${item.id}`
      )
    }
    className="text-cyan-400"
  >
    View
  </button>

  <button
    onClick={() => handleEdit(item)}
    className="text-yellow-400"
  >
    Edit
  </button>

  <button
    onClick={() =>
      deleteRegistration(item.id)
    }
    className="text-red-400"
  >
    Delete
  </button>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)}





{/* contract */}

{selectedFolder === "contracts" && (

<div className="glass p-6">

<div className="flex justify-between items-center mb-6">

<button
onClick={()=>{
setEditContract(null);
setOpenContractModal(true);
}}
className="
glass-card
px-5
py-3
blue-glow
"
>
+ Add Contract
</button>

</div>

<div className="overflow-x-auto">

<table className="w-full">

<thead>

<tr className="border-b border-white/10">

<th className="p-4 text-left">
Type
</th>

<th className="p-4 text-left">
Contract Name
</th>

<th className="p-4 text-left">
First Party
</th>

<th className="p-4 text-left">
Second Party
</th>

<th className="p-4 text-left">
Start Date
</th>

<th className="p-4 text-left">
End Date
</th>

<th className="p-4 text-left">
PDF
</th>

<th className="p-4 text-left">
Actions
</th>

</tr>

</thead>

<tbody>

{contracts.map((item)=>(

<tr key={item.id}>

<td className="p-4">
{item.contractType}
</td>

<td className="p-4">
{item.contractName}
</td>

<td className="p-4">
{item.firstParty}
</td>

<td className="p-4">
{item.secondParty}
</td>

<td className="p-4">
{item.startDate}
</td>

<td className="p-4">
{item.endDate}
</td>

<td className="p-4">
{item.pdf || "-"}
</td>

<td className="p-4 flex gap-3">

<button
className="text-cyan-400"
onClick={() =>
navigate(
`/clients/${id}/contract/${item.id}`
)
}
>
View
</button>

<button
onClick={() =>
handleEditContract(item)
}
className="text-yellow-400"
>
Edit
</button>

<button
onClick={() =>
deleteContract(item.id)
}
className="text-red-400"
>
Delete
</button>

</td>

</tr>

))}

</tbody>

</table>

</div>

</div>

)}
{/* ************** */}

</div>
<AddRegistrationModal

open={openModal}

onClose={()=>{
setOpenModal(false);
setEditRegistration(null);
}}

onSave={saveRegistration}

editData={editRegistration}

/>


{/* contract */}

<AddContractModal

open={openContractModal}

onClose={()=>{
setOpenContractModal(false);
setEditContract(null);
}}

onSave={saveContract}

editData={editContract}

/>
{/* ********** */}
</MainLayout>

);
}

export default ClientDetails;
