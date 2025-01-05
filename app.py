from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, UserMixin, login_user
import os

app = Flask(__name__)
CORS(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    user_id = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'completed': self.completed,
            'user_id': self.user_id
        }

class DeletedTask(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(120), nullable=False)
    user_id = db.Column(db.Integer, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'user_id': self.user_id
        }

class User(db.Model, UserMixin):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(150), nullable=False)

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

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
    user = User.query.filter_by(username=username).first()
    if user and user.check_password(password):
        login_user(user)
        return '', 200
    return 'Invalid credentials', 401

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
