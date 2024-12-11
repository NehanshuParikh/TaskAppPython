from flask import Flask
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    task = db.Column(db.String(200), nullable=False)
    start_date = db.Column(db.String(10), nullable=False)
    due_date = db.Column(db.String(10), nullable=False)
    person_responsible = db.Column(db.String(10), nullable=False)
    status = db.Column(db.String(20), default="Pending")