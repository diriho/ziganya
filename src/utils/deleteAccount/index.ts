// function DeleteAccountButton() {
//   const [isConfirming, setIsConfirming] = useState(false);

//   const handleDelete = async () => {
//     // This is where the Firebase deletion logic would go
//     // Example:
//     // try {
//     //   const user = auth.currentUser;
//     //   await user?.delete();
//     //   window.parent.postMessage({ type: "OPEN_EXTERNAL_URL", data: { url: "/login" } }, "*");
//     // } catch (error) {
//     //   console.error("Failed to delete account", error);
//     // }
//     console.log("Account deletion requested (Firebase mock)");
//     alert("In a real app, this would delete your account from Firebase. (Requires 'firebase' package and configuration)");
//     setIsConfirming(false);
//   };