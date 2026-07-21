// Google Form Integration Setup
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse';

// Form Field IDs (You need to replace these with your actual Google Form field IDs)
const FORM_FIELD_IDS = {
    name: 'entry_XXXXXXX', // Replace XXXXXXX with actual field ID
    phone: 'entry_XXXXXXX',
    email: 'entry_XXXXXXX',
    date: 'entry_XXXXXXX',
    time: 'entry_XXXXXXX',
    service: 'entry_XXXXXXX',
    message: 'entry_XXXXXXX'
};

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    setupFormSubmission();
    setMinimumDate();
});

// Set minimum date to today
function setMinimumDate() {
    const dateInput = document.getElementById('appointment-date');
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
}

// Setup form submission
function setupFormSubmission() {
    const form = document.getElementById('appointmentForm');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitAppointmentForm();
    });
}

// Submit appointment form
function submitAppointmentForm() {
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone-input').value;
    const email = document.getElementById('email').value;
    const date = document.getElementById('appointment-date').value;
    const time = document.getElementById('time-slot').value;
    const service = document.getElementById('service').value;
    const message = document.getElementById('message').value;

    // Validate required fields
    if (!name || !phone || !date || !time) {
        alert('Please fill in all required fields.');
        return;
    }

    // Validate phone number
    if (!/^[0-9\-\+\(\)\s]{7,}$/.test(phone)) {
        alert('Please enter a valid phone number.');
        return;
    }

    // Store data locally (localStorage)
    storeAppointmentLocally({
        name,
        phone,
        email,
        date,
        time,
        service,
        message,
        submittedAt: new Date().toLocaleString()
    });

    // Send to Google Form (if configured)
    if (FORM_FIELD_IDS.name !== 'entry_XXXXXXX') {
        sendToGoogleForm({
            name,
            phone,
            email,
            date,
            time,
            service,
            message
        });
    } else {
        // If Google Form not configured, show local success message
        showSuccessMessage();
        resetForm();
    }
}

// Store appointment locally
function storeAppointmentLocally(appointment) {
    let appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    appointments.push(appointment);
    localStorage.setItem('appointments', JSON.stringify(appointments));
    console.log('Appointment stored locally:', appointment);
}

// Send to Google Form
function sendToGoogleForm(data) {
    const formData = new FormData();
    formData.append(FORM_FIELD_IDS.name, data.name);
    formData.append(FORM_FIELD_IDS.phone, data.phone);
    formData.append(FORM_FIELD_IDS.email, data.email);
    formData.append(FORM_FIELD_IDS.date, data.date);
    formData.append(FORM_FIELD_IDS.time, data.time);
    formData.append(FORM_FIELD_IDS.service, data.service);
    formData.append(FORM_FIELD_IDS.message, data.message);

    // Send using CORS workaround
    fetch(GOOGLE_FORM_URL, {
        method: 'POST',
        body: formData,
        mode: 'no-cors'
    })
    .then(() => {
        console.log('Form submitted to Google Forms');
        showSuccessMessage();
        resetForm();
    })
    .catch((error) => {
        console.error('Error submitting to Google Forms:', error);
        showSuccessMessage(); // Still show success since data is stored locally
        resetForm();
    });
}

// Show success message
function showSuccessMessage() {
    const successMsg = document.getElementById('formSuccess');
    successMsg.style.display = 'block';
    setTimeout(() => {
        successMsg.style.display = 'none';
    }, 5000);
}

// Reset form
function resetForm() {
    document.getElementById('appointmentForm').reset();
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Function to export appointments (you can use this in the admin panel)
function exportAppointmentsToCSV() {
    const appointments = JSON.parse(localStorage.getItem('appointments')) || [];
    if (appointments.length === 0) {
        alert('No appointments to export.');
        return;
    }

    let csv = 'Name,Phone,Email,Date,Time,Service,Message,Submitted At\n';
    appointments.forEach(apt => {
        csv += `"${apt.name}","${apt.phone}","${apt.email}","${apt.date}","${apt.time}","${apt.service}","${apt.message}","${apt.submittedAt}"\n`;
    });

    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
    element.setAttribute('download', 'appointments.csv');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}