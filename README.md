# To Do List Manager

A modern **client-side To Do List Manager** built using **HTML, CSS, and vanilla JavaScript**. The application helps users manage tasks efficiently with a calendar view, daily repeating tasks, priority management, and real-time analytics — all without any backend or frameworks.

---

## Overview

This is a **single-page frontend application** designed to improve personal productivity. Users can create, edit, complete, and organize tasks while visually tracking progress through interactive charts.

All data is stored locally in the browser using **LocalStorage**, making the app fast, simple, and easy to use.

---

## Features

###  Task Management

* Create, edit, and delete tasks
* Optional task descriptions
* Set task priority (Low, Medium, High)
* Optional due dates
* Mark tasks as completed
* Filter tasks:

  * All
  * Active
  * Completed

###  Daily Tasks

* Add up to **5 daily repeating tasks**
* Daily tasks automatically reset each day
* Track daily completion progress

###  Calendar

* Monthly calendar view
* Navigate between months
* Highlights the current day

###  Analytics & Insights

* Doughnut chart showing completed vs pending tasks
* Bar chart showing tasks completed over the last 7 days
* Charts update automatically on task changes

###  Persistent Storage

* Uses browser **LocalStorage API**
* Tasks remain saved after page refresh

###  Responsive Design

* Optimized for desktop, tablet, and mobile devices
* Modern dark UI with smooth animations

---

## Technologies Used

* HTML5
* CSS3 (Custom Dark UI, Responsive Design)
* JavaScript (ES6+)
* Chart.js
* Web Storage API (LocalStorage)

---

## Project Structure

```text
├── index.html    # Application layout and structure
├── style.css     # Styling, animations, and responsive design
├── script.js     # Application logic, state management, analytics
```

---

## Setup & Usage

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/todo-list-manager.git
   ```

   **OR** download the project as a `.zip` file and extract it.

2. Open `index.html` in any modern web browser.

 No build tools, dependencies, or server setup required.

---

## Implementation Details

* Centralized state management using JavaScript objects
* UI updates handled through DOM manipulation
* Task data synchronized with LocalStorage
* Charts are destroyed and recreated to ensure accurate updates
* Logic separated into modules:

  * Calendar
  * Daily Tasks
  * Task Manager
  * Analytics

---

## Limitations

* Data is stored per browser and device only
* No backend or cloud sync
* No authentication or multi-user support
* Notifications are not included

---

## License

This project is **open-source** and intended for **educational and portfolio use**.

---

## Author

Built as a frontend practice project to demonstrate:

* UI design
* State management
* Data visualization
* Vanilla JavaScript skills
