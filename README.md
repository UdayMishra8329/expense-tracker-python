# Money Expense Tracker

A simple and modern personal finance tracking web application built with Flask. This project helps users manage their income and expenses, view financial summaries, and analyze spending trends through a clean dashboard.

## Features

- User registration and login system
- Secure authentication using Flask-Login
- Add, edit, and delete income/expense transactions
- Dashboard with summary cards for:
  - Total balance
  - Total income
  - Total expenses
- Visual charts for:
  - Spending by category
  - Monthly income vs expense trends
- Persistent data storage using SQLite

## Tech Stack

- Python
- Flask
- Flask-Login
- Flask-SQLAlchemy
- SQLite
- HTML, CSS, and JavaScript

## Project Structure

- app.py - Main Flask application and routes
- models.py - Database models for users and transactions
- templates/ - HTML templates for login, dashboard, forms, and layout
- static/ - CSS and JavaScript files
- requirements.txt - Python dependencies
- instance/ - Application instance folder

## Prerequisites

Make sure you have the following installed:

- Python 3.8 or higher
- pip

## Installation

1. Clone or download the project folder.
2. Open the project directory:
   ```bash
   cd "Money expense tracker"
   ```
3. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
4. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
5. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```
6. Run the application:
   ```bash
   python app.py
   ```
7. Open your browser and visit:
   ```text
   http://127.0.0.1:5000
   ```

## How to Use

1. Register a new account or log in.
2. Add a transaction by entering:
   - type (income or expense)
   - amount
   - category
   - description
   - date
3. View your dashboard to see:
   - total balance
   - income and expense summaries
   - recent transactions
   - charts for spending analysis
4. Edit or delete transactions anytime from the dashboard.

## Database

The app uses SQLite by default. On first run, the database file named expense_tracker.db will be created automatically in the project folder.

## Environment Variables

You can customize the secret key by setting:

```bash
set SECRET_KEY=your_secret_key
```

## Notes

- The app runs in debug mode by default for development.
- If you want to stop the server, press Ctrl + C in the terminal.

## License

No license has been specified for this project yet.
