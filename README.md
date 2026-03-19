# Real-Time Bus Tracking System

## Overview

This project is a web application built using Python that helps users track a bus in real time. It shows the live location of the bus, calculates how far it is from the destination, and sends alerts as the bus gets closer. The goal is to make daily travel more predictable and less stressful.

---

## Features

* Tracks the live location of the bus
* Calculates distance between current location and destination
* Sends alerts at different intervals (5 km, 3 km, and on arrival)
* Displays route on a map
* Can be accessed on mobile using ngrok

---

## Technologies Used

* Python (Django)
* HTML, CSS, JavaScript
* OpenRouteService API for maps and routing
* ngrok for mobile access

---

## How to Run

1. Clone the repository

```bash
git clone https://github.com/your-username/realtime-bus-tracker.git
cd realtime-bus-tracker
```

2. Install dependencies

```bash
pip install -r requirements.txt
```

3. Start the server

```bash
python manage.py runserver
```

4. Open in browser
   http://127.0.0.1:8000/

---

## Running on Mobile

Start ngrok with:

```bash
ngrok http 8000
```

Use the generated link on your phone to access the app.

---

## Future Improvements

* Support for tracking multiple buses
* User login and saved routes
* Integration with real-time transport APIs
* Push notifications instead of browser alerts

---

## About the Project

I built this project to understand how real-time tracking systems work and how location-based services can improve everyday problems like commuting.
