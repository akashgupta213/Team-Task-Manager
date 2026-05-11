import { useState, useEffect } from 'react'
import { taskAPI, projectAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { Card, Badge, Select, Spinner, EmptyState } from '../components/ui/UI'
import styles from './Tasks.module.css'

export default function Tasks() {
  const { user } = useAuth()
  const [tasks, setTasks]         = useState([])
  const [projects, setProjects]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [filter, setFilter]       = useState('ALL')

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data: raw } = await projectAPI.getAll()

        // Guard: ensure we always work with a clean array
        const projs = Array.isArray(raw) ? raw.filter(Boolean) : []
        setProjects(projs)

        const results = await Promise.all(projs.map(p => taskAPI.getByProject(p._id)))
        const allTasks = results.flatMap(r => Array.isArray(r.data) ? r.data : [])
        setTasks(allTasks)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskAPI.updateStatus(taskId, status)
      setTasks(prev => prev.map(t => t._id === taskId ? { ...t, status } : t))
    } catch (e) {
      console.error(e)
    }
  }

  const filtered = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter)

  if (loading) return <div className={styles.loadingWrap}><Spinner size={32} /></div>

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Tasks</h1>
          <p className={styles.sub}>All tasks across your {projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <select
          className={styles.filterSelect}
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="ALL">All status</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="◎" title="No tasks found" description="Tasks assigned to you will appear here" />
      ) : (
        <div className={styles.list}>
          {filtered.map(task => (
            <Card key={task._id} className={styles.taskCard}>
              <div className={styles.taskLeft}>
                <div className={`${styles.statusDot} ${styles[task.status]}`} />
                <div>
                  <div className={styles.taskTitle}>{task.title}</div>
                  {task.description && <p className={styles.taskDesc}>{task.description}</p>}
                  <div className={styles.taskMeta}>
                    {task.assignedTo && (
                      <span>👤 {task.assignedTo.name}</span>
                    )}
                    {task.dueDate && (
                      <span className={isOverdue(task) ? styles.overdue : ''}>
                        📅 {new Date(task.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})}
                        {isOverdue(task) && ' · Overdue'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.taskRight}>
                <Badge value={task.status} />
                {task.status !== 'DONE' && (
                  <select
                    className={styles.statusSelect}
                    value={task.status}
                    onChange={e => handleStatusChange(task._id, e.target.value)}
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function isOverdue(task) {
  return task.status !== 'DONE' && new Date(task.dueDate) < new Date()
}