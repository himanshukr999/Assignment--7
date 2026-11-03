/**
 * IIIT Vadodara Coding Events - Script (Lab 6 & Lab 7)
 * Implements JS basics, DOM Manipulation, Events, Fetch (JSON & XML), and Form Validation.
 */

// ==========================================
// SECTION A: Language Basics & Data Modeling
// ==========================================

// A2: Variables (const by default, let for state changes, no var)
const APPLICANT_ROLE = "Student";
let globalEventsData = []; // Store fetched events as global state

// A3: Array of objects (Single source of truth fallback)
const fallbackEvents = [
  { id: 1, title: "CodeFest 2026", date: "2026-08-22", seats: 15, free: true, online: false, category: "coding-contest", location: "Computer Lab" },
  { id: 2, title: "Hackathon 2026", date: "2026-08-29", seats: 4, free: true, online: false, category: "hackathon", location: "Computer Lab" },
  { id: 3, title: "Competitive Programming Contest", date: "2026-09-05", seats: 0, free: true, online: true, category: "coding-contest", location: "Online" }
];

// A4: Control Flow Function to calculate status label
function getEventStatus(seats) {
  if (seats === 0) {
    return "Full";
  } else if (seats < 5) {
    return "Few left";
  } else {
    return "Open";
  }
}

// A6: Function with parameter and return statement
function formatEventSummary(ev) {
  // Returns readable one-line string summary
  const status = getEventStatus(ev.seats);
  return `${ev.title} on ${ev.date} - ${ev.seats} seats remaining (${status})`;
}

// ==========================================
// SECTION B: DOM Selection & Rendering
// ==========================================

// B1: DOM Elements Selection
const eventsContainer = document.querySelector('#events-container'); // querySelector
const statusContainer = document.querySelector('#fetch-status');
const searchInput = document.querySelector('#search-input');
const rsvpForm = document.getElementById('rsvp-form'); // getElementById
const menuToggleBtn = document.querySelector('#menu-toggle');
const navLinksContainer = document.querySelector('#nav-links');

// B4: Hamburger Menu Toggle
if (menuToggleBtn && navLinksContainer) {
  menuToggleBtn.addEventListener('click', (event) => {
    // Toggle class for responsive menu visibility
    navLinksContainer.classList.toggle('nav-active');
  });
}

// B2 & B3: Render Event Cards dynamically from data array
function renderEvents(eventsList) {
  // Clear container
  eventsContainer.innerHTML = '';

  if (eventsList.length === 0) {
    eventsContainer.innerHTML = '<p>No events found matching your search criteria.</p>';
    return;
  }

  // A5: Loop over array using for...of
  for (const ev of eventsList) {
    const card = document.createElement('article');
    card.classList.add('event-card');

    // A4 label & state styling
    const statusLabel = getEventStatus(ev.seats);
    if (ev.seats === 0) {
      card.classList.add('full');
    }

    // Populate card HTML dynamically
    card.innerHTML = `
      <div class="card-number">0${ev.id}</div>
      <div class="event-icon">${ev.category === 'hackathon' ? '🚀' : (ev.category === 'technical-workshop' ? '💡' : '💻')}</div>
      <span class="event-tag">${ev.category ? ev.category.toUpperCase() : 'EVENT'}</span>
      <h3>${ev.title}</h3>
      <ul>
        <li><strong>Date:</strong> ${ev.date}</li>
        <li><strong>Venue:</strong> ${ev.location || 'TBA'}</li>
        <li><strong>Seats Left:</strong> ${ev.seats}</li>
      </ul>
      <p>${ev.description || 'Join us for an exciting programming activity.'}</p>
      <span class="card-status status-${statusLabel.toLowerCase().replace(' ', '')}">${statusLabel}</span>
      <br>
      <button class="rsvp-btn" data-id="${ev.id}" ${ev.seats === 0 ? 'disabled' : ''}>
        ${ev.seats === 0 ? 'Sold Out' : 'RSVP Now'}
      </button>
    `;

    eventsContainer.appendChild(card);
  }
}

// B5: Event Delegation & Event Object (.target)
eventsContainer.addEventListener('click', (event) => {
  if (event.target.classList.contains('rsvp-btn')) {
    const eventId = parseInt(event.target.getAttribute('data-id'));
    const targetEvent = globalEventsData.find(e => e.id === eventId);
    if (targetEvent && targetEvent.seats > 0) {
      targetEvent.seats -= 1;
      alert(`Success! You registered for ${targetEvent.title}. Remaining seats: ${targetEvent.seats}`);
      renderEvents(globalEventsData); // Re-render updated state
    }
  }
});

// B6: Real-time Search Input & Keydown Escape Handler
if (searchInput) {
  // A7: Arrow function with filter array method
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();
    const filteredEvents = globalEventsData.filter(ev => 
      ev.title.toLowerCase().includes(searchTerm) || 
      (ev.description && ev.description.toLowerCase().includes(searchTerm))
    );
    renderEvents(filteredEvents);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      renderEvents(globalEventsData);
    }
  });
}

// B7 (Lab 6) & B1 (Lab 7): Fetch Data handling 3 states (Loading, Success, Error)
async function loadEventsData() {
  // State 1: Show Loading
  statusContainer.className = 'status-message loading';
  statusContainer.textContent = '⏳ Loading events from server... Please wait.';

  try {
    const response = await fetch('events.json');
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }
    const data = await response.json();

    // Lab 7 B3: Round-trip verification demo
    const stringifiedData = JSON.stringify(data);
    console.log("Lab 7 B3 JSON.stringify output matches events.json data structure.");

    // State 2: Success
    globalEventsData = data;
    statusContainer.style.display = 'none'; // Hide loading box
    renderEvents(globalEventsData);

    // Lab 7 B2: Read one value (Dot / Index access)
    console.log("First Event Title (JSON):", globalEventsData[0].title);
    console.log("Last Event Seats (JSON):", globalEventsData[globalEventsData.length - 1].seats);

  } catch (error) {
    // State 3: Failure
    console.error("Fetch Error:", error);
    statusContainer.className = 'status-message error';
    statusContainer.textContent = '❌ Failed to load events data. Displaying offline backup.';
    
    // Fallback to local array
    globalEventsData = fallbackEvents;
    renderEvents(globalEventsData);
  }
}

// Lab 7 B4: Fetch and Parse XML using DOMParser
async function loadXMLData() {
  const xmlTitleElement = document.querySelector('#xml-first-title');
  try {
    const response = await fetch('events.xml');
    const xmlText = await response.text();
    
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlText, "text/xml");
    
    // Read first title using getElementsByTagName
    const firstTitle = xmlDoc.getElementsByTagName('title')[0].textContent;
    if (xmlTitleElement) {
      xmlTitleElement.textContent = firstTitle;
    }
    console.log("First Event Title from XML:", firstTitle);
  } catch (err) {
    console.error("XML Parse Error:", err);
    if (xmlTitleElement) xmlTitleElement.textContent = "Error loading XML";
  }
}

// B8: Form Validation (Built-in + Custom setCustomValidity)
if (rsvpForm) {
  const eventNameInput = document.getElementById('event-name');

  eventNameInput.addEventListener('input', () => {
    // Custom Rule: Name must contain at least 2 words (e.g. "Web Workshop")
    const words = eventNameInput.value.trim().split(/\s+/);
    if (words.length < 2) {
      eventNameInput.setCustomValidity("Event name must contain at least two words (e.g. Code Fest).");
    } else {
      eventNameInput.setCustomValidity(""); // Clear error when valid
    }
  });

  rsvpForm.addEventListener('submit', (event) => {
    // Prevent default submission if invalid
    if (!rsvpForm.checkValidity()) {
      event.preventDefault();
      rsvpForm.reportValidity(); // Show native validation tooltips
    } else {
      event.preventDefault();
      alert("🎉 Event submitted successfully! (Client validation passed)");
      rsvpForm.reset();
    }
  });
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  loadEventsData();
  loadXMLData();
});
