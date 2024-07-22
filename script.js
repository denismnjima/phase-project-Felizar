document.addEventListener('DOMContentLoaded', () => {
    if(localStorage.hasOwnProperty('type')){
        if(localStorage.getItem('type')=='therapist'){
            document.querySelector('.therapist').style.display = 'block'
            fetchTherapistData(localStorage.getItem('email'),localStorage.getItem('key'))
            fetchTherapyRequests();
        }
        else if (localStorage.getItem('type')=='user'){
            document.querySelector('.user').style.display = 'block'
            let currentUser = JSON.parse(localStorage.getItem('user'))
            fetchUserData(currentUser.email,currentUser.password)
            fetchUserRequests(currentUser.email);
            fetchAllTherapists()
        }
    }else
    {
        loadLogin()
    }
});

function loadLogin() {
    document.getElementById('login').style.display='flex'

}
function showTherapistLogin(){
    document.getElementById('login').innerHTML =` <div class="modal-content"><h2 class="title1">Welcome  therapist</h2><div class="login-form"><h3>Login</h3>
        <form  id="therapist-login">
            <label for="ther-email">
                <p>Email</p>
                <input type="email" name="ther-email" id="ther-email" placeholder="e.g. johndoe@abc.com" required>
            </label>
            <label for="ther-pass">
                <p>password</p>
                <input type="password" name="ther-pass" id="ther-pass"  required>
            </label>
            <button>Login</button>
        </form>
    </div>

    <div class="login-form">
        <h3>Sign up</h3>
        <form  id="therapist-sign">
            <label for="ther-name-sign">
                <p>name</p>
                <input type="text" name="ther-name-sign" id="ther-name-sign"  required>
            </label>
            <label for="ther-email-sign">
                <p>Email</p>
                <input type="email" name="ther-email-sign" id="ther-email-sign" placeholder="e.g. johndoe@abc.com" required>
            </label>
            <label for="ther-pass-sign">
                <p>password</p>
                <input type="password" name="ther-pass-sign" id="ther-pass-sign"  required>
            </label>
            <button>Sign up</button>
        </form>
    </div>
    </div>`
    const therapistLoginForm = document.querySelector('#therapist-login')
    therapistLoginForm.addEventListener('submit',(e) => {
        e.preventDefault()
        therapistLogin()
      })
      const therapistSignupForm = document.getElementById('therapist-sign')
      therapistSignupForm.addEventListener('submit',(e)=>{
          e.preventDefault();
          submitNewTherapist()
      })

}
function therapistLogin(){
    
        let email=  document.querySelector('#ther-email').value
        let pass = document.querySelector('#ther-pass').value
    fetchTherapistData(email,pass)
    fetchTherapyRequests();
    
}


function fetchTherapistData(email,password) {
    fetch(`http://localhost:8800/therapists?email=${email}&password=${password}`)
        .then(response => response.json())
        .then(data => {
            if(data.length==0){
                alert('email and password are incorrect')
            }else{
            document.getElementById('login').style.display='none'
            document.querySelector('.therapist').style.display = 'block'
            document.getElementById('therapist-name').innerText = data[0].name;
            document.getElementById('availability-status').innerText = data[0].free;
            document.getElementById('profile-name').value = data[0].name;
            document.getElementById('profile-email').value = data[0].email;
            document.getElementById('profile-bio').value = data[0].bio;
            localStorage.setItem('id',data[0].id)
            localStorage.setItem('email',data[0].email)
            localStorage.setItem('key',data[0].password)
            localStorage.setItem('type','therapist')
            }
        });
}

function fetchTherapyRequests() {
    fetch('http://localhost:8800/requests')
        .then(response => response.json())
        .then(data => {
            const therapistEmail = document.getElementById('profile-email').value;
            const filteredRequests = data.filter(request => request.to === therapistEmail);
            displayRequests(filteredRequests);
            updateStatistics(filteredRequests);
        });
}

function displayRequests(requests) {
    const tableBody = document.getElementById('requests-table');
    tableBody.innerHTML = '';
    requests.forEach(request => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.name}</td>
            <td>${request.age}</td>
            <td>${request.contact}</td>
            <td>${request.date}</td>
            <td>${request.notes}</td>
            <td>${request.status}</td>
            <td><button onclick="openEditRequestModal(${request.id})">Edit</button></td>
        `;
        tableBody.appendChild(row);
    });
}

function updateStatistics(requests) {
    const totalRequests = requests.length;
    const metRequests = requests.filter(request => request.status === 'met').length;
    const notMetRequests = requests.filter(request => request.status === 'not met').length;
    document.getElementById('total-requests').innerText = totalRequests;
    document.getElementById('met-requests').innerText = metRequests;
    document.getElementById('not-met-requests').innerText = notMetRequests;
}

function filterRequests(status) {
    fetch('http://localhost:8800/requests')
        .then(response => response.json())
        .then(data => {
            const therapistEmail = document.getElementById('profile-email').value;
            let filteredRequests = data.filter(request => request.to === therapistEmail);
            if (status !== 'all') {
                filteredRequests = filteredRequests.filter(request => request.status === status);
            }
            displayRequests(filteredRequests);
        });
}

function openProfileModal() {
    document.getElementById('profile-modal').style.display = 'flex';
}

function closeProfileModal() {
    document.getElementById('profile-modal').style.display = 'none';
}

function openEditRequestModal(requestId) {
    fetch(`http://localhost:8800/requests/${requestId}`)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            document.getElementById('request-status').value = data.status;
            document.getElementById('request-notes').value = data.notes;
            document.getElementById('edit-request-form').dataset.id = data.id;
            document.getElementById('edit-request-modal').style.display = 'flex';
        });
}

function closeEditRequestModal() {
    document.getElementById('edit-request-modal').style.display = 'none';
}

function updateProfile(event) {
    event.preventDefault();
    const name = document.getElementById('profile-name').value;
    const email = document.getElementById('profile-email').value;
    const bio = document.getElementById('profile-bio').value;
    
    fetch('http://localhost:8800/therapists/4f6c', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, bio })
    }).then(response => {
        if (response.ok) {
            alert('Profile updated successfully');
            closeProfileModal();
            fetchTherapistData();
        } else {
            alert('Failed to update profile');
        }
    });
}

function updateRequest(event) {
    event.preventDefault();
    const requestId = document.getElementById('edit-request-form').dataset.id;
    const status = document.getElementById('request-status').value;
    const notes = document.getElementById('request-notes').value;
    
    fetch(`http://localhost:8800/requests/${requestId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status, notes })
    }).then(response => {
        if (response.ok) {
            alert('Request updated successfully');
            closeEditRequestModal();
            fetchTherapyRequests();
        } else {
            alert('Failed to update request');
        }
    });
}

function toggleAvailability() {
    const currentStatus = document.getElementById('availability-status').innerText;
    const newStatus = currentStatus === 'available' ? 'not available' : 'available';
    const userid = localStorage.getItem('id')
    fetch(`http://localhost:8800/therapists/${userid}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ free: newStatus })
    }).then(response => {
        if (response.ok) {
            document.getElementById('availability-status').innerText = newStatus;
        } else {
            alert('Failed to update availability');
        }
    });
}
function logout(){
    localStorage.removeItem('type')
    localStorage.removeItem('id')
    localStorage.removeItem('email')
    localStorage.removeItem('key')
    localStorage.removeItem('user')
    window.location.reload()
}

// Users
function showUserLogin(){
    document.getElementById('login').innerHTML =` <div class="modal-content"><h2 class="title1">Welcome  to Felizar</h2><div class="login-form"><h3>Login</h3>
    <form  id="user-login">
        <label for="user-email">
            <p>Email</p>
            <input type="email" name="user-email" id="user-email-login" placeholder="e.g. johndoe@abc.com" required>
        </label>
        <label for="user-pass">
            <p>password</p>
            <input type="password" name="user-pass" id="user-pass"  required>
        </label>
        <button>Login</button>
    </form>
</div>

<div class="login-form">
    <h3>Sign up</h3>
    <form  id="user-sign">
        <label for="user-name-sign">
            <p>name</p>
            <input type="text" name="user-name-sign" id="user-name-sign"  required>
        </label>
        <label for="user-email-sign">
            <p>Email</p>
            <input type="email" name="user-email-sign" id="user-email-sign" placeholder="e.g. johndoe@abc.com" required>
        </label>
        <label for="user-pass-sign">
            <p>password</p>
            <input type="password" name="user-pass-sign" id="user-pass-sign"  required>
        </label>
        <button type="submit">Sign up</button>
    </form>
</div>
</div>`
const userLoginForm = document.querySelector('#user-login')
userLoginForm.addEventListener('submit',(e) => {
    e.preventDefault()
    userLogin()
  })

  const userSignupForm = document.getElementById('user-sign')
  userSignupForm.addEventListener('submit',(e)=>{
      e.preventDefault();
      submitNewuser()
  })
}

function userLogin(){
    
    let email=  document.querySelector('#user-email-login').value
    let pass = document.querySelector('#user-pass').value
    console.log(email)
    fetchUserData(email,pass)
    fetchUserRequests(email);
    fetchAllTherapists()

}
function fetchUserData(email,password) {
    fetch(`http://localhost:8800/users?email=${email}&password=${password}`)
        .then(response =>{
            if(!response.ok) throw new Error('request failed')
              return response.json()
            }
            )
        .then(data => {
            if(data.length==0){
                alert('email and password are incorrect')
            }else{
            document.getElementById('login').style.display='none'
            document.querySelector('.user').style.display = 'block'
            document.getElementById('user-name').value = data[0].name;
            document.getElementById('user-email').value = data[0].email;
            document.getElementById('user-password').value = data[0].password;
            document.getElementById('user-age').value = data[0].age;
            document.getElementById('user-gender').value = data[0].gender;
            localStorage.setItem('user',JSON.stringify(data[0]))
            localStorage.setItem('type','user')
            }
        })
        .catch(err=>console.log(err.message))
}
const requestTable = document.getElementById('request-table');
function fetchUserRequests(email){
    fetch(`http://localhost:8800/requests?email=${email}`)
         .then(response => response.json())
        .then(data => {
            data.forEach(request => {
                const requestRow = document.createElement('tr');
                requestRow.innerHTML = `
                    <td class="border p-2">${request.to}</td>
                    <td class="border p-2">${request.status}</td>
                    <td class="border p-2">${request.notes}</td>
                 `;
                 requestTable.appendChild(requestRow);
            });
        });
}
function userProfileModal() {
    document.querySelector('#user-modal').style.display = 'flex';
}

function closeUserModal() {
    document.querySelector('#user-modal').style.display = 'none';
}

 // Handle user form submission
const userForm = document.getElementById('user-form');
userForm.addEventListener('submit', (e) => {
        e.preventDefault();
        userUpdateProfile()
})

function userUpdateProfile(){
    let userid =localStorage.getItem('id')
        const updatedUser = {
            name: document.getElementById('user-name').value,
            email: document.getElementById('user-email').value,
            password: document.getElementById('user-password').value,
            age: document.getElementById('user-age').value,
            gender: document.getElementById('user-gender').value,
        };
        fetch(`http://localhost:8800/users/${userid}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUser),
        })
        .then(response => response.json())
        .then(data => {
            console.log(data)
        });
    };
function fetchAllTherapists(){
    const therapistList = document.getElementById('therapist-list');
    const allTherapistList = document.getElementById('all-therapist-list');

    fetch('http://localhost:8800/therapists')
    .then(response => response.json())
    .then(data => {
        data.forEach(therapist => {
            const therapistCard = document.createElement('div');
            therapistCard.classList.add('therapist-card');
            therapistCard.innerHTML = `
                <img src="assets/avatar.jpg" alt="Profile Icon">
                <h4>${therapist.name}</h4>
                <p>${therapist.free}</p>
            `;
            therapistCard.addEventListener('click', () => showTherapistModal(therapist));
            if (therapist.free == 'available') {
                therapistList.appendChild(therapistCard);
            }else{
            allTherapistList.appendChild(therapistCard);
            }
        });
    });
}


const therapistModal = document.getElementById('therapist-modal');
    // Show therapist modal
 function showTherapistModal(therapist) {
    therapistModal.style.display='flex'
    document.getElementById('therapist-profname').textContent = therapist.name;
    document.getElementById('therapist-email').textContent = therapist.email;
    document.getElementById('therapist-bio').textContent = therapist.bio;
    document.getElementById('therapist-availability').textContent = therapist.free;
    document.getElementById('request-session').onclick = () => requestSession(therapist);
    }

function closeTherModal(){
    therapistModal.style.display='none'
}
function requestSession(therapist) {
   currentUser = JSON.parse(localStorage.getItem('user'))
   let uid = Math.floor(Math.random()*145579)
    const requestData = {
        id:uid.toString(),
        name: currentUser.name,
        age: currentUser.age,
        contact:currentUser.email,
        gender: currentUser.gender,
        email: currentUser.email,
        to: therapist.email,
        date: new Date().toISOString(),
        status: 'not met',
        notes: '',
    };
    fetch('http://localhost:8800/requests', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
    })
    .then(response => response.json())
    .then(data => {
        therapistModal.classList.add('hidden');
        const requestRow = document.createElement('tr');
        requestRow.innerHTML = `
            <td class="border p-2">${data.to}</td>
            <td class="border p-2">${data.status}</td>
            <td class="border p-2">${data.notes}</td>
        `;
        requestTable.appendChild(requestRow);
    });
}

function submitNewuser(){
    // Gather the form data
    const data = {
        name: document.getElementById('user-name-sign').value,
        email: document.getElementById('user-email-sign').value,
        password: document.getElementById('user-pass-sign').value,
        age:'',
        gender:''
    };

    fetch('http://localhost:8800/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        alert('account created successfully!, please login')
        document.getElementById('user-name-sign').value=''
        document.getElementById('user-email-sign').value=''
        document.getElementById('user-pass-sign').value=''
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


function submitNewTherapist(){
    // Gather the form data
    const data = {
        name: document.getElementById('ther-name-sign').value,
        email: document.getElementById('ther-email-sign').value,
        password: document.getElementById('ther-pass-sign').value,
        bio:'',
        free:'not available'
    };

    fetch('http://localhost:8800/therapists', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        alert('account created successfully!, please login')
        document.getElementById('ther-name-sign').value=''
        document.getElementById('ther-email-sign').value=''
        document.getElementById('ther-pass-sign').value=''
    })
    .catch(error => {
        console.error('Error:', error);
    });
}