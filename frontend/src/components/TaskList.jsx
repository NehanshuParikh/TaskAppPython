import axios from 'axios'
import React, { useEffect, useState } from 'react'

const TaskList = () => {
    const [tasks, setTasks] = useState([])
    const [editingTask, setEditingTask] = useState(null)
    const [upDatedTask, setUpDatedTask] = useState({
        task: '',
        start_date: '',
        due_date: '',
        person_responsible: '',
        status: ''
    })

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Utility function to format date to MM-DD-YYYY
    const formatDate = (date) => {
        const [year, month, day] = date.split('-');
        return `${month}-${day}-${year}`;
    };

    const startEdit = (task) => {
        setEditingTask(task.id)
        setUpDatedTask(task);
    }

    const fetchTasks = () => {
        axios.get('http://127.0.0.1:5000/tasks').then((response) => {
            setTasks(response.data)
        }).catch((error) => {
            console.error("Error while fetching the tasks: ", error)
        })
    }

    const handleChange = (e) => {
        setUpDatedTask({ ...upDatedTask, [e.target.name]: e.target.value })
    }

    const handleUpdate = (e) => {
        e.preventDefault()

        // Format the dates to MM-DD-YYYY
        const formattedForm = {
            ...upDatedTask,
            start_date: formatDate(upDatedTask.start_date),
            due_date: formatDate(upDatedTask.due_date)
        };

        axios.put(`http://localhost:5000/tasks/${editingTask}`, formattedForm).then((response) => {
            setEditingTask(null)
            fetchTasks()
        }).catch((error) => {
            console.error("Error while updating the Task: ", error)
        })
    }

    const handleDelete = (id) => {
        axios.delete(`http://127.0.0.1:5000/tasks/${id}`).then(() => {
            fetchTasks();
        }).catch((error) => {
            console.error("Error at deleting the task: ", error);

        })
    }

    useEffect(() => {
        fetchTasks()
    }, [])

    // Handle download of the report (CSV)
    const handleDownload = () => {
        axios.get('http://127.0.0.1:5000/tasks/report', {
            responseType: 'blob',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
                // Create a Blob from the response data
                const blob = new Blob([response.data], { type: 'text/csv' });
                // Create an anchor element to trigger the download
                const link = document.createElement('a');
                const url = window.URL.createObjectURL(blob);
                link.href = url;
                link.setAttribute('download', 'task_report.csv'); // Set the filename
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link); // Remove the link after download
            })
            .catch((error) => {
                console.error("Error while downloading the report:", error);
            });
    };

    return (
        <div>
            <h2 className="">TaskList</h2>
            <ul className="">
                {tasks.map(task => {
                    return <li key={task.id} className="">{task.task} - {task.status} <button onClick={() => startEdit(task)}>Edit</button> <button onClick={() => handleDelete(task.id)}>Delete</button></li>
                })}
            </ul>
            <button onClick={handleDownload} className="download-button">
        Download Report
      </button>
            {editingTask && (
                <form className='flex items-center justify-center flex-col w-1/2 bg-slate-400 gap-4 py-6' onSubmit={handleUpdate}>
                    <input type="text" name='task' value={upDatedTask.task} onChange={handleChange} placeholder='Task' className="block" required />
                    <input type="date" min={today} name='start_date' value={upDatedTask.start_date} onChange={handleChange} placeholder='Start Date' className="block" required />
                    <input type="date" min={today} name='end_date' value={upDatedTask.due_date} onChange={handleChange} placeholder='End Date' className="block" required />
                    <input type="text" name='person_responsible' value={upDatedTask.person_responsible} onChange={handleChange} placeholder='Person Responsible' className="block" required />
                    <select
                        value={upDatedTask.status}
                        onChange={(e) =>
                            setUpDatedTask({ ...upDatedTask, status: e.target.value })
                        }
                    >
                        <option value="Not Started">Not Started</option>
                        <option value="In-Progress">In-Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                    <button type="submit" className='w-1/2 bg-green-500 rounded-lg'>Update Task</button>
                    <button onClick={() => setEditingTask(null)} className='w-1/2 bg-red-500 rounded-lg'>Cancel Upate</button>
                </form>
            )}
        </div>
    )
}

export default TaskList