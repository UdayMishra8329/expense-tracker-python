->Money Expense Tracker

A simple and modern personal finance tracking web application built with Flask. 
This project helps users manage their income and expenses, view financial summaries, and analyze spending trends through a clean dashboard.

->Features

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

 ->Technologies Used :-

This project is developed using python and its supporting libraries.

* Python
* Flask
* Flask-login
* SQLlite
* CSS3
* HTML5
* JavaScript
* Flask-SQLAlchemy(as my database)

 ->Project Structure:-

Expense Tracker/
|
|--_pycache_/
|    |--models.cppython-313.pyc
|
|--static/
|    |--css/
|        |--style.css
|    |--js/
|        |--main.js
|--instance/
|    |--expense_tracker.db
|--templates/
|    |--add_transactional.html
|    |--base.html
|    |--dashboard.html
|    |--edit_transaction.html
|    |--login.html
|    |--register.html
|
|--app.py
|--models.py
|--requirements.txt
|--README.md

->Prerequisite

make sure you have the following installed:
--Python 3.8 or higher 
--pip

->Installation

1. Clone or download the project folder.
2. Open the project directory:
   
   cd "Money expense tracker"
   
3. Create a virtual environment:
   
   python -m venv venv
   
4. Activate the virtual environment:
   - On Windows:
     
     venv\Scripts\activate
     
5. Install the required packages:
   
   pip install -r requirements.txt
   
6. Run the application:
   
   python app.py
   
7. Open your browser and visit:
   
   http://127.0.0.1:5000

->How to Use

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

->Database

The app uses SQLite by default. On first run, the database file named expense_tracker.db will be created automatically in the project folder.

->Notes

- The app runs in debug mode by default for development.
- If you want to stop the server, press Ctrl + C in the terminal.

-> License

No license has been specified for this project yet.

->Author

UDAY MISHRA 
