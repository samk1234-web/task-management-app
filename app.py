from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
db = SQLAlchemy(app)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, nullable=False)

class DeletedTask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    user_id = db.Column(db.Integer, nullable=False)

@app.route('/tasks', methods=['GET', 'POST'])
def tasks():
    if request.method == 'GET':
        user_id = request.args.get('user_id')
        completed = request.args.get('completed')
        if completed:
            tasks = Task.query.filter_by(user_id=user_id, completed=True).all()
        else:
            tasks = Task.query.filter_by(user_id=user_id).all()
        return jsonify([task.to_dict() for task in tasks])
    
    if request.method == 'POST':
        data = request.get_json()
        new_task = Task(title=data['title'], user_id=data['user_id'])
        db.session.add(new_task)
        db.session.commit()
        return jsonify(new_task.to_dict()), 201

@app.route('/tasks/<int:task_id>', methods=['PUT', 'DELETE'])
def task_detail(task_id):
    task = Task.query.get_or_404(task_id)

    if request.method == 'PUT':
        data = request.get_json()
        task.completed = data.get('completed', task.completed)
        db.session.commit()
        return jsonify(task.to_dict())

    if request.method == 'DELETE':
        deleted_task = DeletedTask(title=task.title, user_id=task.user_id)
        db.session.add(deleted_task)
        db.session.delete(task)
        db.session.commit()
        return '', 204

@app.route('/deleted_tasks', methods=['GET'])
def deleted_tasks():
    user_id = request.args.get('user_id')
    tasks = DeletedTask.query.filter_by(user_id=user_id).all()
    return jsonify([task.to_dict() for task in tasks])

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    # Implement your authentication logic here
    if username == 'testuser' and password == 'password':
        return '', 200
    return 'Invalid credentials', 401

if __name__ == '__main__':
    app.run(debug=True)
