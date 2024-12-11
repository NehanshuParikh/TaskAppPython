import React from 'react'
import TaskForm from './TaskForm'
import TaskList from './TaskList'
import TaskFilter from './TaskFilter'
TaskFilter
const TaskManager = () => {
  return (
    <div className='h-full'>
        <h1 className="">Task Manager</h1>
        <TaskForm />
        <TaskFilter />
        <TaskList />
    </div>
  )
}

export default TaskManager