import { signOut } from 'next-auth/react'; 
import { useState } from 'react';

function UserProfile({ session }) {
    const [selectedFiles, setSelectedFiles] = useState([]); 

    const handleFileSelection = (event) => {
        const files = event.target.files; 
        setSelectedFiles(Array.from(files)); // Convert FileList to array 
    };

    const handleUpload = () => {
        const formData = new FormData(); 
        
        console.log(selectedFiles);
        selectedFiles.forEach(file => {
            formData.append('images', file); // Note: 'images' should match backend API
        });
        
        // ... (Use fetch or Axios to send formData to Django endpoint) ... 
        // using fetch API
        fetch('http://localhost:8000/api/upload-images/', { // Adjust your Django endpoint URL
            method: 'POST',
            body: formData,
        }).then(response => {
            if (response.ok) {
            // ... handle successful response ...
            } else { 
            // ... handle error ...
            }
        }); 
        
        // (Axios would be similar but involve installing the Axios library) 
  
    }; 
    

    return (
        <div className="profile-card"> 
            <div className="card-header">
            <h2>{session.user.name} </h2> 
            </div>

            <div className="card-image">
            <img src={session.user.image} alt="Profile Picture" /> 
            </div>

            <div className="card-actions">
            <div className="upload-section">
                <input 
                    type="file" 
                    multiple
                    accept="image/*" 
                    onChange={handleFileSelection}
                /> 
                <button onClick={handleUpload}>Upload</button>
                </div> 
            <button onClick={() => signOut()}>Log Out</button>
            </div>
        </div>
    );
}

export default UserProfile;
