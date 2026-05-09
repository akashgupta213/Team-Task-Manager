import { useState, useEffect } from 'react'
import { projectAPI, taskAPI } from '../api'
import { useAuth } from '../context/AuthContext'
import { Card, Button, Input, Textarea, Modal, Badge, Spinner, Alert, Select, EmptyState } from '../components/ui/UI'
import styles from './ProjectDetail.module.css'

export default function ProjectDetail({ project, onBack }) {
  const { user } = useAuth()
  const [members, setMembers]       = useState([])
  const [tasks, setTasks]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [activeTab, setActiveTab]   = useState('tasks')
  const [myRole, setMyRole]         = useState('MEMBER')

  // Modals
  const [showAddMember, setShowAddMember] = useState(false)
  const [showAddTask,   setShowAddTask]   = useState(false)

  // Forms
  const [memberForm, setMemberForm] = useState({ userId: '', role: 'MEMBER' })
  const [taskForm,   setTaskForm]   = useState({ title: '', description: '', assignedTo: '', dueDate: '' })
  const [memberErr, setMemberErr]   = useState('')
  const [taskErr,   setTaskErr]     = useState('')
  const [saving,    setSaving]      = useState(false)

  const fetchData = async () => {
    try {
      const [membRes, taskRes] = await Promise.all([
        projectAPI.getMembers(project._id),
        taskAPI.getByProject(project._id),
      ])
      setMembers(membRes.data)
      setTasks(taskRes.data)
      const me = membRes.data.find(m => m.userId?._id === user._id)
      if (me) setMyRole(me.role)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [project._id])

  const handleAddMember = async (e) => {
    e.preventDefault()
    setMemberErr('')
    setSaving(true)
    try {
      await projectAPI.addMember(project._id, memberForm)
      setMemberForm({ userId: '', role: 'MEMBER' })
      setShowAddMember(false)
      fetchData()
    } catch (err) {
      setMemberErr(err.response?.data?.message || 'Failed to add member')
    } finally {
      setSaving(false)
    }
  }

  const handleAddTask = async (e) => {
    e.preventDefault()
    setTaskErr('')
    setSaving(true)
    try {
      await taskAPI.create({ ...taskForm, projectId: project._id })
      setTaskForm({ title: '', description: '', assignedTo: '', dueDate: '' })
      setShowAddTask(false)
      fetchData()
    } catch (err) {
      setTaskErr(err.response?.data?.message || 'Failed to create task')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (taskId, status) => {
    try {
      await taskAPI.updateStatus(taskId, status)
      fetchData()
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) return <div className={styles.loadingWrap}><Spinner size={32} /></div>

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={onBack}>← Back to Projects</button>

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.avatar}>{project.name.charAt(0).toUpperCase()}</div>
          <div>
            <h1 className={styles.title}>{project.name}</h1>
            <p className={styles.sub}>{project.description}</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          {myRole === 'ADMIN' && (
            <>
              <Button variant="secondary" size="sm" onClick={() => setShowAddMember(true)}>+ Add Member</Button>
              <Button size="sm" onClick={() => setShowAddTask(true)}>+ Add Task</Button>
            </>
          )}
        </div>
      </div>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab==='tasks'?styles.tabActive:''}`} onClick={() => setActiveTab('tasks')}>
          Tasks ({tasks.length})
        </button>
        <button className={`${styles.tab} ${activeTab==='members'?styles.tabActive:''}`} onClick={() => setActiveTab('members')}>
          Members ({members.length})
        </button>
      </div>

      {activeTab === 'tasks' && (
        <div className={styles.taskBoard}>
          {['TODO','IN_PROGRESS','DONE'].map(status => (
            <div key={status} className={styles.column}>
              <div className={styles.colHeader}>
                <Badge value={status} />
                <span className={styles.colCount}>
                  {tasks.filter(t => t.status === status).length}
                </span>
              </div>
              <div className={styles.colTasks}>
                {tasks.filter(t => t.status === status).length === 0 && (
                  <p className={styles.colEmpty}>No tasks</p>
                )}
                {tasks.filter(t => t.status === status).map(task => (
                  <Card key={task._id} className={styles.taskCard}>
                    <div className={styles.taskTitle}>{task.title}</div>
                    {task.description && <p className={styles.taskDesc}>{task.description}</p>}
                    {task.assignedTo && (
                      <div className={styles.taskAssigned}>
                        <div className={styles.miniAvatar}>{task.assignedTo.name?.charAt(0)}</div>
                        {task.assignedTo.name}
                      </div>
                    )}
                    {task.dueDate && (
                      <div className={`${styles.dueDate} ${isOverdue(task) ? styles.overdueText : ''}`}>
                        📅 {new Date(task.dueDate).toLocaleDateString('en-US',{month:'short',day:'numeric'})}
                        {isOverdue(task) && ' · Overdue'}
                      </div>
                    )}
                    {myRole === 'ADMIN' && task.status !== 'DONE' && (
                      <Select
                        value={task.status}
                        onChange={e => handleStatusChange(task._id, e.target.value)}
                        style={{ marginTop: 10, fontSize: 12, padding: '6px 10px' }}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </Select>
                    )}
                    {myRole === 'MEMBER' && task.assignedTo?._id === user._id && task.status !== 'DONE' && (
                      <Select
                        value={task.status}
                        onChange={e => handleStatusChange(task._id, e.target.value)}
                        style={{ marginTop: 10, fontSize: 12, padding: '6px 10px' }}
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </Select>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'members' && (
        <div className={styles.membersList}>
          {members.map(m => (
            <Card key={m._id} className={styles.memberCard}>
              <div className={styles.memberAvatar}>{m.userId?.name?.charAt(0)}</div>
              <div className={styles.memberInfo}>
                <div className={styles.memberName}>{m.userId?.name}</div>
                <div className={styles.memberEmail}>{m.userId?.email}</div>
              </div>
              <Badge value={m.role} />
            </Card>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      <Modal isOpen={showAddMember} onClose={() => setShowAddMember(false)} title="Add Member">
        <form onSubmit={handleAddMember}>
          <Alert message={memberErr} />
          <Input label="User ID" placeholder="user's _id"
            value={memberForm.userId}
            onChange={e => setMemberForm(p => ({ ...p, userId: e.target.value }))} required />
          <Select label="Role" value={memberForm.role}
            onChange={e => setMemberForm(p => ({ ...p, role: e.target.value }))}>
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </Select>
          <Button type="submit" fullWidth loading={saving}>Add Member</Button>
        </form>
      </Modal>

      {/* Add Task Modal */}
      <Modal isOpen={showAddTask} onClose={() => setShowAddTask(false)} title="Create Task">
        <form onSubmit={handleAddTask}>
          <Alert message={taskErr} />
          <Input label="Task title" placeholder="e.g. Design the homepage"
            value={taskForm.title}
            onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))} required />
          <Textarea label="Description" placeholder="What needs to be done?"
            value={taskForm.description}
            onChange={e => setTaskForm(p => ({ ...p, description: e.target.value }))} required />
          <Select label="Assign to" value={taskForm.assignedTo}
            onChange={e => setTaskForm(p => ({ ...p, assignedTo: e.target.value }))} required>
            <option value="">Select member...</option>
            {members.map(m => (
              <option key={m.userId?._id} value={m.userId?._id}>{m.userId?.name}</option>
            ))}
          </Select>
          <Input label="Due date" type="date"
            value={taskForm.dueDate}
            onChange={e => setTaskForm(p => ({ ...p, dueDate: e.target.value }))} required />
          <Button type="submit" fullWidth loading={saving}>Create Task</Button>
        </form>
      </Modal>
    </div>
  )
}

function isOverdue(task) {
  return task.status !== 'DONE' && new Date(task.dueDate) < new Date()
}
