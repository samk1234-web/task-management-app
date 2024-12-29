from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

# Initialize the database
DATABASE = 'tasks.db'

def init_db():
    if not os.path.exists(DATABASE):
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                completed BOOLEAN NOT NULL DEFAULT 0,
                user_id INTEGER NOT NULL
            )
        ''')
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            )
        ''')
        # Insert a default user for testing
        cursor.execute('''
            INSERT OR IGNORE INTO users (username, password)
            VALUES ('admin', 'admin')
        ''')
        conn.commit()
        conn.close()
    else:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        cursor.execute('PRAGMA table_info(tasks)')
        columns = [column[1] for column in cursor.fetchall()]
        if 'user_id' not in columns:
            cursor.execute('ALTER TABLE tasks ADD COLUMN user_id INTEGER NOT NULL DEFAULT 1')
        conn.commit()
        conn.close()

init_db()

# API Endpoints
@app.route('/api/tasks', methods=['GET'])
def get_tasks():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({'error': 'User ID is required'}), 400

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM tasks WHERE user_id = ?', (user_id,))
    tasks = [{'id': row[0], 'title': row[1], 'completed': bool(row[2]), 'user_id': row[3]} for row in cursor.fetchall()]
    conn.close()
    return jsonify(tasks)

@app.route('/api/tasks', methods=['POST'])
def add_task():
    data = request.get_json()
    title = data.get('title')
    user_id = data.get('user_id')

    # Debugging Logs
    print("Received data:", data)
    print("Title:", title)
    print("User ID:", user_id)

    if not title or not user_id:
        return jsonify({'error': 'Title and User ID are required'}), 400

    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        cursor.execute('INSERT INTO tasks (title, completed, user_id) VALUES (?, ?, ?)', (title, False, user_id))
        conn.commit()
        task_id = cursor.lastrowid
        conn.close()
        return jsonify({'id': task_id, 'title': title, 'completed': False, 'user_id': user_id})
    except Exception as e:
        print("Error:", str(e))
        return jsonify({'error': str(e)}), 500

@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    data = request.get_json()
    completed = data.get('completed')
    if completed is None:
        return jsonify({'error': 'Completed status is required'}), 400

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('UPDATE tasks SET completed = ? WHERE id = ?', (completed, task_id))
    conn.commit()
    conn.close()
    return jsonify({'id': task_id, 'completed': completed})

@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM tasks WHERE id = ?', (task_id,))
    conn.commit()
    conn.close()
    return '', 204

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400

    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('SELECT id FROM users WHERE username = ? AND password = ?', (username, password))
    user = cursor.fetchone()
    conn.close()

    if user:
        return jsonify({'message': 'Login successful', 'user_id': user[0]})
    else:
        return jsonify({'error': 'Invalid username or password'}), 401

@app.route('/', methods=['GET'])
def home():
    return 'Task API is running.'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)