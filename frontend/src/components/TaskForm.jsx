import axios from 'axios'
import React, { useEffect, useState } from 'react'

const TaskForm = () => {
    const [form, setForm] = useState({
        task: '',
        start_date: '',
        due_date: '',
        person_responsible: ''
    })

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Utility function to format date to MM-DD-YYYY
    const formatDate = (date) => {
        const [year, month, day] = date.split('-');
        return `${month}-${day}-${year}`;
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!form.start_date || !form.due_date) {
            console.log(form.start_date)
            console.log(form.due_date)
            alert("Both Start Date and Due Date are required");
            return;
        }

        // Format the dates to MM-DD-YYYY
        const formattedForm = {
            ...form,
            start_date: formatDate(form.start_date),
            due_date: formatDate(form.due_date)
        };

        console.log('Payload being sent:', formattedForm);

        axios.post('http://127.0.0.1:5000/tasks', formattedForm, {
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(() => {
            alert('Task Created Successfully')

        }).catch((error) => {
            console.error("Error while creating the tasks: ", error)
        })
    }
    return (
        <div className='w-full h-[50%] flex items-center justify-center flex-col gap-4'>
            <h2 className="">Create a Task</h2>
            <form className='flex items-center justify-center flex-col w-1/2 bg-slate-400 gap-4 py-6' onSubmit={handleSubmit}>
                <input type="text" name='task' onChange={handleChange} placeholder='Task' className="block" required />
                <input type="date" min={today} name='start_date' onChange={handleChange} placeholder='Start Date' className="block" required />
                <input type="date" min={today} name='due_date' onChange={handleChange} placeholder='Due Date' className="block" required />
                <input type="text" name='person_responsible' onChange={handleChange} placeholder='Person Responsible' className="block" required />
                <button type="submit" className='w-1/2 bg-green-500 rounded-lg'>Create Task</button>
            </form>
        </div>
    )
}

export default TaskForm