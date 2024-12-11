from datetime import datetime
from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from models import db, Task
from datetime import datetime



app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
CORS(app)

@app.route('/')
def home():
    return "Task Management App is running"


@app.route('/tasks', methods=['POST'])
def create_task():
    data = request.get_json()
    
    
    # Validate required fields
    if not data.get('start_date'):
        return jsonify({"error": "Start Date is required"}), 400
    if not data.get('due_date'):
        return jsonify({"error": "Due Date is required"}), 400

    
    try:
        # Parse dates in MM-DD-YYYY format
        start_date = datetime.strptime(data['start_date'], '%m-%d-%Y').date()
        due_date = datetime.strptime(data['due_date'], '%m-%d-%Y').date()
    except ValueError:
        return jsonify({"error": "Invalid Date Format. Use 'MM-DD-YYYY'"}), 400

    current_date = datetime.now().date()
    
    # Validate that start_date is at least the current date
    if start_date < current_date:
        return jsonify({"error": "Start Date must be at least the current date"}), 400

    # Validate that due_date is greater than or equal to start_date
    if due_date < start_date:
        return jsonify({"error": "Due Date must be greater than or equal to the Start Date"}), 400

    # If all validations pass, create the task
    try:
        task = Task(
            task=data['task'],
            start_date=start_date.isoformat(),  # Convert date back to ISO format (YYYY-MM-DD) for storage
            due_date=due_date.isoformat(),      # Convert date back to ISO format (YYYY-MM-DD) for storage
            person_responsible=data['person_responsible'],
            status=data.get('status', 'Pending')
        )
        db.session.add(task)
        db.session.commit()
        return jsonify({"message": "Task Created Successfully"}), 201
    except Exception as e:
        return jsonify({"error": f"Internal Server Error: {str(e)}"}), 500
    
@app.route('/tasks', methods=['GET'])
def get_tasks():
    tasks = Task.query.all()
    tasks_list = [
        {
            "id": task.id,
            "task": task.task,
            "start_date": task.start_date,
            "due_date": task.due_date,
            "person_responsible": task.person_responsible,
            "status": task.status,
        } for task in tasks
    ]
    return jsonify(tasks_list)




@app.route('/tasks/<int:id>', methods=['PUT'])
def update_task(id):
    data = request.get_json()
    task = Task.query.get(id)
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    # Validate required fields
    if not data.get('start_date'):
        return jsonify({"error": "Start Date is required"}), 400
    if not data.get('due_date'):
        return jsonify({"error": "Due Date is required"}), 400

    
    try:
        # Parse dates in MM-DD-YYYY format
        start_date = datetime.strptime(data['start_date'], '%m-%d-%Y').date()
        due_date = datetime.strptime(data['due_date'], '%m-%d-%Y').date()
    except ValueError:
        return jsonify({"error": "Invalid Date Format. Use 'MM-DD-YYYY'"}), 400

    current_date = datetime.now().date()
    
    # Validate that start_date is at least the current date
    if start_date < current_date:
        return jsonify({"error": "Start Date must be at least the current date"}), 400

    # Validate that due_date is greater than or equal to start_date
    if due_date < start_date:
        return jsonify({"error": "Due Date must be greater than or equal to the Start Date"}), 400

    
    task.task = data.get('task', task.task)
    task.start_date = data.get('start_date', task.start_date)
    task.due_date = data.get('due_date', task.due_date)
    task.person_responsible = data.get('person_responsible', task.person_responsible)
    task.status = data.get('status', task.status)
    db.session.commit()
    return jsonify({"message": "Task Updated Successfully"})


@app.route('/tasks/<int:id>', methods=['DELETE'])
def delete_task(id):
    task = Task.query.get(id)
    if not task:
        return jsonify({"message": "Task not found"}), 404
    
    db.session.delete(task)
    db.session.commit()
    return jsonify({"message": "Task Deleted Successfully"})

@app.route('/tasks/filter', methods=['GET'])
def filter_tasks():
    # Retrieve query parameters for filtering
    person_responsible = request.args.get('person_responsible')
    status = request.args.get('status')
    
    if not person_responsible and not status:
            return jsonify({"message": "No records found"}), 404
    
    # Start with the base query for tasks
    tasks_query = Task.query
    
    # Apply filters if provided
    if person_responsible:
        tasks_query = tasks_query.filter(Task.person_responsible.ilike(f'%{person_responsible}%'))
    
    if status:
        tasks_query = tasks_query.filter(Task.status.ilike(f'%{status}%'))  # Case-insensitive partial match
    
    # Execute the query and get the filtered tasks
    tasks = tasks_query.all()
    
    # Convert the tasks to a list of dictionaries for the response
    tasks_list = [{
        'task': task.task,
        'start_date': task.start_date,
        'due_date': task.due_date,
        'person_responsible': task.person_responsible,
        'status': task.status
    } for task in tasks]
    
    return jsonify(tasks_list)


@app.route('/tasks/report', methods=['GET'])
def download_report():
    # Start with the base query for tasks (no filtering)
    tasks = Task.query.all()

    if not tasks:
        return jsonify({"message": "No records found"}), 404

    # Create a generator to yield CSV data row by row
    def generate_csv():
        # Create a CSV writer to output directly to the response stream
        yield 'ID,Task,Person Responsible,Status,Start Date,Due Date\n'
        
        # Write task data
        for task in tasks:
            yield f'{task.id},{task.task},{task.person_responsible},{task.status},{task.start_date},{task.due_date}\n'

    # Send the file as a response
    return Response(generate_csv(), 
                    mimetype='text/csv',
                    headers={"Content-Disposition": "attachment; filename=task_report.csv"})
    
    
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)