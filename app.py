import os
from datetime import datetime, timezone
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import func, extract
from models import db, User, Transaction

# ---------------------------------------------------------------------------
# App configuration
# ---------------------------------------------------------------------------
app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'expense-tracker-secret-key-2024')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///expense_tracker.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'
login_manager.login_message_category = 'info'


@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))


# ---------------------------------------------------------------------------
# Auth routes
# ---------------------------------------------------------------------------
@app.route('/')
def index():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))


@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        password = request.form.get('password', '')

        user = User.query.filter_by(username=username).first()

        if user and check_password_hash(user.password_hash, password):
            login_user(user, remember=True)
            flash('Welcome back! 🎉', 'success')
            next_page = request.args.get('next')
            return redirect(next_page or url_for('dashboard'))
        else:
            flash('Invalid username or password.', 'error')

    return render_template('login.html')


@app.route('/register', methods=['GET', 'POST'])
def register():
    if current_user.is_authenticated:
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        username = request.form.get('username', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirm_password', '')

        # Validation
        errors = []
        if not username or len(username) < 3:
            errors.append('Username must be at least 3 characters.')
        if not email or '@' not in email:
            errors.append('Please enter a valid email.')
        if not password or len(password) < 6:
            errors.append('Password must be at least 6 characters.')
        if password != confirm_password:
            errors.append('Passwords do not match.')
        if User.query.filter_by(username=username).first():
            errors.append('Username already taken.')
        if User.query.filter_by(email=email).first():
            errors.append('Email already registered.')

        if errors:
            for error in errors:
                flash(error, 'error')
        else:
            user = User(
                username=username,
                email=email,
                password_hash=generate_password_hash(password),
            )
            db.session.add(user)
            db.session.commit()
            flash('Account created successfully! Please log in. ✨', 'success')
            return redirect(url_for('login'))

    return render_template('register.html')


@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('You have been logged out.', 'info')
    return redirect(url_for('login'))


# ---------------------------------------------------------------------------
# Dashboard
# ---------------------------------------------------------------------------
@app.route('/dashboard')
@login_required
def dashboard():
    transactions = (
        Transaction.query
        .filter_by(user_id=current_user.id)
        .order_by(Transaction.date.desc(), Transaction.created_at.desc())
        .all()
    )

    total_income = sum(t.amount for t in transactions if t.type == 'income')
    total_expense = sum(t.amount for t in transactions if t.type == 'expense')
    balance = total_income - total_expense

    recent = transactions[:10]

    return render_template(
        'dashboard.html',
        transactions=recent,
        all_transactions=transactions,
        total_income=total_income,
        total_expense=total_expense,
        balance=balance,
    )


# ---------------------------------------------------------------------------
# Chart data API
# ---------------------------------------------------------------------------
@app.route('/api/chart-data')
@login_required
def chart_data():
    transactions = Transaction.query.filter_by(user_id=current_user.id).all()

    # Category breakdown (expenses only)
    category_totals = {}
    for t in transactions:
        if t.type == 'expense':
            category_totals[t.category] = category_totals.get(t.category, 0) + t.amount

    # Monthly trends (last 6 months)
    monthly_income = {}
    monthly_expense = {}
    for t in transactions:
        key = t.date.strftime('%Y-%m')
        if t.type == 'income':
            monthly_income[key] = monthly_income.get(key, 0) + t.amount
        else:
            monthly_expense[key] = monthly_expense.get(key, 0) + t.amount

    all_months = sorted(set(list(monthly_income.keys()) + list(monthly_expense.keys())))[-6:]

    return jsonify({
        'categories': {
            'labels': list(category_totals.keys()),
            'data': list(category_totals.values()),
        },
        'monthly': {
            'labels': all_months,
            'income': [monthly_income.get(m, 0) for m in all_months],
            'expense': [monthly_expense.get(m, 0) for m in all_months],
        },
    })


# ---------------------------------------------------------------------------
# Transaction CRUD
# ---------------------------------------------------------------------------
@app.route('/add', methods=['GET', 'POST'])
@login_required
def add_transaction():
    if request.method == 'POST':
        txn_type = request.form.get('type', 'expense')
        amount = request.form.get('amount', '')
        category = request.form.get('category', '')
        description = request.form.get('description', '').strip()
        date_str = request.form.get('date', '')

        # Validation
        errors = []
        if not amount:
            errors.append('Amount is required.')
        else:
            try:
                amount = float(amount)
                if amount <= 0:
                    errors.append('Amount must be positive.')
            except ValueError:
                errors.append('Invalid amount.')
        if not category:
            errors.append('Please select a category.')
        if not date_str:
            errors.append('Date is required.')

        if errors:
            for e in errors:
                flash(e, 'error')
        else:
            txn = Transaction(
                user_id=current_user.id,
                type=txn_type,
                amount=amount,
                category=category,
                description=description,
                date=datetime.strptime(date_str, '%Y-%m-%d').date(),
            )
            db.session.add(txn)
            db.session.commit()
            flash('Transaction added successfully! 💰', 'success')
            return redirect(url_for('dashboard'))

    today = datetime.now(timezone.utc).strftime('%Y-%m-%d')
    return render_template('add_transaction.html', today=today)


@app.route('/edit/<int:txn_id>', methods=['GET', 'POST'])
@login_required
def edit_transaction(txn_id):
    txn = Transaction.query.get_or_404(txn_id)

    if txn.user_id != current_user.id:
        flash('Unauthorized.', 'error')
        return redirect(url_for('dashboard'))

    if request.method == 'POST':
        txn_type = request.form.get('type', 'expense')
        amount = request.form.get('amount', '')
        category = request.form.get('category', '')
        description = request.form.get('description', '').strip()
        date_str = request.form.get('date', '')

        errors = []
        if not amount:
            errors.append('Amount is required.')
        else:
            try:
                amount = float(amount)
                if amount <= 0:
                    errors.append('Amount must be positive.')
            except ValueError:
                errors.append('Invalid amount.')
        if not category:
            errors.append('Please select a category.')
        if not date_str:
            errors.append('Date is required.')

        if errors:
            for e in errors:
                flash(e, 'error')
        else:
            txn.type = txn_type
            txn.amount = amount
            txn.category = category
            txn.description = description
            txn.date = datetime.strptime(date_str, '%Y-%m-%d').date()
            db.session.commit()
            flash('Transaction updated! ✏️', 'success')
            return redirect(url_for('dashboard'))

    return render_template('edit_transaction.html', txn=txn)


@app.route('/delete/<int:txn_id>', methods=['POST'])
@login_required
def delete_transaction(txn_id):
    txn = Transaction.query.get_or_404(txn_id)

    if txn.user_id != current_user.id:
        flash('Unauthorized.', 'error')
        return redirect(url_for('dashboard'))

    db.session.delete(txn)
    db.session.commit()
    flash('Transaction deleted. 🗑️', 'success')
    return redirect(url_for('dashboard'))


# ---------------------------------------------------------------------------
# Bootstrap
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
