import { useState, useEffect } from 'react'
import { dashboardAPI, taskAPI, projectAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { Card, Badge, Spinner } from '../components/ui/UI'
import styles from './Dashboard.module.css'

const StatCard = ({ label, value, color, icon }) => (
  <Card className={styles.statCard}>
    <div className={styles.statIcon} style={{ background: `var(--${color}-soft)`, color: `var(--${color})` }}>
      {icon}
    </div>
    <div>
      <div className={styles.statValue} style={{ color: `var(--${color})` }}>{value}</div>
      <div className={styles.statLabel}>{label}</div>
    </div>
  </Card>
)

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentTasks, setRecentTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          dashboardAPI.getStats(),
          projectAPI.getAll(),
        ])
        setStats(statsRes.data)

        // Guard: ensure we always work with a clean array
        const safeProjects = Array.isArray(projectsRes.data)
          ? projectsRes.data.filter(Boolean)
          : []
        setProjects(safeProjects)

        // fetch tasks from first 2 projects
        const taskPromises = safeProjects.slice(0, 2).map(p =>
          taskAPI.getByProject(p._id)
        )
        const taskResults = await Promise.all(taskPromises)
        const allTasks = taskResults
          .flatMap(r => Array.isArray(r.data) ? r.data : [])
          .slice(0, 8)
        setRecentTasks(allTasks)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  if (loading) return (
    <div className={styles.loadingWrap}>
      <Spinner size={32} />
    </div>
  )

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>
            Good {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className={styles.sub}>Here's what's happening across your projects</p>
        </div>
        <div className={styles.date}>{new Date().toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric' })}</div>
      </div>

      <div className={styles.statsGrid}>
        <StatCard label="Total Tasks"   value={stats?.total || 0}      color="accent" icon="◎" />
        <StatCard label="Completed"     value={stats?.completed || 0}  color="green"  icon="✓" />
        <StatCard label="In Progress"   value={stats?.inProgress || 0} color="amber"  icon="◑" />
        <StatCard label="Overdue"       value={stats?.overdue || 0}    color="red"    icon="⚠" />
      </div>

      <div className={styles.grid2}>
        <div>
          <h2 className={styles.sectionTitle}>Recent Tasks</h2>
          <div className={styles.taskList}>
            {recentTasks.length === 0 && (
              <p className={styles.empty}>No tasks yet. Create a project and add tasks.</p>
            )}
            {recentTasks.map(task => (
              <Card key={task._id} className={styles.taskItem}>
                <div className={styles.taskTop}>
                  <span className={styles.taskTitle}>{task.title}</span>
                  <Badge value={task.status} />
                </div>
                {task.assignedTo && (
                  <div className={styles.taskMeta}>
                    Assigned to <strong>{task.assignedTo.name}</strong>
                    {task.dueDate && (
                      <span className={isOverdue(task) ? styles.overdue : styles.dueDate}>
                        · Due {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className={styles.sectionTitle}>My Projects ({projects.length})</h2>
          <div className={styles.projectList}>
            {projects.length === 0 && (
              <p className={styles.empty}>No projects yet.</p>
            )}
            {projects.map(p => (
              <Card key={p._id} className={styles.projectItem}>
                <div className={styles.projectAvatar}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className={styles.projectName}>{p.name}</div>
                  <div className={styles.projectDesc}>{p.description || 'No description'}</div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'morning'
  if (h < 17) return 'afternoon'
  return 'evening'
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function isOverdue(task) {
  return task.status !== 'DONE' && new Date(task.dueDate) < new Date()
}