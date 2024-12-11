import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskFilter = () => {
  const [tasks, setTasks] = useState([]);
  const [personResponsible, setPersonResponsible] = useState('');
  const [status, setStatus] = useState('');
  const [filteredTasks, setFilteredTasks] = useState([]);



  // Filter tasks based on person_responsible or status using the new route
  const handleFilter = () => {
    axios
      .get('http://127.0.0.1:5000/tasks/filter', {
        params: {
          person_responsible: personResponsible,
          status: status,
        },
      })
      .then((response) => {
        setFilteredTasks(response.data);
      })
      .catch((error) => {
        console.error('Error fetching filtered tasks: ', error);
        setFilteredTasks([])
      });
  };

  return (
    <div>
      <h2>Filter Tasks</h2>

      <div>
        <input
          type="text"
          placeholder="Search by Person Responsible"
          value={personResponsible}
          onChange={(e) => setPersonResponsible(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        />
        <button onClick={handleFilter}>Filter</button>
      </div>

      <div>
        <h3>Filtered Tasks</h3>
        <ul>
          {filteredTasks.length === 0 ? (
            <p>No records found</p>
          ) : (
            <ul>
              {filteredTasks.map((task, index) => (
                <li key={index}>
                  <strong>Task:</strong> {task.task} | <strong>Person Responsible:</strong> {task.person_responsible} | <strong>Status:</strong> {task.status} | <strong>Start Date:</strong> {task.start_date} | <strong>Due Date:</strong> {task.due_date}
                </li>
              ))}
            </ul>
          )}

        </ul>
      </div>
    </div>
  );
};

export default TaskFilter;
